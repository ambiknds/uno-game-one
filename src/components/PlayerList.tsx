import React from 'react';
import { Player } from '../types/game';

interface PlayerListProps {
  players: Player[];
  currentPlayerId?: string;
}

export const PlayerList: React.FC<PlayerListProps> = ({ players, currentPlayerId }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      {players.map((player) => (
        <div
          key={player.id}
          className={`bg-white/10 p-4 rounded-lg text-white ${
            player.user_id === currentPlayerId ? 'ring-2 ring-yellow-400' : ''
          }`}
        >
          <p className="font-semibold">{player.name}</p>
          <p className="text-sm opacity-75">{player.cards.length} cards</p>
        </div>
      ))}
    </div>
  );
};