export const LOCATIONS = ['ridge', 'river', 'camp'] as const;
export type Location = (typeof LOCATIONS)[number];
export type Seat = 'north' | 'south';
export type GameMode = 'sample' | 'complete';

export interface CardDefinition {
  kind: string;
  name: string;
  short: string;
  advance: number;
  guard: number;
  disrupt: number;
  read?: 'same' | 'apart';
  readBonus?: number;
}

export interface GameCard extends CardDefinition {
  id: string;
}

export interface Choice {
  cardId: string;
  target: Location;
}

export interface TurnRecord {
  turn: number;
  sameLocation: boolean;
  north: { card: GameCard; target: Location; gain: number };
  south: { card: GameCard; target: Location; gain: number };
}

export interface GameState {
  seed: number;
  mode: GameMode;
  status: 'waiting' | 'drafting' | 'playing' | 'finished';
  map: MapModifier;
  turn: number;
  offers: Record<Seat, GameCard[]>;
  hands: Record<Seat, GameCard[]>;
  reserve: GameCard[];
  draftReady: Record<Seat, boolean>;
  choices: Partial<Record<Seat, Choice>>;
  scores: Record<Seat, Record<Location, number>>;
  history: TurnRecord[];
  winner?: Seat | 'tie';
  rematch: Record<Seat, boolean>;
}

export interface MapModifier {
  id: string;
  name: string;
  rule: string;
  location: Location;
}

const SAMPLE_CARDS: CardDefinition[] = [
  { kind: 'trail-map', name: 'Trail map', short: 'Move 2.', advance: 2, guard: 0, disrupt: 0 },
  { kind: 'canvas-screen', name: 'Canvas screen', short: 'Move 1. Block 2 disruption.', advance: 1, guard: 2, disrupt: 0 },
  { kind: 'wind-gauge', name: 'Wind gauge', short: 'Move 1. Gain 2 if both choose the same place.', advance: 1, guard: 0, disrupt: 0, read: 'same', readBonus: 2 },
  { kind: 'quiet-step', name: 'Quiet step', short: 'Move 1. Gain 2 if you choose different places.', advance: 1, guard: 0, disrupt: 0, read: 'apart', readBonus: 2 },
  { kind: 'loose-scree', name: 'Loose scree', short: 'Stop 2 movement when both choose the same place.', advance: 0, guard: 0, disrupt: 2 },
  { kind: 'supply-line', name: 'Supply line', short: 'Move 2. Block 1 disruption.', advance: 2, guard: 1, disrupt: 0 }
];

const COMPLETE_CARDS: CardDefinition[] = [
  ...SAMPLE_CARDS,
  { kind: 'signal-fire', name: 'Signal fire', short: 'Move 3.', advance: 3, guard: 0, disrupt: 0 },
  { kind: 'snow-wall', name: 'Snow wall', short: 'Block 3 and stop 1 at the same place.', advance: 0, guard: 3, disrupt: 1 },
  { kind: 'switchback', name: 'Switchback', short: 'Move 1, stop 1, and gain 1 when apart.', advance: 1, guard: 0, disrupt: 1, read: 'apart', readBonus: 1 }
];

export const MAPS: MapModifier[] = [
  { id: 'crosswind', name: 'Crosswind pass', rule: 'Prediction bonuses at the ridge gain 1 more.', location: 'ridge' },
  { id: 'high-water', name: 'High water', rule: 'Guarded moves at the river gain 1 more.', location: 'river' },
  { id: 'warm-stones', name: 'Warm stones', rule: 'Moves with no disruption at camp gain 1 more.', location: 'camp' },
  { id: 'narrow-ledges', name: 'Narrow ledges', rule: 'Disruption at the ridge gains 1 strength.', location: 'ridge' },
  { id: 'reed-banks', name: 'Reed banks', rule: 'Apart predictions at the river gain 1 more.', location: 'river' },
  { id: 'clear-night', name: 'Clear night', rule: 'Same-place predictions at camp gain 1 more.', location: 'camp' }
];

function rng(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let out = value;
    out = Math.imul(out ^ (out >>> 15), out | 1);
    out ^= out + Math.imul(out ^ (out >>> 7), out | 61);
    return ((out ^ (out >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], seed: number): T[] {
  const random = rng(seed);
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap]!, result[index]!];
  }
  return result;
}

export function makeDeck(mode: GameMode): GameCard[] {
  const definitions = mode === 'sample' ? SAMPLE_CARDS : COMPLETE_CARDS;
  const copies = mode === 'sample' ? 3 : 2;
  return definitions.flatMap((card) =>
    Array.from({ length: copies }, (_, index) => ({ ...card, id: `${card.kind}-${index + 1}` }))
  );
}

export function createGame(seed: number, mode: GameMode = 'sample', status: GameState['status'] = 'drafting'): GameState {
  const deck = shuffle(makeDeck(mode), seed);
  const maps = mode === 'sample' ? MAPS.slice(0, 1) : MAPS;
  return {
    seed,
    mode,
    status,
    map: maps[Math.abs(seed) % maps.length]!,
    turn: 1,
    offers: { north: deck.slice(0, 6), south: deck.slice(6, 12) },
    hands: { north: [], south: [] },
    reserve: deck.slice(12),
    draftReady: { north: false, south: false },
    choices: {},
    scores: {
      north: { ridge: 0, river: 0, camp: 0 },
      south: { ridge: 0, river: 0, camp: 0 }
    },
    history: [],
    rematch: { north: false, south: false }
  };
}

