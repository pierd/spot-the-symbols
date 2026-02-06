import { useState, useCallback, useMemo } from 'react';
import type { Puzzle, TaskResults } from '../types';
import { generatePuzzle, getUniqueSymbols } from '../utils/generatePuzzle';

export type Screen = 'menu' | 'game';

export function useGame() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [task1Selection, setTask1Selection] = useState<string | null>(null);
  const [task2Selection, setTask2Selection] = useState<Set<string>>(new Set());
  const [task3Selection, setTask3Selection] = useState<number | null>(null);
  const [verified, setVerified] = useState(false);
  const [results, setResults] = useState<TaskResults | null>(null);

  const startGame = useCallback(() => {
    const newPuzzle = generatePuzzle();
    setPuzzle(newPuzzle);
    setTask1Selection(null);
    setTask2Selection(new Set());
    setTask3Selection(null);
    setVerified(false);
    setResults(null);
    setScreen('game');
  }, []);

  const selectTask1 = useCallback((emoji: string) => {
    if (verified) return;
    setTask1Selection(prev => prev === emoji ? null : emoji);
  }, [verified]);

  const toggleTask2 = useCallback((emoji: string) => {
    if (verified) return;
    setTask2Selection(prev => {
      const next = new Set(prev);
      if (next.has(emoji)) {
        next.delete(emoji);
      } else {
        next.add(emoji);
      }
      return next;
    });
  }, [verified]);

  const selectTask3 = useCallback((cardId: number) => {
    if (verified) return;
    setTask3Selection(prev => prev === cardId ? null : cardId);
  }, [verified]);

  const verify = useCallback(() => {
    if (!puzzle) return;

    const actualUniques = getUniqueSymbols(puzzle.cards);

    // Task 1: correct most-repeated symbol
    const task1Correct = task1Selection === puzzle.mostRepeatedSymbol;

    // Task 2: correct unique symbols
    const correctUniques = [...task2Selection].filter(s => actualUniques.has(s));
    const missedUniques = [...actualUniques].filter(s => !task2Selection.has(s));
    const wrongUniques = [...task2Selection].filter(s => !actualUniques.has(s));
    const task2Correct = missedUniques.length === 0 && wrongUniques.length === 0;

    // Task 3: correct card
    const task3Correct = task3Selection === puzzle.noUniqueCardId;

    setResults({
      task1Correct,
      task2Correct,
      task2Details: {
        correct: correctUniques,
        missed: missedUniques,
        wrong: wrongUniques,
      },
      task3Correct,
    });
    setVerified(true);
  }, [puzzle, task1Selection, task2Selection, task3Selection]);

  const playAgain = useCallback(() => {
    startGame();
  }, [startGame]);

  const backToMenu = useCallback(() => {
    setScreen('menu');
    setPuzzle(null);
    setVerified(false);
    setResults(null);
  }, []);

  const score = useMemo(() => {
    if (!results) return 0;
    return (results.task1Correct ? 1 : 0) +
      (results.task2Correct ? 1 : 0) +
      (results.task3Correct ? 1 : 0);
  }, [results]);

  return {
    screen,
    puzzle,
    task1Selection,
    task2Selection,
    task3Selection,
    verified,
    results,
    score,
    startGame,
    selectTask1,
    toggleTask2,
    selectTask3,
    verify,
    playAgain,
    backToMenu,
  };
}
