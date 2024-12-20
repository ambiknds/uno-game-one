import React from 'react';
import { Card as CardType } from '../types/game';
import { clsx } from 'clsx';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ card, onClick, className }) => {
  const bgColor = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    wild: 'bg-gradient-to-r from-red-500 via-blue-500 to-green-500',
  }[card.color];

  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative w-24 h-36 rounded-xl shadow-lg cursor-pointer transform transition-transform hover:-translate-y-2',
        bgColor,
        className
      )}
    >
      <div className="absolute inset-1 bg-white/90 rounded-lg flex items-center justify-center">
        <div className="text-2xl font-bold">
          {card.type === 'number' ? card.value : card.type}
        </div>
      </div>
    </div>
  );
};