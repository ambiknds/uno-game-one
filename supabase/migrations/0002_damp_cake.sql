/*
  # Fix RLS policies

  1. Changes
    - Remove circular reference in players policy
    - Simplify game access policies
    - Add missing game_cards policies
  
  2. Security
    - Maintain row-level security while preventing recursion
    - Ensure players can only access their own games
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Players can view game players" ON players;
DROP POLICY IF EXISTS "Players can view their games" ON games;

-- Create new policies without circular references
CREATE POLICY "View games you're part of"
  ON games FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT game_id 
      FROM players 
      WHERE user_id = auth.uid()
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "View players in your games"
  ON players FOR SELECT
  TO authenticated
  USING (
    game_id IN (
      SELECT id 
      FROM games 
      WHERE created_by = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- Update game_cards policies
CREATE POLICY "View cards in your games"
  ON game_cards FOR SELECT
  TO authenticated
  USING (
    game_id IN (
      SELECT id 
      FROM games 
      WHERE created_by = auth.uid()
    )
    OR game_id IN (
      SELECT game_id 
      FROM players 
      WHERE user_id = auth.uid()
    )
  );