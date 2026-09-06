import './style.css';
import {
  LOCATIONS,
  createGame,
  getEpilogue,
  submitChoice,
  submitDraft,
  totalScore,
  type GameCard,
  type GameState,
  type Location,
  type Seat
} from '../shared/game';
import type { ClientMessage, PlayerView, ServerMessage } from '../shared/protocol';

const app = document.querySelector<HTMLDivElement>('#app')!;
if (!app) throw new Error('The app container is missing.');

const BUILD_ID = '1.0.0';
const PRODUCT_ORIGIN = 'https://hand-of-two.sociobot.in';
let pageCleanup: (() => void) | undefined;
let activeRoute = '';

const titles: Record<string, string> = {
  '/': 'Hand of Two — draft and predict a friend',
  '/demo': 'Demo — Hand of Two',
  '/play': 'Play online — Hand of Two',
  '/settings': 'Settings — Hand of Two',
  '/privacy': 'Privacy — Hand of Two',
  '/terms': 'Terms — Hand of Two'
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]!);
}

function shell(content: string, route: string, demoBanner = ''): string {
  return `
    <a class="skip-link" href="#main">Skip to game</a>
    <header class="site-header">
      <a class="wordmark" href="/" data-link aria-label="Hand of Two home">
        <svg aria-hidden="true" viewBox="0 0 48 48"><path d="M8 36 19 9l6 18 7-14 8 23H8Z"/><path d="M12 30h25"/></svg>
        <span>Hand of Two</span>
      </a>
      <nav aria-label="Main navigation">
        <a href="/play" data-link ${route === '/play' ? 'aria-current="page"' : ''}>Play</a>
        <a href="/demo" data-link ${route === '/demo' ? 'aria-current="page"' : ''}>Demo</a>
        <a href="/settings" data-link ${route === '/settings' ? 'aria-current="page"' : ''}>Settings</a>
        <a href="/privacy" data-link ${route === '/privacy' ? 'aria-current="page"' : ''}>Privacy</a>
      </nav>
    </header>
    ${demoBanner}
    <main id="main" tabindex="-1">${content}</main>
    <footer class="site-footer">
      <p>Draft cards and predict a friend’s moves.</p>
      <nav aria-label="Footer navigation"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://sociobot.in" rel="external">Built by Param Factory <span class="sr-only">(external site)</span></a></nav>
      <p>Original code-made art · Version ${BUILD_ID}</p>
    </footer>
    <div class="sr-only" aria-live="polite" id="route-announcer"></div>`;
}

function demoBanner(): string {
  return `<aside class="demo-banner" aria-label="Demo status">
    <strong>Demo — sample data, nothing is saved</strong>
    <div><button class="text-button" type="button" data-reset-demo>Reset demo</button><a href="/play" data-link>Start for real</a></div>
  </aside>`;
}

