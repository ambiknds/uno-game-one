/*
  # Uno Game Schema

  1. New Tables
    - `games`
      - Stores active game sessions
      - Includes game state, current player, direction
    - `players`
      - Stores player information for each game
      - Includes player cards, order, name
    - `game_cards`
      - Stores the deck and discard pile for each game
  
  2. Security
    - Enable RLS on all tables
    - Add policies for game access and updates
*/

-- Create enum for card colors
CREATE TYPE card_color AS ENUM ('red', 'blue', 'green', 'yellow', 'wild');

-- Create enum for card types
CREATE TYPE card_type AS ENUM ('number', 'skip', 'reverse', 'draw2', 'wild', 'wild4');

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  current_player_id uuid REFERENCES auth.users(id),
  direction boolean DEFAULT true, -- true = clockwise
  status text DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  winner_id uuid REFERENCES auth.users(id),
  current_color card_color,
  last_card jsonb
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  cards jsonb DEFAULT '[]'::jsonb,
  player_order integer,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (game_id, user_id)
);

-- Create game_cards table for deck and discard pile
CREATE TABLE IF NOT EXISTS game_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  deck jsonb DEFAULT '[]'::jsonb,
  discard_pile jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_cards ENABLE ROW LEVEL SECURITY;

-- Policies for games
CREATE POLICY "Anyone can create games"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Players can view their games"
  ON games FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.game_id = games.id
      AND players.user_id = auth.uid()
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "Players can update their games"
  ON games FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.game_id = games.id
      AND players.user_id = auth.uid()
    )
  );

-- Policies for players
CREATE POLICY "Anyone can join games"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Players can view game players"
  ON players FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players p2
      WHERE p2.game_id = players.game_id
      AND p2.user_id = auth.uid()
    )
  );

CREATE POLICY "Players can update their own data"
  ON players FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Policies for game_cards
CREATE POLICY "Players can view game cards"
  ON game_cards FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.game_id = game_cards.game_id
      AND players.user_id = auth.uid()
    )
  );

CREATE POLICY "Players can update game cards"
  ON game_cards FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE players.game_id = game_cards.game_id
      AND players.user_id = auth.uid()
    )
  );

-- Function to create a new game with initial deck
CREATE OR REPLACE FUNCTION create_game_with_deck(creator_id uuid, game_id uuid)
RETURNS void AS $$
DECLARE
  initial_deck jsonb;
BEGIN
  -- Create initial deck with all Uno cards
  WITH cards AS (
    -- Number cards (0-9) for each color
    SELECT jsonb_build_object(
      'id', gen_random_uuid(),
      'color', color,
      'type', 'number',
      'value', num
    ) as card
    FROM unnest(ARRAY['red', 'blue', 'green', 'yellow']) as color
    CROSS JOIN generate_series(0, 9) as num
    UNION ALL
    -- Action cards (skip, reverse, draw2) for each color
    SELECT jsonb_build_object(
      'id', gen_random_uuid(),
      'color', color,
      'type', action,
      'value', null
    )
    FROM unnest(ARRAY['red', 'blue', 'green', 'yellow']) as color
    CROSS JOIN unnest(ARRAY['skip', 'reverse', 'draw2']) as action
    UNION ALL
    -- Wild cards
    SELECT jsonb_build_object(
      'id', gen_random_uuid(),
      'color', 'wild',
      'type', wild_type,
      'value', null
    )
    FROM unnest(ARRAY['wild', 'wild4']) as wild_type
  )
  SELECT jsonb_agg(card) INTO initial_deck
  FROM cards;

  -- Insert shuffled deck into game_cards
  INSERT INTO game_cards (game_id, deck)
  VALUES (game_id, initial_deck);
END;
$$ LANGUAGE plpgsql;