import { EMOJI_POOL } from '../data/emojis';
import type { Card, Puzzle, SymbolPlacement } from '../types';

const NUM_CARDS = 12;
const NUM_SYMBOLS = 30;
const NUM_UNIQUE = 15; // half are unique
const MOST_REPEATED_COUNT = 7;
const MIN_CARD_SIZE = 5;
const TARGET_CARD_SIZE = 6;

/** Fisher-Yates shuffle (in-place) */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Pick n random items from array without replacement */
function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle([...arr]).slice(0, n);
}

/** Random integer in [min, max] inclusive */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Random float in [min, max] */
function randFloat(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Pick a random card index that isn't in the exclude set */
function pickRandomCard(exclude: Set<number> = new Set()): number {
  const available = Array.from({ length: NUM_CARDS }, (_, i) => i)
    .filter(i => !exclude.has(i));
  return available[randInt(0, available.length - 1)];
}

/**
 * Pick `count` random card indices from [0..NUM_CARDS-1],
 * ensuring `mustInclude` cards are in the selection.
 */
function pickCardIndices(count: number, mustInclude: number[] = []): number[] {
  const mustSet = new Set(mustInclude);
  const available = Array.from({ length: NUM_CARDS }, (_, i) => i)
    .filter(i => !mustSet.has(i));

  const remaining = count - mustInclude.length;
  const picked = pickRandom(available, Math.max(0, remaining));

  return shuffle([...mustInclude, ...picked]);
}

/**
 * Predefined positions for symbols within a circle.
 * Coordinates are in [-1, 1] range, fitted inside unit circle.
 */
const SYMBOL_POSITIONS: Array<{ x: number; y: number }> = [
  { x: 0, y: 0 },
  { x: 0.45, y: 0 },
  { x: -0.45, y: 0 },
  { x: 0, y: 0.45 },
  { x: 0, y: -0.45 },
  { x: 0.32, y: 0.32 },
  { x: -0.32, y: 0.32 },
  { x: 0.32, y: -0.32 },
  { x: -0.32, y: -0.32 },
];

/** Create a SymbolPlacement with random scale and rotation. */
function makeSymbolPlacement(emoji: string): SymbolPlacement {
  return {
    emoji,
    scale: randFloat(0.7, 1.3),
    rotation: randInt(0, 359),
  };
}

/**
 * Generate a complete puzzle satisfying all constraints:
 * - 30 symbols, 12 cards
 * - 15 unique (appear on exactly 1 card), 15 non-unique (2+)
 * - 1 most-repeated symbol with strictly highest count
 * - 1 "special" card with no unique symbols
 * - 11 other cards each have at least 1 unique symbol
 * - No symbol repeats within a single card
 */
export function generatePuzzle(): Puzzle {
  // Step 1: Pick 30 emojis and split into unique / non-unique
  const allSymbols = pickRandom(EMOJI_POOL, NUM_SYMBOLS);
  const uniqueSymbols = allSymbols.slice(0, NUM_UNIQUE);
  const nonUniqueSymbols = allSymbols.slice(NUM_UNIQUE);

  // Step 2: Choose the most-repeated symbol and the special card
  const mostRepeatedSymbol = nonUniqueSymbols[0];
  const specialCardId = randInt(0, NUM_CARDS - 1);

  // Step 3: Initialize card symbol sets and track per-symbol counts
  const cardSymbols: Set<string>[] = Array.from({ length: NUM_CARDS }, () => new Set<string>());
  const symbolCardCount = new Map<string, number>();

  const addSymbolToCard = (symbol: string, cardIdx: number) => {
    if (!cardSymbols[cardIdx].has(symbol)) {
      cardSymbols[cardIdx].add(symbol);
      symbolCardCount.set(symbol, (symbolCardCount.get(symbol) ?? 0) + 1);
    }
  };

  // Step 4: Assign the most-repeated symbol to MOST_REPEATED_COUNT cards
  const mostRepeatedCards = pickCardIndices(MOST_REPEATED_COUNT);
  for (const cardIdx of mostRepeatedCards) {
    addSymbolToCard(mostRepeatedSymbol, cardIdx);
  }

  // Step 5: Assign other non-unique symbols to 2-4 cards each (strictly < MOST_REPEATED_COUNT)
  // Prioritize the special card for the first several to ensure it gets enough non-unique symbols
  for (let i = 1; i < nonUniqueSymbols.length; i++) {
    const symbol = nonUniqueSymbols[i];
    const count = randInt(2, 4);

    // Include special card if it still needs more symbols
    const specialNeedsMore = cardSymbols[specialCardId].size < TARGET_CARD_SIZE;
    const mustInclude = specialNeedsMore ? [specialCardId] : [];

    const cards = pickCardIndices(count, mustInclude);
    for (const cardIdx of cards) {
      addSymbolToCard(symbol, cardIdx);
    }
  }

  // Step 6: Ensure special card has at least MIN_CARD_SIZE non-unique symbols
  while (cardSymbols[specialCardId].size < MIN_CARD_SIZE) {
    const available = nonUniqueSymbols.filter(s => !cardSymbols[specialCardId].has(s));
    if (available.length === 0) break;

    const symbol = available[randInt(0, available.length - 1)];
    addSymbolToCard(symbol, specialCardId);

    // If symbol was only on the special card now, add it to one more card
    if ((symbolCardCount.get(symbol) ?? 0) < 2) {
      const otherCard = pickRandomCard(new Set([specialCardId]));
      addSymbolToCard(symbol, otherCard);
    }
  }

  // Step 7: Distribute unique symbols among the 11 non-special cards
  // Each non-special card gets at least 1 unique symbol
  const nonSpecialCards = shuffle(
    Array.from({ length: NUM_CARDS }, (_, i) => i).filter(i => i !== specialCardId)
  );

  let uniqueIdx = 0;

  // First pass: 1 unique per non-special card (11 cards, 15 unique symbols)
  for (const cardIdx of nonSpecialCards) {
    if (uniqueIdx < uniqueSymbols.length) {
      addSymbolToCard(uniqueSymbols[uniqueIdx], cardIdx);
      uniqueIdx++;
    }
  }

  // Second pass: distribute remaining 4 unique symbols to smallest cards
  while (uniqueIdx < uniqueSymbols.length) {
    const targetCard = [...nonSpecialCards]
      .sort((a, b) => cardSymbols[a].size - cardSymbols[b].size)[0];

    addSymbolToCard(uniqueSymbols[uniqueIdx], targetCard);
    uniqueIdx++;
  }

  // Step 8: Pad undersized cards with non-unique symbols (careful not to create ties)
  const maxAllowedCount = MOST_REPEATED_COUNT - 1; // other symbols must stay below most-repeated

  for (let i = 0; i < NUM_CARDS; i++) {
    while (cardSymbols[i].size < MIN_CARD_SIZE) {
      // Find non-unique symbols not yet on this card AND not at max allowed count
      const available = nonUniqueSymbols.filter(s =>
        !cardSymbols[i].has(s) && (symbolCardCount.get(s) ?? 0) < maxAllowedCount
      );
      if (available.length === 0) break;

      const symbol = available[randInt(0, available.length - 1)];
      addSymbolToCard(symbol, i);
    }
  }

  // Step 9: Build Card objects with random placements
  const cards: Card[] = cardSymbols.map((symbolSet, id) => {
    const shuffledSymbols = shuffle([...symbolSet]);
    const symbols: SymbolPlacement[] = shuffledSymbols.map(emoji => makeSymbolPlacement(emoji));
    return { id, symbols };
  });

  const puzzle: Puzzle = {
    cards,
    allSymbols: shuffle([...allSymbols]),
    mostRepeatedSymbol,
    uniqueSymbols,
    noUniqueCardId: specialCardId,
  };

  return puzzle;
}

/** Count how many cards each symbol appears on */
export function countSymbolOccurrences(cards: Card[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const card of cards) {
    for (const sp of card.symbols) {
      counts.set(sp.emoji, (counts.get(sp.emoji) ?? 0) + 1);
    }
  }
  return counts;
}

/** Get the set of symbols that appear on exactly one card */
export function getUniqueSymbols(cards: Card[]): Set<string> {
  const counts = countSymbolOccurrences(cards);
  const uniques = new Set<string>();
  for (const [emoji, count] of counts) {
    if (count === 1) uniques.add(emoji);
  }
  return uniques;
}

/** Get predefined positions for N symbols inside a circle */
export function getSymbolPositions(count: number): Array<{ x: number; y: number }> {
  if (count <= SYMBOL_POSITIONS.length) {
    return SYMBOL_POSITIONS.slice(0, count);
  }
  // Fallback: generate positions on a ring
  const positions = [...SYMBOL_POSITIONS];
  let ring = 1;
  while (positions.length < count) {
    const angle = (ring * 137.5 * Math.PI) / 180; // golden angle for good spacing
    const r = 0.2 + (ring % 3) * 0.12;
    positions.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
    ring++;
  }
  return positions.slice(0, count);
}