function homePage(): string {
  return shell(`
    <section class="first-screen contour-panel" aria-labelledby="home-title">
      <div class="hero-copy">
        <p class="eyebrow">Two-player browser card duel</p>
        <h1 id="home-title">Draft cards and predict the other player’s moves</h1>
        <p class="lede">For couples and friends who want to outscore each other in six turns, without accounts or collectible decks.</p>
        <div class="mobile-game-strip" aria-label="Example active game on turn four of six"><strong>Turn 4 of 6</strong><span>You 11 · Other 11</span><span>Choose a hidden move</span></div>
        <div class="hero-actions">
          <a class="button primary" href="/demo" data-link>Try it with sample data</a>
          <span>Starts a private practice match against a predictable bot.</span>
        </div>
        <a class="button secondary" href="/play" data-link>Create a two-player room</a>
        <ul class="plain-facts" aria-label="Game facts">
          <li>Two independent browser clients per room.</li>
          <li>No account, chat, analytics, or collectible cards.</li>
          <li>$8 USD once for the complete deck and scenario packs.</li>
        </ul>
      </div>
      <div class="table-preview" aria-label="Example of active play on turn four of six">
        <div class="preview-heading"><span>Turn 4 of 6</span><span>Crosswind pass</span></div>
        ${scoreGrid({ north: { ridge: 5, river: 2, camp: 4 }, south: { ridge: 3, river: 6, camp: 2 } }, 'north')}
        <p class="preview-prompt">Choose one card and one place. Both moves reveal together.</p>
        <div class="card-row preview-cards">
          ${cardHtml({ id: 'preview-1', kind: 'wind-gauge', name: 'Wind gauge', short: 'Move 1. Gain 2 if both choose the same place.', advance: 1, guard: 0, disrupt: 0 }, false, true)}
          ${cardHtml({ id: 'preview-2', kind: 'canvas-screen', name: 'Canvas screen', short: 'Move 1. Block 2 disruption.', advance: 1, guard: 2, disrupt: 0 }, false, true)}
          ${cardHtml({ id: 'preview-3', kind: 'loose-scree', name: 'Loose scree', short: 'Stop 2 movement when both choose the same place.', advance: 0, guard: 0, disrupt: 2 }, false, true)}
        </div>
      </div>
    </section>
    <section class="content-section" aria-labelledby="how-title">
      <p class="section-number">01 / How it works</p>
      <h2 id="how-title">Finish a match in six simultaneous turns</h2>
      <ol class="steps">
        <li><strong>Draft three cards.</strong><span>Choose from a private offer of six cards.</span></li>
        <li><strong>Choose a place.</strong><span>Play at the ridge, river, or camp without seeing the other move.</span></li>
        <li><strong>Read the result.</strong><span>Movement, guards, and disruption resolve together on the server.</span></li>
      </ol>
    </section>
    <section class="content-section split-section" aria-labelledby="limits-title">
      <div><p class="section-number">02 / Scope and privacy</p><h2 id="limits-title">A finite duel, not a card economy</h2></div>
      <div><p>The game has no ranked ladder, spectator chat, loot boxes, or purchases of power.</p><p>Room state stays in the product’s own service for 24 hours. Browser settings stay on this device.</p></div>
    </section>
    <section class="content-section offer-section" aria-labelledby="offer-title">
      <p class="section-number">03 / Complete edition</p>
      <h2 id="offer-title">Buy the complete deck once for $8 USD</h2>
      <div class="offer-grid">
        <div><p class="price"><span>$8</span> USD · one-time price</p><p>The purchase includes the nine-card tactical set, six map modifiers, and future scenario packs for this edition.</p></div>
      <div><ul><li>No subscription</li><li>No card purchases during play</li><li>Free sample remains playable</li></ul><button class="button primary" type="button" disabled aria-describedby="billing-note">Purchase setup pending</button><p id="billing-note" class="small-note">Checkout is not active yet. The billing operator still needs to register this public offer.</p></div>
      </div>
    </section>`, '/');
}

function scoreGrid(scores: PlayerView['scores'], ownSeat: Seat): string {
  const other = ownSeat === 'north' ? 'south' : 'north';
  return `<div class="score-grid" role="table" aria-label="Expedition score by place">
    <div role="row" class="score-row score-head"><span role="columnheader">Place</span><span role="columnheader">You</span><span role="columnheader">Other</span></div>
    ${LOCATIONS.map((place) => `<div role="row" class="score-row"><span role="rowheader">${place}</span><strong role="cell">${scores[ownSeat][place]}</strong><span role="cell">${scores[other][place]}</span></div>`).join('')}
  </div>`;
}

function cardHtml(card: GameCard, selected: boolean, inert = false): string {
  const stats = [card.advance ? `Move ${card.advance}` : '', card.guard ? `Guard ${card.guard}` : '', card.disrupt ? `Stop ${card.disrupt}` : ''].filter(Boolean).join(' · ');
  const inner = `<span class="card-symbol" aria-hidden="true">${symbolFor(card.kind)}</span><strong>${escapeHtml(card.name)}</strong><span>${escapeHtml(card.short)}</span><small>${stats || 'Prediction card'}</small>`;
  return inert
    ? `<div class="game-card" aria-hidden="true">${inner}</div>`
    : `<button class="game-card ${selected ? 'selected' : ''}" type="button" data-card-id="${escapeHtml(card.id)}" aria-pressed="${selected}">${inner}</button>`;
}

function symbolFor(kind: string): string {
  if (kind.includes('map') || kind.includes('switch')) return '⌁';
  if (kind.includes('screen') || kind.includes('wall')) return '◒';
  if (kind.includes('wind') || kind.includes('signal')) return '✣';
  if (kind.includes('scree')) return '△';
  if (kind.includes('supply')) return '▣';
  return '◇';
}