export function otherSeat(seat: Seat): Seat {
  return seat === 'north' ? 'south' : 'north';
}

export function submitDraft(state: GameState, seat: Seat, ids: string[]): void {
  if (state.status !== 'drafting') throw new Error('The draft is not open. Refresh to get the latest room state.');
  if (state.draftReady[seat]) throw new Error('Your draft is already locked. Wait for the other player.');
  if (ids.length !== 3 || new Set(ids).size !== 3) throw new Error('Choose exactly three different cards.');
  const cards = ids.map((id) => state.offers[seat].find((card) => card.id === id));
  if (cards.some((card) => !card)) throw new Error('One draft card is not in your offer. Choose from the six shown.');
  state.hands[seat] = cards as GameCard[];
  state.reserve.push(...state.offers[seat].filter((card) => !ids.includes(card.id)));
  state.draftReady[seat] = true;
  if (state.draftReady.north && state.draftReady.south) {
    state.reserve = shuffle(state.reserve, state.seed + 97);
    state.status = 'playing';
  }
}

function bonusFor(state: GameState, card: GameCard, target: Location, same: boolean): number {
  let bonus = card.read === (same ? 'same' : 'apart') ? card.readBonus ?? 0 : 0;
  if (target !== state.map.location) return bonus;
  if (state.map.id === 'crosswind' && bonus > 0) bonus += 1;
  if (state.map.id === 'high-water' && card.guard > 0) bonus += 1;
  if (state.map.id === 'warm-stones' && card.disrupt === 0) bonus += 1;
  if (state.map.id === 'reed-banks' && card.read === 'apart' && !same) bonus += 1;
  if (state.map.id === 'clear-night' && card.read === 'same' && same) bonus += 1;
  return bonus;
}

export function submitChoice(state: GameState, seat: Seat, choice: Choice): TurnRecord | undefined {
  if (state.status !== 'playing') throw new Error('This match is not accepting moves. Refresh to get the latest state.');
  if (state.choices[seat]) throw new Error('Your move is locked. Wait for the other player.');
  if (!LOCATIONS.includes(choice.target)) throw new Error('Choose ridge, river, or camp.');
  if (!state.hands[seat].some((card) => card.id === choice.cardId)) {
    throw new Error('That card is not in your hand. Choose one of the cards shown.');
  }
  state.choices[seat] = choice;
  if (!state.choices.north || !state.choices.south) return undefined;
  return resolveTurn(state);
}

function resolveTurn(state: GameState): TurnRecord {
  const northChoice = state.choices.north!;
  const southChoice = state.choices.south!;
  const northCard = state.hands.north.find((card) => card.id === northChoice.cardId)!;
  const southCard = state.hands.south.find((card) => card.id === southChoice.cardId)!;
  const same = northChoice.target === southChoice.target;
  const narrow = state.map.id === 'narrow-ledges' && northChoice.target === 'ridge' && same ? 1 : 0;
  const northAttack = same ? southCard.disrupt + narrow : 0;
  const southAttack = same ? northCard.disrupt + narrow : 0;
  const northGain = Math.max(0, northCard.advance + bonusFor(state, northCard, northChoice.target, same) - Math.max(0, northAttack - northCard.guard));
  const southGain = Math.max(0, southCard.advance + bonusFor(state, southCard, southChoice.target, same) - Math.max(0, southAttack - southCard.guard));
  state.scores.north[northChoice.target] += northGain;
  state.scores.south[southChoice.target] += southGain;
  state.hands.north = state.hands.north.filter((card) => card.id !== northCard.id);
  state.hands.south = state.hands.south.filter((card) => card.id !== southCard.id);
  const record: TurnRecord = {
    turn: state.turn,
    sameLocation: same,
    north: { card: northCard, target: northChoice.target, gain: northGain },
    south: { card: southCard, target: southChoice.target, gain: southGain }
  };
  state.history.push(record);
  state.choices = {};
  if (state.turn === 3) {
    state.hands.north.push(...state.reserve.slice(0, 3));
    state.hands.south.push(...state.reserve.slice(3, 6));
  }
  if (state.turn === 6) {
    const northTotal = totalScore(state, 'north');
    const southTotal = totalScore(state, 'south');
    state.winner = northTotal === southTotal ? 'tie' : northTotal > southTotal ? 'north' : 'south';
    state.status = 'finished';
  } else {
    state.turn += 1;
  }
  return record;
}

export function totalScore(state: GameState, seat: Seat): number {
  return LOCATIONS.reduce((sum, location) => sum + state.scores[seat][location], 0);
}

export function resetGame(state: GameState): GameState {
  return createGame(state.seed + 1, state.mode, 'drafting');
}

export function getEpilogue(state: GameState, seat: Seat): string {
  if (state.winner === 'tie') return 'Both routes reach shelter as the weather closes in.';
  if (state.winner === seat) return `Your route reaches ${state.map.location} first, with enough supplies for the night.`;
  return `The other route reaches ${state.map.location} first. Your team returns safely to try another path.`;
}
