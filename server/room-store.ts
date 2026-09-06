import { createHash, randomBytes, randomInt } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import {
  createGame,
  otherSeat,
  resetGame,
  submitChoice,
  submitDraft,
  type Choice,
  type GameState,
  type Seat
} from '../shared/game';
import type { PlayerView } from '../shared/protocol';

interface RoomRow {
  code: string;
  north_hash: string;
  south_hash: string | null;
  state_json: string;
  expires_at: number;
}

const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const ROOM_TTL_MS = 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function makeToken(): string {
  return randomBytes(24).toString('base64url');
}

function makeCode(): string {
  return Array.from({ length: 5 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('');
}

export class RoomStore {
  private database: DatabaseSync;

  constructor(databasePath: string) {
    mkdirSync(dirname(databasePath), { recursive: true });
    this.database = new DatabaseSync(databasePath);
    this.database.exec(`
      PRAGMA busy_timeout = 10000;
      PRAGMA journal_mode = DELETE;
      PRAGMA synchronous = FULL;
      CREATE TABLE IF NOT EXISTS rooms (
        code TEXT PRIMARY KEY,
        north_hash TEXT NOT NULL,
        south_hash TEXT,
        state_json TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS rooms_expiry ON rooms(expires_at);
    `);
  }

  close(): void {
    this.database.close();
  }

  health(): boolean {
    const result = this.database.prepare('SELECT 1 AS ok').get() as { ok: number };
    return result.ok === 1;
  }

  cleanup(now = Date.now()): void {
    this.database.prepare('DELETE FROM rooms WHERE expires_at < ?').run(now);
  }

  createRoom(): { code: string; playerToken: string; seat: Seat } {
    this.cleanup();
    let code = makeCode();
    while (this.database.prepare('SELECT code FROM rooms WHERE code = ?').get(code)) code = makeCode();
    const token = makeToken();
    const state = createGame(randomInt(1, 2_147_483_647), 'sample', 'waiting');
    const now = Date.now();
    this.database.prepare(
      'INSERT INTO rooms (code, north_hash, south_hash, state_json, expires_at, updated_at) VALUES (?, ?, NULL, ?, ?, ?)'
    ).run(code, hashToken(token), JSON.stringify(state), now + ROOM_TTL_MS, now);
    return { code, playerToken: token, seat: 'north' };
  }

  joinRoom(inputCode: string): { code: string; playerToken: string; seat: Seat } {
    const code = inputCode.trim().toUpperCase();
    this.database.exec('BEGIN IMMEDIATE');
    try {
      const row = this.getRow(code);
      if (row.south_hash) throw new Error('This room already has two players. Ask the host to create another room.');
      const token = makeToken();
      const state = JSON.parse(row.state_json) as GameState;
      state.status = 'drafting';
      const now = Date.now();
      this.database.prepare('UPDATE rooms SET south_hash = ?, state_json = ?, expires_at = ?, updated_at = ? WHERE code = ?')
        .run(hashToken(token), JSON.stringify(state), now + ROOM_TTL_MS, now, code);
      this.database.exec('COMMIT');
      return { code, playerToken: token, seat: 'south' };
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }

  authenticate(inputCode: string, token: string): Seat {
    const row = this.getRow(inputCode.trim().toUpperCase());
    const hash = hashToken(token);
    if (row.north_hash === hash) return 'north';
    if (row.south_hash === hash) return 'south';
    throw new Error('This player link is not valid. Join the room again from this browser.');
  }

  getPublicStatus(inputCode: string): { code: string; status: GameState['status']; players: number } {
    const row = this.getRow(inputCode.trim().toUpperCase());
    const state = JSON.parse(row.state_json) as GameState;
    return { code: row.code, status: state.status, players: row.south_hash ? 2 : 1 };
  }

  getView(inputCode: string, seat: Seat, connected: Set<Seat> = new Set()): PlayerView {
    const row = this.getRow(inputCode.trim().toUpperCase());
    const state = JSON.parse(row.state_json) as GameState;
    const other = otherSeat(seat);
    return {
      roomCode: row.code,
      seat,
      mode: state.mode,
      status: state.status,
      map: state.map,
      turn: state.turn,
      offer: state.status === 'drafting' && !state.draftReady[seat] ? state.offers[seat] : [],
      hand: state.hands[seat],
      draftLocked: state.draftReady[seat],
      otherDraftLocked: state.draftReady[other],
      moveLocked: Boolean(state.choices[seat]),
      otherMoveLocked: Boolean(state.choices[other]),
      scores: state.scores,
      history: state.history,
      winner: state.winner,
      rematchLocked: state.rematch[seat],
      otherRematchLocked: state.rematch[other],
      otherConnected: connected.has(other)
    };
  }

  draft(inputCode: string, seat: Seat, cardIds: string[]): void {
    this.change(inputCode, (state) => submitDraft(state, seat, cardIds));
  }

  move(inputCode: string, seat: Seat, choice: Choice): void {
    this.change(inputCode, (state) => submitChoice(state, seat, choice));
  }

  rematch(inputCode: string, seat: Seat): void {
    this.change(inputCode, (state) => {
      if (state.status !== 'finished') throw new Error('Finish this match before starting a rematch.');
      state.rematch[seat] = true;
      if (state.rematch.north && state.rematch.south) Object.assign(state, resetGame(state));
    });
  }

  private change(inputCode: string, mutation: (state: GameState) => void): void {
    const code = inputCode.trim().toUpperCase();
    this.database.exec('BEGIN IMMEDIATE');
    try {
      const row = this.getRow(code);
      const state = JSON.parse(row.state_json) as GameState;
      mutation(state);
      const now = Date.now();
      this.database.prepare('UPDATE rooms SET state_json = ?, expires_at = ?, updated_at = ? WHERE code = ?')
        .run(JSON.stringify(state), now + ROOM_TTL_MS, now, code);
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }

  private getRow(code: string): RoomRow {
    const row = this.database.prepare(
      'SELECT code, north_hash, south_hash, state_json, expires_at FROM rooms WHERE code = ? AND expires_at >= ?'
    ).get(code, Date.now()) as RoomRow | undefined;
    if (!row) throw new Error('That room was not found. Check the five-character code or create a new room.');
    return row;
  }
}