function locationPicker(selected?: Location): string {
  return `<fieldset class="location-picker"><legend>Choose a place</legend><div>
    ${LOCATIONS.map((location) => `<button type="button" class="location-button ${selected === location ? 'selected' : ''}" data-location="${location}" aria-pressed="${selected === location}"><span aria-hidden="true">${location === 'ridge' ? '△' : location === 'river' ? '≈' : '⌂'}</span>${location}</button>`).join('')}
  </div></fieldset>`;
}

let demoState: GameState | undefined;
let demoCards = new Set<string>();
let demoCard: string | undefined;
let demoLocation: Location | undefined;

function resetDemo(): void {
  demoState = createGame(1701, 'sample');
  demoCards = new Set();
  demoCard = undefined;
  demoLocation = undefined;
}

function renderDemo(): void {
  if (!demoState) resetDemo();
  const state = demoState!;
  let content = '';
  if (state.status === 'drafting') {
    content = `<section class="game-page" aria-labelledby="demo-title">
      <div class="game-heading"><div><p class="eyebrow">Private practice against a bot</p><h1 id="demo-title">Draft three weather cards</h1></div><p class="turn-stamp">Draft · choose 3 of 6</p></div>
      <div class="map-rule"><strong>${state.map.name}</strong><span>${state.map.rule}</span></div>
      <p>Choose three cards for the first half. Three more arrive after turn three.</p>
      <div class="card-row" data-card-list>${state.offers.north.map((card) => cardHtml(card, demoCards.has(card.id))).join('')}</div>
      <div class="action-bar"><p aria-live="polite">${demoCards.size} of 3 selected</p><button class="button primary" type="button" data-lock-draft ${demoCards.size !== 3 ? 'disabled' : ''}>Lock three cards</button></div>
    </section>`;
  } else if (state.status === 'playing') {
    content = gamePlayHtml({
      seat: 'north', mode: state.mode, status: state.status, map: state.map, turn: state.turn,
      offer: [], hand: state.hands.north, draftLocked: true, otherDraftLocked: true,
      moveLocked: false, otherMoveLocked: false, scores: state.scores, history: state.history,
      rematchLocked: false, otherRematchLocked: false, otherConnected: true
    }, 'demo-title', demoCard, demoLocation, true);
  } else {
    content = endHtml({
      seat: 'north', mode: state.mode, status: state.status, map: state.map, turn: state.turn,
      offer: [], hand: [], draftLocked: true, otherDraftLocked: true, moveLocked: false,
      otherMoveLocked: false, scores: state.scores, history: state.history, winner: state.winner,
      rematchLocked: false, otherRematchLocked: false, otherConnected: true
    }, 'demo-title', getEpilogue(state, 'north'), true);
  }
  app.innerHTML = shell(content, '/demo', demoBanner());
  bindNavigation();
  bindDemo();
}

function bindDemo(): void {
  document.querySelector('[data-reset-demo]')?.addEventListener('click', () => { resetDemo(); renderDemo(); focusGameHeading(); });
  document.querySelectorAll<HTMLButtonElement>('[data-card-id]').forEach((button) => button.addEventListener('click', () => {
    const id = button.dataset.cardId!;
    if (demoState?.status === 'drafting') {
      if (demoCards.has(id)) demoCards.delete(id);
      else if (demoCards.size < 3) demoCards.add(id);
    } else demoCard = id;
    renderDemo();
  }));
  document.querySelector('[data-lock-draft]')?.addEventListener('click', () => {
    submitDraft(demoState!, 'north', [...demoCards]);
    submitDraft(demoState!, 'south', demoState!.offers.south.slice(0, 3).map((card) => card.id));
    renderDemo();
    focusGameHeading();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-location]').forEach((button) => button.addEventListener('click', () => {
    demoLocation = button.dataset.location as Location;
    renderDemo();
  }));
  document.querySelector('[data-lock-move]')?.addEventListener('click', () => {
    if (!demoCard || !demoLocation) return;
    submitChoice(demoState!, 'north', { cardId: demoCard, target: demoLocation });
    const botCard = demoState!.hands.south[0]!;
    const botTarget = LOCATIONS[(demoState!.seed + demoState!.turn) % LOCATIONS.length]!;
    submitChoice(demoState!, 'south', { cardId: botCard.id, target: botTarget });
    demoCard = undefined;
    demoLocation = undefined;
    renderDemo();
    if (demoState!.status === 'finished') focusGameHeading(true);
    else focusStatus();
  });
  document.querySelector('[data-demo-rematch]')?.addEventListener('click', () => { resetDemo(); renderDemo(); focusGameHeading(); });
}

