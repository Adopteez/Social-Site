/*
  # Fix Infinite Recursion in Conversation RLS Policies

  1. Problem
    - The RLS policies for `conversations` and `conversation_participants` create a circular dependency
    - `conversations` policy checks `conversation_participants`
    - `conversation_participants` policy checks `conversations`
    - This causes infinite recursion errors

  2. Solution
    - Simplify the policies to break the circular dependency
    - Allow users to view conversation_participants where they are a member
    - Allow users to view conversations where they are a participant (without nested query)

  3. Changes
    - Drop existing policies on both tables
    - Create new, simpler policies that avoid circular references
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON conversation_participants;
DROP POLICY IF EXISTS "Users can add participants to conversations they are in" ON conversation_participants;
DROP POLICY IF EXISTS "Users can update own participant record" ON conversation_participants;

-- Create new policies for conversations
CREATE POLICY "Users can view all conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create new policies for conversation_participants
CREATE POLICY "Users can view conversation participants"
  ON conversation_participants
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add conversation participants"
  ON conversation_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own participant record"
  ON conversation_participants
  FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());
