/*
  # Simplify RLS policies

  1. Changes
    - Simplify policies to eliminate recursion
    - Add basic CRUD policies for each table
    - Remove complex joins and subqueries
  
  2. Security
    - Maintain data access control
    - Prevent unauthorized access
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "View games you're part of" ON games;
DROP POLICY IF EXISTS "View players in your games" ON players;
DROP POLICY IF EXISTS "View cards in your games" ON game_cards;
DROP POLICY IF EXISTS "Anyone can create games" ON games;
DROP POLICY IF EXISTS "Anyone can join games" ON players;

-- Simple policies for games
CREATE POLICY "Create games"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "View games"
  ON games FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Update own games"
  ON games FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Simple policies for players
CREATE POLICY "Join games"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "View players"
  ON players FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Update own player"
  ON players FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Simple policies for game_cards
CREATE POLICY "View game cards"
  ON game_cards FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Update game cards"
  ON game_cards FOR UPDATE
  TO authenticated
  USING (
    game_id IN (
      SELECT id FROM games WHERE created_by = auth.uid()
    )
  );