function gamePlayHtml(view: PlayerView, headingId: string, selectedCard?: string, selectedLocation?: Location, demo = false): string {
  const opponent = demo ? 'Bot' : 'Other player';
  const last = view.history.at(-1);
  return `<section class="game-page" aria-labelledby="${headingId}">
    <div class="game-heading"><div><p class="eyebrow">${demo ? 'Private practice against a bot' : `Room ${escapeHtml(view.roomCode ?? '')} · you are ${view.seat}`}</p><h1 id="${headingId}">Choose a card and predict the other move</h1></div><p class="turn-stamp">Turn ${view.turn} of 6</p></div>
    <div class="map-rule"><strong>${view.map.name}</strong><span>${view.map.rule}</span></div>
    <div class="game-layout">
      <div>${scoreGrid(view.scores, view.seat)}${last ? `<div class="turn-result" id="game-status" tabindex="-1" aria-live="polite"><strong>Turn ${last.turn}:</strong> You played ${escapeHtml(last[view.seat].card.name)} at ${last[view.seat].target} for ${last[view.seat].gain}. ${opponent} gained ${last[view.seat === 'north' ? 'south' : 'north'].gain}.</div>` : '<p id="game-status" tabindex="-1">Both moves stay hidden until they are locked.</p>'}</div>
      <div class="move-area">
        <h2>Your hand</h2>
        <div class="card-row">${view.hand.map((card) => cardHtml(card, selectedCard === card.id)).join('')}</div>
        ${locationPicker(selectedLocation)}
        <div class="action-bar"><p>${demo ? 'The bot moves after you lock.' : view.otherMoveLocked ? 'The other move is locked.' : 'The other move is still hidden.'}</p><button class="button primary" type="button" data-lock-move ${!selectedCard || !selectedLocation ? 'disabled' : ''}>Lock this move</button></div>
      </div>
    </div>
  </section>`;
}

function endHtml(view: PlayerView, headingId: string, epilogue: string, demo = false): string {
  const result = view.winner === 'tie' ? 'The match is a draw' : view.winner === view.seat ? 'You win the expedition' : 'You lose this expedition';
  return `<section class="game-page end-page" aria-labelledby="${headingId}">
    <p class="eyebrow">Final score · ${totalFromView(view, view.seat)}–${totalFromView(view, view.seat === 'north' ? 'south' : 'north')}</p>
    <h1 id="${headingId}">${result}</h1>
    <p class="epilogue">${escapeHtml(epilogue)}</p>
    ${scoreGrid(view.scores, view.seat)}
    <details><summary>Review all six turns</summary><ol class="history-list">${view.history.map((record) => `<li>Turn ${record.turn}: ${escapeHtml(record[view.seat].card.name)} at ${record[view.seat].target} gained ${record[view.seat].gain}.</li>`).join('')}</ol></details>
    ${demo ? '<button class="button primary" type="button" data-demo-rematch>Play the sample again</button>' : `<button class="button primary" type="button" data-online-rematch ${view.rematchLocked ? 'disabled' : ''}>${view.rematchLocked ? 'Waiting for the other player' : 'Ask for a rematch'}</button>`}
  </section>`;
}

function totalFromView(view: PlayerView, seat: Seat): number {
  return LOCATIONS.reduce((sum, location) => sum + view.scores[seat][location], 0);
}

class OnlineRoom {
  socket?: WebSocket;
  view?: PlayerView;
  selectedCard?: string;
  selectedLocation?: Location;
  reconnectTimer?: number;
  stopped = false;

  constructor(readonly code: string, readonly token: string) {}

