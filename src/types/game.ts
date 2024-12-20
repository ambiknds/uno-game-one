export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type CardType = 'number' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4';

export interface Card {
  id: string;
  color: CardColor;
  type: CardType;
  value: number | null;
}

export interface Game {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  current_player_id: string;
  direction: boolean;
  status: 'waiting' | 'playing' | 'finished';
  winner_id: string | null;
  current_color: CardColor;
  last_card: Card;
}

export interface Player {
  id: string;
  game_id: string;
  user_id: string;
  cards: Card[];
  player_order: number;
  name: string;
  created_at: string;
}