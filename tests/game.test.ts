import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { afterEach, describe, expect, it } from 'vitest';
import { createGame, makeDeck, submitChoice, submitDraft, totalScore } from '../shared/game';
import { RoomStore } from '../server/room-store';

describe('deterministic game rules', () => {
  it('@claim:fixed-deck builds a fixed 18-card sample and complete deck', () => {
    for (const mode of ['sample', 'complete'] as const) {
      const deck = makeDeck(mode);
      expect(deck).toHaveLength(18);
      expect(new Set(deck.map((card) => card.id)).size).toBe(18);
    }
  });

  it('@claim:deterministic-sample deals the same private offers for the same seed', () => {
    expect(createGame(1407).offers).toEqual(createGame(1407).offers);
    expect(createGame(1407).offers).not.toEqual(createGame(1408).offers);
  });

  it('rejects invalid drafts and cards outside a player hand', () => {
    const state = createGame(31);
    expect(() => submitDraft(state, 'north', ['wrong', 'wrong', 'wrong'])).toThrow('different cards');
    submitDraft(state, 'north', state.offers.north.slice(0, 3).map((card) => card.id));
    submitDraft(state, 'south', state.offers.south.slice(0, 3).map((card) => card.id));
    expect(() => submitChoice(state, 'north', { cardId: state.hands.south[0]!.id, target: 'ridge' })).toThrow('not in your hand');
  });

  it('plays exactly six turns in every mode, replenishes each hand, and names a result', () => {
    for (const mode of ['sample', 'complete'] as const) {
      const state = createGame(91, mode);
      submitDraft(state, 'north', state.offers.north.slice(0, 3).map((card) => card.id));
      submitDraft(state, 'south', state.offers.south.slice(0, 3).map((card) => card.id));
      for (let turn = 1; turn <= 6; turn += 1) {
        submitChoice(state, 'north', { cardId: state.hands.north[0]!.id, target: 'ridge' });
        submitChoice(state, 'south', { cardId: state.hands.south[0]!.id, target: turn % 2 ? 'ridge' : 'river' });
        if (turn === 3) {
          expect(state.hands.north).toHaveLength(3);
          expect(state.hands.south).toHaveLength(3);
        }
      }
      expect(state.status).toBe('finished');
      expect(state.history).toHaveLength(6);
      expect(['north', 'south', 'tie']).toContain(state.winner);
      expect(totalScore(state, 'north')).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('SQLite room persistence', () => {
  const directories: string[] = [];
  afterEach(() => {
    for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
  });

  it('restores both seats and shared game state after a service restart', () => {
    const directory = mkdtempSync(join(tmpdir(), 'hand-of-two-'));
    directories.push(directory);
    const databasePath = join(directory, 'rooms.sqlite');
    const first = new RoomStore(databasePath);
    const host = first.createRoom();
    const guest = first.joinRoom(host.code);
    const hostOffer = first.getView(host.code, 'north').offer;
    first.draft(host.code, 'north', hostOffer.slice(0, 3).map((card) => card.id));
    first.close();

    const restarted = new RoomStore(databasePath);
    expect(restarted.authenticate(host.code, host.playerToken)).toBe('north');
    expect(restarted.authenticate(host.code, guest.playerToken)).toBe('south');
    expect(restarted.getView(host.code, 'north').draftLocked).toBe(true);
    expect(restarted.getView(host.code, 'south').otherDraftLocked).toBe(true);
    restarted.close();
  });

  it('@claim:room-retention stores token hashes and a 24-hour room expiry', () => {
    const directory = mkdtempSync(join(tmpdir(), 'hand-of-two-'));
    directories.push(directory);
    const databasePath = join(directory, 'rooms.sqlite');
    const store = new RoomStore(databasePath);
    const before = Date.now();
    const host = store.createRoom();
    store.close();
    expect(readFileSync(databasePath).includes(Buffer.from(host.playerToken))).toBe(false);
    const database = new DatabaseSync(databasePath, { readOnly: true });
    const row = database.prepare('SELECT north_hash, expires_at FROM rooms WHERE code = ?').get(host.code) as { north_hash: string; expires_at: number };
    expect(row.north_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(row.expires_at - before).toBeGreaterThanOrEqual(24 * 60 * 60 * 1000 - 1000);
    expect(row.expires_at - before).toBeLessThanOrEqual(24 * 60 * 60 * 1000 + 1000);
    database.close();
  });
});