  connect(): void {
    const configured = import.meta.env.VITE_REALTIME_ORIGIN as string | undefined;
    const base = configured || window.location.origin;
    const socketUrl = new URL('/ws', base.replace(/^http/, 'ws'));
    this.socket = new WebSocket(socketUrl);
    this.socket.addEventListener('open', () => this.send({ type: 'auth', code: this.code, playerToken: this.token }));
    this.socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data)) as ServerMessage;
      if (message.type === 'state') {
        const previous = this.view;
        this.view = message.state;
        const turnResolved = Boolean(previous && message.state.history.length > previous.history.length);
        const phaseChanged = Boolean(previous && message.state.status !== previous.status);
        if (turnResolved || phaseChanged || message.state.moveLocked) {
          this.selectedCard = undefined;
          this.selectedLocation = undefined;
        }
        renderConnectedRoom(this);
        if (turnResolved) playMoveSound();
        if (message.state.status === 'finished' && previous?.status !== 'finished') focusGameHeading(true);
        else if (turnResolved) focusStatus();
        else if (phaseChanged) focusGameHeading();
      } else if (message.type === 'error') showRoomError(message.message);
    });
    this.socket.addEventListener('close', () => {
      if (this.stopped) return;
      renderConnectionLost(this);
      this.reconnectTimer = window.setTimeout(() => this.connect(), 1500);
    });
    this.socket.addEventListener('error', () => this.socket?.close());
  }

  send(message: ClientMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(message));
  }

  stop(): void {
    this.stopped = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.socket?.close();
  }
}

let onlineRoom: OnlineRoom | undefined;

function playLanding(message = ''): string {
  return shell(`<section class="play-entry contour-panel" aria-labelledby="play-title">
    <div><p class="eyebrow">Online two-player match</p><h1 id="play-title">Create or join a shared room</h1><p>Each player uses a separate browser. The service resolves both hidden moves together.</p></div>
    <div class="room-actions">
      ${message ? `<p class="form-error" role="alert">${escapeHtml(message)}</p>` : ''}
      <button class="button primary" type="button" data-create-room>Create a room</button>
      <form data-join-form><label for="room-code">Five-character room code</label><div><input id="room-code" name="code" autocomplete="off" autocapitalize="characters" maxlength="5" pattern="[A-Za-z0-9]{5}" required aria-describedby="room-help"><button class="button secondary" type="submit">Join room</button></div><p id="room-help">Ask the host for the code shown in their browser.</p></form>
    </div>
  </section>`, '/play');
}

function renderPlay(): void {
  onlineRoom?.stop();
  onlineRoom = undefined;
  const params = new URLSearchParams(location.search);
  const code = params.get('room')?.toUpperCase();
  const token = code ? sessionStorage.getItem(`hand-of-two:room:${code}`) : null;
  if (code && token) {
    app.innerHTML = shell(`<section class="loading-page" aria-labelledby="play-title"><h1 id="play-title">Reconnect to room ${escapeHtml(code)}</h1><p role="status">Checking the shared room…</p></section>`, '/play');
    bindNavigation();
    onlineRoom = new OnlineRoom(code, token);
    onlineRoom.connect();
    pageCleanup = () => onlineRoom?.stop();
  } else if (code) {
    app.innerHTML = shell(`<section class="play-entry contour-panel" aria-labelledby="play-title"><div><p class="eyebrow">Room ${escapeHtml(code)}</p><h1 id="play-title">Join this two-player room</h1><p>Your browser becomes the second player. No account is needed.</p></div><div class="room-actions"><button class="button primary" type="button" data-join-code="${escapeHtml(code)}">Join room ${escapeHtml(code)}</button><a href="/play" data-link>Use a different code</a></div></section>`, '/play');
    bindNavigation();
    bindPlayEntry();
  } else {
    app.innerHTML = playLanding();
    bindNavigation();
    bindPlayEntry();
  }
}

function bindPlayEntry(): void {
  document.querySelector('[data-create-room]')?.addEventListener('click', async (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    button.disabled = true;
    button.textContent = 'Creating room…';
    await roomRequest('/api/rooms', 'POST');
  });
  document.querySelector<HTMLFormElement>('[data-join-form]')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget as HTMLFormElement);
    const code = String(data.get('code') ?? '').trim().toUpperCase();
    if (!/^[A-Z0-9]{5}$/.test(code)) {
      app.innerHTML = playLanding('Enter the five-character room code.'); bindNavigation(); bindPlayEntry(); return;
    }
    await roomRequest(`/api/rooms/${encodeURIComponent(code)}/join`, 'POST');
  });
  document.querySelector<HTMLButtonElement>('[data-join-code]')?.addEventListener('click', async (event) => {
    const button = event.currentTarget as HTMLButtonElement;
    await roomRequest(`/api/rooms/${encodeURIComponent(button.dataset.joinCode!)}/join`, 'POST');
  });
}

