import type { Card } from '../types';
import { SymbolCard } from './SymbolCard';

interface GameBoardProps {
  cards: Card[];
  selectedCardId: number | null;
  onSelectCard: (cardId: number) => void;
  verified: boolean;
  correctCardId: number; // the no-unique card
}

export function GameBoard({ cards, selectedCardId, onSelectCard, verified, correctCardId }: GameBoardProps) {
  return (
    <div className="game-board">
      {cards.map(card => {
        const isCorrectCard = card.id === correctCardId;
        let correctState: boolean | null = null;
        if (verified) {
          if (selectedCardId === card.id) {
            correctState = isCorrectCard;
          } else if (isCorrectCard) {
            correctState = true; // highlight the correct answer
          }
        }

        return (
          <SymbolCard
            key={card.id}
            card={card}
            selected={selectedCardId === card.id}
            correct={correctState}
            onClick={() => onSelectCard(card.id)}
            disabled={verified}
          />
        );
      })}
    </div>
  );
}
