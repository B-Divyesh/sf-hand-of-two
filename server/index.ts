import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { WebSocket, WebSocketServer } from 'ws';
import type { Seat } from '../shared/game';
import type { ClientMessage, ServerMessage } from '../shared/protocol';
import { RoomStore } from './room-store';

const port = Number(process.env.PORT ?? 8787);
const dataDirectory = process.env.DATA_DIR ?? '/data';
const origin = process.env.PUBLIC_ORIGIN ?? 'https://hand-of-two.sociobot.in';
const databasePath = resolve(dataDirectory, 'rooms-v2.sqlite');

async function openRoomStore(): Promise<RoomStore> {
  for (let attempt = 1; attempt <= 20; attempt += 1) {
    try {
      return new RoomStore(databasePath);
    } catch (error) {
      const isLocked = error instanceof Error && error.message.includes('database is locked');
      if (!isLocked || attempt === 20) throw error;
      await new Promise((resolveWait) => setTimeout(resolveWait, 3000));
    }
  }
  throw new Error('The room database did not become available.');
}

const store = await openRoomStore();
const app = new Hono();
const rateBuckets = new Map<string, number[]>();

app.use('/api/*', cors({ origin: [origin, 'http://127.0.0.1:4173', 'http://localhost:4173'] }));
app.use('*', async (context, next) => {
  await next();
  context.header('X-Content-Type-Options', 'nosniff');
  context.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  context.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  context.header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
});

function clientAddress(context: { req: { header(name: string): string | undefined } }): string {
  return context.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
}

function limited(key: string): boolean {
  const now = Date.now();
  const recent = (rateBuckets.get(key) ?? []).filter((time) => now - time < 60_000);
  if (recent.length >= 12) return true;
  recent.push(now);
  rateBuckets.set(key, recent);
  return false;
}

app.get('/api/health', (context) => context.json({ status: store.health() ? 'ok' : 'error' }, store.health() ? 200 : 503));
app.post('/api/rooms', (context) => {
  if (limited(`create:${clientAddress(context)}`)) {
    context.header('Retry-After', '60');
    return context.json({ error: 'Too many room requests. Wait one minute and try again.' }, 429);
  }
  return context.json(store.createRoom(), 201);
});
app.post('/api/rooms/:code/join', (context) => {
  if (limited(`join:${clientAddress(context)}`)) {
    context.header('Retry-After', '60');
    return context.json({ error: 'Too many join requests. Wait one minute and try again.' }, 429);
  }
  try {
    return context.json(store.joinRoom(context.req.param('code')), 201);
  } catch (error) {
    return context.json({ error: error instanceof Error ? error.message : 'The room could not be joined.' }, 409);
  }
});
app.get('/api/rooms/:code', (context) => {
  try {
    return context.json(store.getPublicStatus(context.req.param('code')));
  } catch (error) {
    return context.json({ error: error instanceof Error ? error.message : 'The room was not found.' }, 404);
  }
});

app.use('/*', serveStatic({ root: './dist' }));
const appRoutes = ['/', '/demo', '/play', '/settings', '/privacy', '/terms'];
for (const route of appRoutes) app.get(route, serveStatic({ path: './dist/index.html' }));
app.notFound((context) => {
  try {
    return context.html(readFileSync(resolve('dist/404.html'), 'utf8'), 404);
  } catch {
    return context.text('Page not found', 404);
  }
});

const server = serve({ fetch: app.fetch, port });
const socketServer = new WebSocketServer({ noServer: true, maxPayload: 8 * 1024 });
const roomSockets = new Map<string, Map<Seat, WebSocket>>();

function send(socket: WebSocket, message: ServerMessage): void {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function broadcast(code: string): void {
  const sockets = roomSockets.get(code);
  if (!sockets) return;
  const connected = new Set(sockets.keys());
  for (const [seat, socket] of sockets) send(socket, { type: 'state', state: store.getView(code, seat, connected) });
}

server.on('upgrade', (request, socket, head) => {
  const path = new URL(request.url ?? '/', `http://${request.headers.host}`).pathname;
  if (path !== '/ws') {
    socket.destroy();
    return;
  }
  socketServer.handleUpgrade(request, socket, head, (webSocket) => socketServer.emit('connection', webSocket));
});

socketServer.on('connection', (socket) => {
  let roomCode: string | undefined;
  let playerSeat: Seat | undefined;
  const authTimer = setTimeout(() => socket.close(1008, 'Authentication timed out'), 5000);
  socket.on('message', (raw) => {
    try {
      const message = JSON.parse(raw.toString()) as ClientMessage;
      if (!roomCode || !playerSeat) {
        if (message.type !== 'auth') throw new Error('Open the room again to reconnect.');
        roomCode = message.code.trim().toUpperCase();
        playerSeat = store.authenticate(roomCode, message.playerToken);
        clearTimeout(authTimer);
        const sockets = roomSockets.get(roomCode) ?? new Map<Seat, WebSocket>();
        const prior = sockets.get(playerSeat);
        if (prior && prior !== socket) prior.close(1000, 'Reconnected in another tab');
        sockets.set(playerSeat, socket);
        roomSockets.set(roomCode, sockets);
        send(socket, { type: 'ready', seat: playerSeat });
        broadcast(roomCode);
        return;
      }
      if (message.type === 'ping') {
        send(socket, { type: 'pong' });
      } else if (message.type === 'draft') {
        store.draft(roomCode, playerSeat, message.cardIds);
        broadcast(roomCode);
      } else if (message.type === 'move') {
        store.move(roomCode, playerSeat, { cardId: message.cardId, target: message.target });
        broadcast(roomCode);
      } else if (message.type === 'rematch') {
        store.rematch(roomCode, playerSeat);
        broadcast(roomCode);
      }
    } catch (error) {
      send(socket, { type: 'error', message: error instanceof Error ? error.message : 'The room message was not accepted.' });
    }
  });
  socket.on('close', () => {
    clearTimeout(authTimer);
    if (!roomCode || !playerSeat) return;
    const sockets = roomSockets.get(roomCode);
    if (sockets?.get(playerSeat) === socket) sockets.delete(playerSeat);
    if (sockets?.size === 0) roomSockets.delete(roomCode);
    else broadcast(roomCode);
  });
});

const shutdown = (): void => {
  socketServer.close();
  server.close(() => {
    store.close();
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