async function roomRequest(path: string, method: string): Promise<void> {
  try {
    const configured = import.meta.env.VITE_REALTIME_ORIGIN as string | undefined;
    const response = await fetch(`${configured ?? ''}${path}`, { method, headers: { Accept: 'application/json' } });
    const body = await response.json() as { code?: string; playerToken?: string; error?: string };
    if (!response.ok || !body.code || !body.playerToken) throw new Error(body.error ?? 'The room service did not accept the request.');
    sessionStorage.setItem(`hand-of-two:room:${body.code}`, body.playerToken);
    navigate(`/play?room=${body.code}`);
  } catch (error) {
    app.innerHTML = playLanding(`${error instanceof Error ? error.message : 'The room service is unavailable.'} Try again when the connection returns.`);
    bindNavigation(); bindPlayEntry();
  }
}

function renderConnectedRoom(room: OnlineRoom): void {
  const view = room.view!;
  let content = '';
  if (view.status === 'waiting') {
    const share = `${location.origin}/play?room=${room.code}`;
    content = `<section class="waiting-page" aria-labelledby="play-title"><p class="eyebrow">Room ready</p><h1 id="play-title">Share code ${escapeHtml(room.code)} with one friend</h1><p>Keep this browser open. The draft starts when a second browser joins.</p><div class="room-code" aria-label="Room code ${escapeHtml(room.code)}">${escapeHtml(room.code)}</div><button class="button primary" type="button" data-copy-link data-share="${escapeHtml(share)}">Copy room link</button><p id="copy-status" aria-live="polite"></p></section>`;
  } else if (view.status === 'drafting') {
    content = `<section class="game-page" aria-labelledby="play-title"><div class="game-heading"><div><p class="eyebrow">Room ${escapeHtml(room.code)} · you are ${view.seat}</p><h1 id="play-title">Draft three weather cards</h1></div><p class="turn-stamp">Draft · choose 3 of 6</p></div><div class="map-rule"><strong>${view.map.name}</strong><span>${view.map.rule}</span></div>${view.draftLocked ? `<div class="waiting-card" role="status"><strong>Your draft is locked.</strong><span>${view.otherDraftLocked ? 'Starting the match…' : 'Waiting for the other player to choose three cards.'}</span></div>` : `<p>Choose three cards for the first half. Three more arrive after turn three.</p><div class="card-row">${view.offer.map((card) => cardHtml(card, demoCards.has(card.id))).join('')}</div><div class="action-bar"><p aria-live="polite">${demoCards.size} of 3 selected</p><button class="button primary" type="button" data-online-draft ${demoCards.size !== 3 ? 'disabled' : ''}>Lock three cards</button></div>`}</section>`;
  } else if (view.status === 'playing') {
    content = view.moveLocked
      ? `<section class="game-page" aria-labelledby="play-title"><div class="game-heading"><div><p class="eyebrow">Room ${escapeHtml(room.code)} · you are ${view.seat}</p><h1 id="play-title">Wait for the other player’s move</h1></div><p class="turn-stamp">Turn ${view.turn} of 6</p></div><div class="map-rule"><strong>${view.map.name}</strong><span>${view.map.rule}</span></div>${scoreGrid(view.scores, view.seat)}<div class="waiting-card" role="status"><strong>Your move is locked.</strong><span>The result appears when the other move arrives.</span></div></section>`
      : gamePlayHtml(view, 'play-title', room.selectedCard, room.selectedLocation);
  } else {
    const epilogue = view.winner === 'tie' ? 'Both routes reach shelter as the weather closes in.' : view.winner === view.seat ? `Your route reaches ${view.map.location} first, with enough supplies for the night.` : `The other route reaches ${view.map.location} first. Your team returns safely to try another path.`;
    content = endHtml(view, 'play-title', epilogue);
  }
  app.innerHTML = shell(content, '/play');
  bindNavigation();
  bindOnlineRoom(room);
}

