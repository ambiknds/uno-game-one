import React, { useEffect } from 'react';
import { Card } from './Card';
import { PlayerList } from './PlayerList';
import { PlayerHand } from './PlayerHand';
import { GameShare } from './GameShare';
import { useGameStore } from '../store/gameStore';
import { CardColor } from '../types/game';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface GameBoardProps {
  gameId: string;
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameId }) => {
  const { game, myCards, players, playCard, setGame, setPlayers, setMyCards } = useGameStore();

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select('*')
          .eq('id', gameId)
          .single();

        if (gameError) throw gameError;
        setGame(gameData);

        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('game_id', gameId);

        if (playersError) throw playersError;
        setPlayers(playersData);

        // Get current user's cards
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const currentPlayer = playersData.find(p => p.user_id === user.id);
          if (currentPlayer) {
            setMyCards(currentPlayer.cards || []);
          }
        }
      } catch (error) {
        console.error('Error fetching game data:', error);
        toast.error('Failed to load game data');
      }
    };

    fetchGameData();

    // Subscribe to game updates
    const gameSubscription = supabase
      .channel(`game:${gameId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'games',
        filter: `id=eq.${gameId}`
      }, payload => {
        setGame(payload.new);
      })
      .subscribe();

    return () => {
      gameSubscription.unsubscribe();
    };
  }, [gameId, setGame, setPlayers, setMyCards]);

  const handleCardPlay = async (cardIndex: number) => {
    const card = myCards[cardIndex];
    if (!card) return;

    if (card.type === 'wild' || card.type === 'wild4') {
      const colors: CardColor[] = ['red', 'blue', 'green', 'yellow'];
      const color = prompt(`Choose color: ${colors.join(', ')}`) as CardColor;
      if (!colors.includes(color)) {
        toast.error('Invalid color selected');
        return;
      }
      await playCard(card, color);
    } else {
      await playCard(card);
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-green-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-800 p-4">
      <GameShare gameId={gameId} />
      <div className="max-w-7xl mx-auto">
        <PlayerList 
          players={players} 
          currentPlayerId={game.current_player_id} 
        />

        <div className="flex justify-center mb-8">
          {game.last_card && (
            <Card card={game.last_card} className="transform scale-125" />
          )}
        </div>

        <PlayerHand 
          cards={myCards} 
          onPlayCard={handleCardPlay} 
        />
      </div>
    </div>
  );
};