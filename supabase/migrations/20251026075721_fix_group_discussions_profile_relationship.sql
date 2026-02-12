/*
  # Fix Group Discussions Profile Relationship

  1. Changes
    - Add profile_id column to group_discussions table
    - Add foreign key constraint to profiles table
    - Populate profile_id with existing user_id values
    - Add profile_id column to discussion_replies table
    - Add foreign key constraint to profiles table for replies
    - Populate profile_id in discussion_replies with existing user_id values
    
  2. Notes
    - Keeps user_id for backwards compatibility
    - Enables proper joins with profiles table
    - Both user_id and profile_id will have the same value (auth.users.id = profiles.id)
*/

-- Add profile_id column to group_discussions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'group_discussions' AND column_name = 'profile_id'
  ) THEN
    ALTER TABLE group_discussions ADD COLUMN profile_id uuid;
  END IF;
END $$;

-- Populate profile_id with user_id values
UPDATE group_discussions SET profile_id = user_id WHERE profile_id IS NULL;

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'group_discussions_profile_id_fkey' 
    AND table_name = 'group_discussions'
  ) THEN
    ALTER TABLE group_discussions
    ADD CONSTRAINT group_discussions_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Make profile_id NOT NULL after populating
ALTER TABLE group_discussions ALTER COLUMN profile_id SET NOT NULL;

-- Add profile_id column to discussion_replies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'discussion_replies' AND column_name = 'profile_id'
  ) THEN
    ALTER TABLE discussion_replies ADD COLUMN profile_id uuid;
  END IF;
END $$;

-- Populate profile_id with user_id values
UPDATE discussion_replies SET profile_id = user_id WHERE profile_id IS NULL;

-- Add foreign key constraint for replies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'discussion_replies_profile_id_fkey' 
    AND table_name = 'discussion_replies'
  ) THEN
    ALTER TABLE discussion_replies
    ADD CONSTRAINT discussion_replies_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Make profile_id NOT NULL after populating
ALTER TABLE discussion_replies ALTER COLUMN profile_id SET NOT NULL;