function bindOnlineRoom(room: OnlineRoom): void {
  document.querySelector('[data-copy-link]')?.addEventListener('click', async (event) => {
    const value = (event.currentTarget as HTMLButtonElement).dataset.share!;
    try { await navigator.clipboard.writeText(value); document.querySelector('#copy-status')!.textContent = 'Room link copied.'; }
    catch { document.querySelector('#copy-status')!.textContent = `Copy this link: ${value}`; }
  });
  document.querySelectorAll<HTMLButtonElement>('[data-card-id]').forEach((button) => button.addEventListener('click', () => {
    if (room.view?.status === 'drafting') {
      const id = button.dataset.cardId!;
      if (demoCards.has(id)) demoCards.delete(id); else if (demoCards.size < 3) demoCards.add(id);
    } else room.selectedCard = button.dataset.cardId;
    renderConnectedRoom(room);
  }));
  document.querySelector('[data-online-draft]')?.addEventListener('click', () => { room.send({ type: 'draft', cardIds: [...demoCards] }); demoCards = new Set(); });
  document.querySelectorAll<HTMLButtonElement>('[data-location]').forEach((button) => button.addEventListener('click', () => { room.selectedLocation = button.dataset.location as Location; renderConnectedRoom(room); }));
  document.querySelector('[data-lock-move]')?.addEventListener('click', () => { if (room.selectedCard && room.selectedLocation) room.send({ type: 'move', cardId: room.selectedCard, target: room.selectedLocation }); });
  document.querySelector('[data-online-rematch]')?.addEventListener('click', () => room.send({ type: 'rematch' }));
}

function showRoomError(message: string): void {
  const existing = document.querySelector('.room-error');
  if (existing) existing.remove();
  const node = document.createElement('div');
  node.className = 'room-error'; node.setAttribute('role', 'alert'); node.textContent = message;
  document.querySelector('main')?.prepend(node);
}

function playMoveSound(): void {
  if (!readSettings().sound) return;
  try {
    const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 330;
    gain.gain.setValueAtTime(.045, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .12);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + .13);
    oscillator.addEventListener('ended', () => void context.close());
  } catch { /* Sound remains optional if the browser blocks audio. */ }
}

function renderConnectionLost(room: OnlineRoom): void {
  app.innerHTML = shell(`<section class="loading-page" aria-labelledby="play-title"><h1 id="play-title">Reconnect to room ${escapeHtml(room.code)}</h1><p role="status">The connection stopped. Reconnecting without changing your locked move…</p><a href="/play" data-link>Leave this room</a></section>`, '/play');
  bindNavigation();
}

interface Settings { sound: boolean; motion: 'system' | 'reduced' | 'full' }
const defaultSettings: Settings = { sound: false, motion: 'system' };
function readSettings(): Settings {
  try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem('hand-of-two:settings') ?? '{}') as Partial<Settings> }; }
  catch { return defaultSettings; }
}
function applySettings(settings: Settings): void {
  document.documentElement.dataset.motion = settings.motion;
}

function settingsPage(): string {
  const settings = readSettings();
  return shell(`<section class="legal-page" aria-labelledby="settings-title"><p class="eyebrow">Saved on this device</p><h1 id="settings-title">Set sound and motion</h1><p>These choices apply to real matches. The demo does not read them.</p><form class="settings-form" data-settings-form><fieldset><legend>Sound after a move</legend><label><input type="radio" name="sound" value="off" ${!settings.sound ? 'checked' : ''}> Off</label><label><input type="radio" name="sound" value="on" ${settings.sound ? 'checked' : ''}> On</label></fieldset><fieldset><legend>Interface motion</legend><label><input type="radio" name="motion" value="system" ${settings.motion === 'system' ? 'checked' : ''}> Follow device setting</label><label><input type="radio" name="motion" value="reduced" ${settings.motion === 'reduced' ? 'checked' : ''}> Reduce motion</label><label><input type="radio" name="motion" value="full" ${settings.motion === 'full' ? 'checked' : ''}> Use short transitions</label></fieldset><button class="button primary" type="submit">Save settings</button><p id="settings-status" aria-live="polite"></p></form></section>`, '/settings');
}

function bindSettings(): void {
  document.querySelector<HTMLFormElement>('[data-settings-form]')?.addEventListener('submit', (event) => {
    event.preventDefault(); const data = new FormData(event.currentTarget as HTMLFormElement);
    const settings: Settings = { sound: data.get('sound') === 'on', motion: data.get('motion') as Settings['motion'] };
    localStorage.setItem('hand-of-two:settings', JSON.stringify(settings)); applySettings(settings);
    document.querySelector('#settings-status')!.textContent = 'Settings saved on this device.';
  });
}

