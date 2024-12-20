import React, { useState, useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { JoinGame } from './components/JoinGame';
import { supabase } from './lib/supabase';
import { signInAnonymously } from './lib/auth';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

export default function App() {
  const [gameId, setGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          await signInAnonymously();
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth initialization error:', error);
        toast.error('Failed to initialize authentication');
      }
    };

    initAuth();
  }, []);

  const createGame = async () => {
    if (!isAuthenticated) {
      toast.error('Please wait for authentication to complete');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: game, error: gameError } = await supabase
        .from('games')
        .insert({ created_by: user.id })
        .select()
        .single();

      if (gameError) throw gameError;

      if (game) {
        const { error: playerError } = await supabase.from('players').insert({
          game_id: game.id,
          user_id: user.id,
          name: playerName,
          player_order: 1
        });

        if (playerError) throw playerError;

        setGameId(game.id);
        toast.success('Game created! Share the game ID with your friends.');
      }
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const joinGame = async () => {
    if (!isAuthenticated) {
      toast.error('Please wait for authentication to complete');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('player_order')
        .eq('game_id', gameId)
        .order('player_order', { ascending: false });

      if (playersError) throw playersError;

      const nextOrder = players?.[0]?.player_order + 1 || 1;

      const { error: joinError } = await supabase.from('players').insert({
        game_id: gameId,
        user_id: user.id,
        name: playerName,
        player_order: nextOrder
      });

      if (joinError) throw joinError;
      
      toast.success('Successfully joined the game!');
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game. Please check the game ID and try again.');
      setGameId('');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!gameId) {
    return (
      <>
        <JoinGame
          playerName={playerName}
          setPlayerName={setPlayerName}
          gameId={gameId}
          setGameId={setGameId}
          onCreateGame={createGame}
          onJoinGame={joinGame}
          isLoading={isLoading}
        />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <GameBoard gameId={gameId} />
      <Toaster />
    </>
  );
}