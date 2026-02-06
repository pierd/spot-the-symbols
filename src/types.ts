export interface SymbolPlacement {
  emoji: string;
  scale: number;    // 0.7 - 1.3
  rotation: number; // 0 - 360
}

export interface Card {
  id: number;
  symbols: SymbolPlacement[];
}

export interface Puzzle {
  cards: Card[];
  allSymbols: string[];
  mostRepeatedSymbol: string;
  uniqueSymbols: string[];
  noUniqueCardId: number;
}

export interface TaskResults {
  task1Correct: boolean;
  task2Correct: boolean;
  task2Details: { correct: string[]; missed: string[]; wrong: string[] };
  task3Correct: boolean;
}