function privacyPage(): string {
  return shell(`<article class="legal-page" aria-labelledby="privacy-title"><p class="eyebrow">Effective 6 September 2026</p><h1 id="privacy-title">Privacy for Hand of Two</h1><h2>What the game stores</h2><p>A real room stores its game state, random player identifiers, and update time in the product’s SQLite database. Rooms expire after 24 hours. Player identifiers are stored as one-way hashes.</p><p>Your sound and motion choices stay in this browser. The demo stays in memory and disappears when you leave or reload it.</p><h2>What the game does not collect</h2><p>There are no accounts, names, email addresses, analytics, advertising trackers, chat messages, or payment details in this game.</p><h2>Network requests</h2><p>Online play sends card choices and room state only to Hand of Two. A card choice stays hidden from the other player until both choices are locked.</p><h2>Delete your data</h2><p>Leave the room and clear this site’s browser storage to remove local settings. Room data expires automatically. For an earlier room deletion, email <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a> with the room code. Do not send a player identifier.</p></article>`, '/privacy');
}

function termsPage(): string {
  return shell(`<article class="legal-page" aria-labelledby="terms-title"><p class="eyebrow">Effective 6 September 2026</p><h1 id="terms-title">Terms for Hand of Two</h1><h2>Using the game</h2><p>Hand of Two is a general-audience two-player card game. Use it lawfully and do not interfere with rooms used by other people.</p><h2>Free sample</h2><p>The sample deck and practice bot are available without payment. The bot is only for practice and is not a second online player.</p><h2>Complete edition</h2><p>The complete edition is offered for $8 USD as a one-time purchase. It includes the nine-card tactical set, six map modifiers, and future scenario packs for this edition. It is not a subscription. Checkout and license activation are not available until the billing operator registers the offer.</p><h2>Availability and refunds</h2><p>The game is provided as available and may change to fix faults or protect rooms. Purchase and refund terms will appear before checkout becomes active.</p><h2>Contact</h2><p>Questions can be sent to <a href="mailto:support@sociobot.in">support@sociobot.in</a>.</p></article>`, '/terms');
}

function discardDemo(): void {
  demoState = undefined;
  demoCards = new Set();
  demoCard = undefined;
  demoLocation = undefined;
}

function navigate(target: string): void {
  pageCleanup?.(); pageCleanup = undefined;
  const nextPath = new URL(target, location.href).pathname;
  if (location.pathname === '/demo' && nextPath !== '/demo') discardDemo();
  history.pushState({}, '', target);
  renderRoute(true);
}

function bindNavigation(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach((link) => link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault(); navigate(link.pathname + link.search);
  }));
}

function focusGameHeading(scroll = false): void {
  const heading = document.querySelector<HTMLElement>('h1');
  heading?.setAttribute('tabindex', '-1');
  heading?.focus({ preventScroll: !scroll });
  if (scroll) window.scrollTo({ top: 0, behavior: 'instant' });
}
function focusStatus(): void { document.querySelector<HTMLElement>('#game-status')?.focus({ preventScroll: true }); }

function renderRoute(routeChange = false): void {
  const route = location.pathname;
  applySettings(route === '/demo' ? defaultSettings : readSettings());
  document.title = titles[route] ?? 'Page not found — Hand of Two';
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `${PRODUCT_ORIGIN}${route}`);
  if (route !== '/play') { onlineRoom?.stop(); onlineRoom = undefined; }
  if (route === '/') { app.innerHTML = homePage(); bindNavigation(); }
  else if (route === '/demo') renderDemo();
  else if (route === '/play') renderPlay();
  else if (route === '/settings') { app.innerHTML = settingsPage(); bindNavigation(); bindSettings(); }
  else if (route === '/privacy') { app.innerHTML = privacyPage(); bindNavigation(); }
  else if (route === '/terms') { app.innerHTML = termsPage(); bindNavigation(); }
  else { location.replace('/404.html'); return; }
  if (routeChange) {
    requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>('h1');
      heading?.setAttribute('tabindex', '-1'); heading?.focus({ preventScroll: true });
      const announcer = document.querySelector('#route-announcer'); if (announcer) announcer.textContent = document.title;
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }
  activeRoute = route;
}

window.addEventListener('popstate', () => {
  pageCleanup?.(); pageCleanup = undefined;
  if (activeRoute === '/demo' && location.pathname !== '/demo') discardDemo();
  renderRoute(true);
});
renderRoute();
