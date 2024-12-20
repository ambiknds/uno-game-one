import React from 'react';
import { Users } from 'lucide-react';

interface JoinGameProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  gameId: string;
  setGameId: (id: string) => void;
  onCreateGame: () => void;
  onJoinGame: () => void;
  isLoading: boolean;
}

export const JoinGame: React.FC<JoinGameProps> = ({
  playerName,
  setPlayerName,
  gameId,
  setGameId,
  onCreateGame,
  onJoinGame,
  isLoading,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Users className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-center mb-8">UNO Online</h1>
        
        <input
          type="text"
          placeholder="Your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg"
        />
        
        <button
          onClick={onCreateGame}
          disabled={isLoading || !playerName}
          className="w-full bg-green-600 text-white p-3 rounded-lg mb-4 hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          Create New Game
        </button>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>
        
        <input
          type="text"
          placeholder="Game ID"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg"
        />
        
        <button
          onClick={onJoinGame}
          disabled={isLoading || !gameId || !playerName}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          Join Game
        </button>
      </div>
    </div>
  );
};