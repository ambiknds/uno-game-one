import React from 'react';
import { Card as CardComponent } from './Card';
import { Card, CardColor } from '../types/game';

interface PlayerHandProps {
  cards: Card[];
  onPlayCard: (cardIndex: number, color?: CardColor) => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ cards, onPlayCard }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/20">
      <div className="flex gap-2 overflow-x-auto pb-4 snap-x">
        {cards.map((card, index) => (
          <div key={card.id} className="snap-center">
            <CardComponent
              card={card}
              onClick={() => onPlayCard(index)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};