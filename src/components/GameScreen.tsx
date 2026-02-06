import { useTranslation } from 'react-i18next';
import { GameBoard } from './GameBoard';
import { Tasks } from './Tasks';
import type { Puzzle, TaskResults } from '../types';

interface GameScreenProps {
  puzzle: Puzzle;
  task1Selection: string | null;
  task2Selection: Set<string>;
  task3Selection: number | null;
  verified: boolean;
  results: TaskResults | null;
  score: number;
  onSelectTask1: (emoji: string) => void;
  onToggleTask2: (emoji: string) => void;
  onSelectTask3: (cardId: number) => void;
  onVerify: () => void;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export function GameScreen({
  puzzle,
  task1Selection,
  task2Selection,
  task3Selection,
  verified,
  results,
  score,
  onSelectTask1,
  onToggleTask2,
  onSelectTask3,
  onVerify,
  onPlayAgain,
  onBackToMenu,
}: GameScreenProps) {
  const { t } = useTranslation();

  return (
    <div className="game-screen">
      <GameBoard
        cards={puzzle.cards}
        selectedCardId={task3Selection}
        onSelectCard={onSelectTask3}
        verified={verified}
        correctCardId={puzzle.noUniqueCardId}
      />

      <Tasks
        allSymbols={puzzle.allSymbols}
        task1Selection={task1Selection}
        task2Selection={task2Selection}
        task3Selection={task3Selection}
        onSelectTask1={onSelectTask1}
        onToggleTask2={onToggleTask2}
        verified={verified}
        results={results}
        mostRepeatedSymbol={puzzle.mostRepeatedSymbol}
        uniqueSymbols={puzzle.uniqueSymbols}
        noUniqueCardId={puzzle.noUniqueCardId}
      />

      {verified && results ? (
        <div className="game-results">
          <div className="game-results__score">
            {t('game.score', { score, total: 3 })}
          </div>
          <button className="btn btn--primary" onClick={onPlayAgain} type="button">
            {t('game.playAgain')}
          </button>
        </div>
      ) : (
        <button className="btn btn--verify" onClick={onVerify} type="button">
          {t('game.verify')}
        </button>
      )}

      <button className="btn btn--back" onClick={onBackToMenu} type="button">
        {t('game.backToMenu')}
      </button>
    </div>
  );
}
