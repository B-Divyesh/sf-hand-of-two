import type { GameCard, GameMode, Location, MapModifier, Seat, TurnRecord } from './game';

export interface PlayerView {
  roomCode?: string;
  seat: Seat;
  mode: GameMode;
  status: 'waiting' | 'drafting' | 'playing' | 'finished';
  map: MapModifier;
  turn: number;
  offer: GameCard[];
  hand: GameCard[];
  draftLocked: boolean;
  otherDraftLocked: boolean;
  moveLocked: boolean;
  otherMoveLocked: boolean;
  scores: Record<Seat, Record<Location, number>>;
  history: TurnRecord[];
  winner?: Seat | 'tie';
  rematchLocked: boolean;
  otherRematchLocked: boolean;
  otherConnected?: boolean;
}

export type ClientMessage =
  | { type: 'auth'; code: string; playerToken: string }
  | { type: 'draft'; cardIds: string[] }
  | { type: 'move'; cardId: string; target: Location }
  | { type: 'rematch' }
  | { type: 'ping' };

export type ServerMessage =
  | { type: 'state'; state: PlayerView }
  | { type: 'error'; message: string }
  | { type: 'ready'; seat: Seat }
  | { type: 'pong' };
