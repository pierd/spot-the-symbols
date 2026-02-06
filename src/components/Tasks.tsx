import { useTranslation } from 'react-i18next';
import { SymbolPicker } from './SymbolPicker';
import type { TaskResults } from '../types';

interface TasksProps {
  allSymbols: string[];
  task1Selection: string | null;
  task2Selection: Set<string>;
  task3Selection: number | null;
  onSelectTask1: (emoji: string) => void;
  onToggleTask2: (emoji: string) => void;
  verified: boolean;
  results: TaskResults | null;
  mostRepeatedSymbol: string;
  uniqueSymbols: string[];
  noUniqueCardId: number;
}

export function Tasks({
  allSymbols,
  task1Selection,
  task2Selection,
  task3Selection,
  onSelectTask1,
  onToggleTask2,
  verified,
  results,
  mostRepeatedSymbol,
  uniqueSymbols,
  noUniqueCardId,
}: TasksProps) {
  const { t } = useTranslation();
  const uniqueSet = new Set(uniqueSymbols);

  return (
    <div className="tasks">
      {/* Task 1: Find the most repeated symbol */}
      <div className="task-section">
        <div className="task-header">
          <span className="task-number">1</span>
          <h3 className="task-title">{t('game.task1Title')}</h3>
        </div>
        <p className="task-description">{t('game.task1Description')}</p>
        <SymbolPicker
          symbols={allSymbols}
          mode="single"
          selected={task1Selection}
          onSelect={onSelectTask1}
          disabled={verified}
          correctSet={new Set([mostRepeatedSymbol])}
          verified={verified}
        />
        {verified && results && (
          <div className={`task-result ${results.task1Correct ? 'task-result--correct' : 'task-result--wrong'}`}>
            {results.task1Correct
              ? t('game.correct')
              : `${t('game.incorrect')} ${mostRepeatedSymbol}`}
          </div>
        )}
      </div>

      {/* Task 2: Find all unique symbols */}
      <div className="task-section">
        <div className="task-header">
          <span className="task-number">2</span>
          <h3 className="task-title">{t('game.task2Title')}</h3>
        </div>
        <p className="task-description">{t('game.task2Description')}</p>
        <SymbolPicker
          symbols={allSymbols}
          mode="multi"
          selected={task2Selection}
          onSelect={onToggleTask2}
          disabled={verified}
          correctSet={uniqueSet}
          verified={verified}
        />
        {verified && results && (
          <div className={`task-result ${results.task2Correct ? 'task-result--correct' : 'task-result--wrong'}`}>
            {results.task2Correct
              ? t('game.correct')
              : `${t('game.task2Result', {
                  correct: results.task2Details.correct.length,
                  missed: results.task2Details.missed.length,
                  wrong: results.task2Details.wrong.length,
                })}`}
          </div>
        )}
      </div>

      {/* Task 3: Find the card without unique symbols */}
      <div className="task-section">
        <div className="task-header">
          <span className="task-number">3</span>
          <h3 className="task-title">{t('game.task3Title')}</h3>
        </div>
        <p className="task-description">{t('game.task3Description')}</p>
        {task3Selection !== null && !verified && (
          <div className="task-selection-indicator">
            {t('game.task3Selected', { card: task3Selection + 1 })}
          </div>
        )}
        {verified && results && (
          <div className={`task-result ${results.task3Correct ? 'task-result--correct' : 'task-result--wrong'}`}>
            {results.task3Correct
              ? t('game.correct')
              : `${t('game.incorrect')} ${t('game.card')} ${noUniqueCardId + 1}`}
          </div>
        )}
      </div>
    </div>
  );
}
