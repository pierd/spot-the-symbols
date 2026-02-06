import type { Card } from '../types';
import { getSymbolPositions } from '../utils/generatePuzzle';

interface SymbolCardProps {
  card: Card;
  selected: boolean;
  correct?: boolean | null; // null = not verified, true/false = result
  onClick: () => void;
  disabled: boolean;
}

export function SymbolCard({ card, selected, correct, onClick, disabled }: SymbolCardProps) {
  const positions = getSymbolPositions(card.symbols.length);

  let className = 'symbol-card';
  if (selected) className += ' symbol-card--selected';
  if (correct === true) className += ' symbol-card--correct';
  if (correct === false && selected) className += ' symbol-card--incorrect';

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      type="button"
      aria-label={`Card ${card.id + 1}`}
    >
      <div className="symbol-card__inner">
        {card.symbols.map((sp, i) => {
          const pos = positions[i];
          return (
            <span
              key={`${sp.emoji}-${i}`}
              className="symbol-card__symbol"
              style={{
                left: `${50 + pos.x * 50}%`,
                top: `${50 + pos.y * 50}%`,
                transform: `translate(-50%, -50%) scale(${sp.scale}) rotate(${sp.rotation}deg)`,
              }}
            >
              {sp.emoji}
            </span>
          );
        })}
      </div>
    </button>
  );
}
