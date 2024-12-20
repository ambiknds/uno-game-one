import React from 'react';
import { Copy, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface GameShareProps {
  gameId: string;
}

export const GameShare: React.FC<GameShareProps> = ({ gameId }) => {
  const copyGameId = async () => {
    try {
      await navigator.clipboard.writeText(gameId);
      toast.success('Game ID copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy game ID');
    }
  };

  const shareGame = async () => {
    if (!navigator.share) {
      copyGameId();
      return;
    }

    try {
      await navigator.share({
        title: 'Join my UNO game!',
        text: `Join my UNO game with ID: ${gameId}`,
        url: window.location.href,
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error('Failed to share game');
      }
    }
  };

  return (
    <div className="fixed top-4 right-4 flex gap-2">
      <button
        onClick={copyGameId}
        className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <Copy size={20} />
        <span className="hidden sm:inline">Copy ID</span>
      </button>
      <button
        onClick={shareGame}
        className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <Share2 size={20} />
        <span className="hidden sm:inline">Share</span>
      </button>
    </div>
  );
};