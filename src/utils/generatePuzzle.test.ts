import {
  generatePuzzle,
  countSymbolOccurrences,
  getUniqueSymbols,
  getSymbolPositions,
} from './generatePuzzle';
import type { Puzzle } from '../types';

describe('generatePuzzle', () => {
  let puzzle: Puzzle;

  beforeEach(() => {
    puzzle = generatePuzzle();
  });

  it('produces exactly 12 cards', () => {
    expect(puzzle.cards).toHaveLength(12);
  });

  it('uses exactly 30 distinct symbols in allSymbols', () => {
    expect(puzzle.allSymbols).toHaveLength(30);
    expect(new Set(puzzle.allSymbols).size).toBe(30);
  });

  it('assigns consecutive card ids 0-11', () => {
    const ids = puzzle.cards.map(c => c.id).sort((a, b) => a - b);
    expect(ids).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('gives each card at least 5 symbols', () => {
    for (const card of puzzle.cards) {
      expect(card.symbols.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('has no duplicate symbols within a single card', () => {
    for (const card of puzzle.cards) {
      const emojis = card.symbols.map(s => s.emoji);
      expect(new Set(emojis).size).toBe(emojis.length);
    }
  });

  it('only uses symbols that are in allSymbols', () => {
    const allSet = new Set(puzzle.allSymbols);
    for (const card of puzzle.cards) {
      for (const sp of card.symbols) {
        expect(allSet.has(sp.emoji)).toBe(true);
      }
    }
  });

  it('gives each symbol placement a valid scale (0.7-1.3)', () => {
    for (const card of puzzle.cards) {
      for (const sp of card.symbols) {
        expect(sp.scale).toBeGreaterThanOrEqual(0.7);
        expect(sp.scale).toBeLessThanOrEqual(1.3);
      }
    }
  });

  it('gives each symbol placement a valid rotation (0-359)', () => {
    for (const card of puzzle.cards) {
      for (const sp of card.symbols) {
        expect(sp.rotation).toBeGreaterThanOrEqual(0);
        expect(sp.rotation).toBeLessThanOrEqual(359);
        expect(Number.isInteger(sp.rotation)).toBe(true);
      }
    }
  });
});

describe('most repeated symbol constraint', () => {
  it('is included in allSymbols', () => {
    const puzzle = generatePuzzle();
    expect(puzzle.allSymbols).toContain(puzzle.mostRepeatedSymbol);
  });

  it('appears on more cards than any other symbol', () => {
    const puzzle = generatePuzzle();
    const counts = countSymbolOccurrences(puzzle.cards);
    const mostCount = counts.get(puzzle.mostRepeatedSymbol)!;
    const maxCount = Math.max(...counts.values());

    expect(mostCount).toBe(maxCount);

    // Strictly the most: no other symbol has the same count
    for (const [emoji, count] of counts) {
      if (emoji !== puzzle.mostRepeatedSymbol) {
        expect(count).toBeLessThan(mostCount);
      }
    }
  });
});

describe('unique symbols constraint', () => {
  it('has exactly 15 unique symbols (half of 30)', () => {
    const puzzle = generatePuzzle();
    const uniques = getUniqueSymbols(puzzle.cards);
    expect(uniques.size).toBe(15);
  });

  it('puzzle.uniqueSymbols matches the actual unique symbols from the cards', () => {
    const puzzle = generatePuzzle();
    const actualUniques = getUniqueSymbols(puzzle.cards);
    const declared = new Set(puzzle.uniqueSymbols);

    expect(declared.size).toBe(actualUniques.size);
    for (const s of actualUniques) {
      expect(declared.has(s)).toBe(true);
    }
  });

  it('unique symbols each appear on exactly 1 card', () => {
    const puzzle = generatePuzzle();
    const counts = countSymbolOccurrences(puzzle.cards);
    for (const sym of puzzle.uniqueSymbols) {
      expect(counts.get(sym)).toBe(1);
    }
  });

  it('non-unique symbols each appear on 2+ cards', () => {
    const puzzle = generatePuzzle();
    const counts = countSymbolOccurrences(puzzle.cards);
    const uniqueSet = new Set(puzzle.uniqueSymbols);
    for (const [emoji, count] of counts) {
      if (!uniqueSet.has(emoji)) {
        expect(count).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe('special card (no unique symbols) constraint', () => {
  it('noUniqueCardId is a valid card index', () => {
    const puzzle = generatePuzzle();
    expect(puzzle.noUniqueCardId).toBeGreaterThanOrEqual(0);
    expect(puzzle.noUniqueCardId).toBeLessThan(12);
  });

  it('the special card has zero unique symbols', () => {
    const puzzle = generatePuzzle();
    const uniques = getUniqueSymbols(puzzle.cards);
    const specialCard = puzzle.cards[puzzle.noUniqueCardId];

    for (const sp of specialCard.symbols) {
      expect(uniques.has(sp.emoji)).toBe(false);
    }
  });

  it('every other card has at least one unique symbol', () => {
    const puzzle = generatePuzzle();
    const uniques = getUniqueSymbols(puzzle.cards);

    for (const card of puzzle.cards) {
      if (card.id === puzzle.noUniqueCardId) continue;
      const hasUnique = card.symbols.some(s => uniques.has(s.emoji));
      expect(hasUnique).toBe(true);
    }
  });

  it('the special card is the only card with no unique symbols', () => {
    const puzzle = generatePuzzle();
    const uniques = getUniqueSymbols(puzzle.cards);

    const cardsWithNoUniques = puzzle.cards.filter(
      card => !card.symbols.some(s => uniques.has(s.emoji))
    );
    expect(cardsWithNoUniques).toHaveLength(1);
    expect(cardsWithNoUniques[0].id).toBe(puzzle.noUniqueCardId);
  });
});

describe('stress test: all constraints hold over many generations', () => {
  const ITERATIONS = 100;

  it(`passes all constraints across ${ITERATIONS} generated puzzles`, () => {
    for (let i = 0; i < ITERATIONS; i++) {
      const puzzle = generatePuzzle();
      const counts = countSymbolOccurrences(puzzle.cards);
      const uniques = getUniqueSymbols(puzzle.cards);

      // 12 cards, 30 symbols
      expect(puzzle.cards).toHaveLength(12);
      expect(puzzle.allSymbols).toHaveLength(30);
      expect(new Set(puzzle.allSymbols).size).toBe(30);

      // Each card has >= 5 symbols, no internal duplicates
      for (const card of puzzle.cards) {
        expect(card.symbols.length).toBeGreaterThanOrEqual(5);
        const emojis = card.symbols.map(s => s.emoji);
        expect(new Set(emojis).size).toBe(emojis.length);
      }

      // Exactly 15 unique symbols
      expect(uniques.size).toBe(15);

      // Most repeated is strictly the max
      const mostCount = counts.get(puzzle.mostRepeatedSymbol)!;
      const maxCount = Math.max(...counts.values());
      expect(mostCount).toBe(maxCount);
      const symbolsAtMax = [...counts.values()].filter(c => c === maxCount).length;
      expect(symbolsAtMax).toBe(1);

      // Special card has no uniques
      const specialCard = puzzle.cards[puzzle.noUniqueCardId];
      expect(specialCard.symbols.some(s => uniques.has(s.emoji))).toBe(false);

      // All other cards have at least one unique
      for (const card of puzzle.cards) {
        if (card.id === puzzle.noUniqueCardId) continue;
        expect(card.symbols.some(s => uniques.has(s.emoji))).toBe(true);
      }
    }
  });
});

describe('countSymbolOccurrences', () => {
  it('correctly counts symbol occurrences across cards', () => {
    const puzzle = generatePuzzle();
    const counts = countSymbolOccurrences(puzzle.cards);

    // Manual count for one symbol
    const symbol = puzzle.cards[0].symbols[0].emoji;
    let manualCount = 0;
    for (const card of puzzle.cards) {
      if (card.symbols.some(s => s.emoji === symbol)) {
        manualCount++;
      }
    }
    expect(counts.get(symbol)).toBe(manualCount);
  });

  it('includes all symbols that appear on cards', () => {
    const puzzle = generatePuzzle();
    const counts = countSymbolOccurrences(puzzle.cards);
    const allOnCards = new Set<string>();
    for (const card of puzzle.cards) {
      for (const sp of card.symbols) {
        allOnCards.add(sp.emoji);
      }
    }
    expect(counts.size).toBe(allOnCards.size);
  });
});

describe('getUniqueSymbols', () => {
  it('returns only symbols that appear on exactly one card', () => {
    const puzzle = generatePuzzle();
    const counts = countSymbolOccurrences(puzzle.cards);
    const uniques = getUniqueSymbols(puzzle.cards);

    for (const sym of uniques) {
      expect(counts.get(sym)).toBe(1);
    }

    // And no symbol with count 1 is missing
    for (const [emoji, count] of counts) {
      if (count === 1) {
        expect(uniques.has(emoji)).toBe(true);
      }
    }
  });
});

describe('getSymbolPositions', () => {
  it('returns the exact number of positions requested', () => {
    for (const n of [1, 3, 5, 7, 9, 12]) {
      expect(getSymbolPositions(n)).toHaveLength(n);
    }
  });

  it('returns positions within the unit circle range', () => {
    const positions = getSymbolPositions(9);
    for (const pos of positions) {
      expect(pos.x).toBeGreaterThanOrEqual(-1);
      expect(pos.x).toBeLessThanOrEqual(1);
      expect(pos.y).toBeGreaterThanOrEqual(-1);
      expect(pos.y).toBeLessThanOrEqual(1);
    }
  });

  it('handles counts larger than predefined positions', () => {
    const positions = getSymbolPositions(15);
    expect(positions).toHaveLength(15);
    for (const pos of positions) {
      expect(typeof pos.x).toBe('number');
      expect(typeof pos.y).toBe('number');
    }
  });
});
