import { create } from 'zustand';
import { Card, Game, Player } from '../types/game';
import { supabase } from '../lib/supabase';

interface GameState {
  game: Game | null;
  players: Player[];
  currentPlayer: Player | null;
  myCards: Card[];
  setGame: (game: Game) => void;
  setPlayers: (players: Player[]) => void;
  setMyCards: (cards: Card[]) => void;
  playCard: (card: Card, chosenColor?: string) => Promise<void>;
  drawCard: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  game: null,
  players: [],
  currentPlayer: null,
  myCards: [],
  
  setGame: (game) => set({ game }),
  setPlayers: (players) => set({ players }),
  setMyCards: (cards) => set({ myCards: cards }),

  playCard: async (card, chosenColor) => {
    const { game } = get();
    if (!game) return;

    // Update game state logic here
    const { data, error } = await supabase
      .from('games')
      .update({
        current_color: chosenColor || card.color,
        last_card: card,
        // Add more game state updates
      })
      .eq('id', game.id);

    if (error) throw error;
  },

  drawCard: async () => {
    const { game } = get();
    if (!game) return;

    // Draw card logic here
    // Update player's cards and game state
  },
}));