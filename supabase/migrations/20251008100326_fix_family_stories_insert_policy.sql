/*
  # Fix Family Stories Insert Policy

  1. Changes
    - Drop existing restrictive INSERT policy
    - Create new INSERT policy that allows:
      - Profile stories (group_id IS NULL)
      - Group stories (group_id must be user's group)
  
  2. Security
    - Users can only insert stories for themselves
    - Users can only post to groups they are members of
*/

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can create own family stories" ON family_stories;

-- Create new flexible policy
CREATE POLICY "Users can create own family stories"
  ON family_stories FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = auth.uid() 
    AND (
      group_id IS NULL 
      OR group_id IN (
        SELECT group_id FROM group_subscriptions 
        WHERE profile_id = auth.uid()
      )
    )
  );
