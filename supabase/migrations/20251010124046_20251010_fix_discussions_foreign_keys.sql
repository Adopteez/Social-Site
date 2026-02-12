/*
  # Fix Group Discussions Foreign Keys

  1. Changes
    - Add missing foreign key constraint from group_discussions.user_id to auth.users.id
    - Add missing foreign key constraint from discussion_replies.user_id to auth.users.id
    
  2. Notes
    - These constraints were defined in the original migration but weren't created
    - This ensures proper referential integrity and enables proper joins
*/

-- Add foreign key constraint for group_discussions.user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'group_discussions_user_id_fkey' 
    AND table_name = 'group_discussions'
  ) THEN
    ALTER TABLE group_discussions
    ADD CONSTRAINT group_discussions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key constraint for discussion_replies.user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'discussion_replies_user_id_fkey' 
    AND table_name = 'discussion_replies'
  ) THEN
    ALTER TABLE discussion_replies
    ADD CONSTRAINT discussion_replies_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;
