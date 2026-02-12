/*
  # Add Pinned Discussion Feature

  1. Changes
    - Add `pinned` column to `group_discussions` table
    - Add `pinned_at` column to track when discussion was pinned
    - Add `pinned_by` column to track who pinned it
    - Default pinned to false
    - Add index for better query performance on pinned discussions

  2. Security
    - No RLS changes needed - existing policies handle access
*/

-- Add pinned columns to group_discussions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'group_discussions' AND column_name = 'pinned'
  ) THEN
    ALTER TABLE group_discussions ADD COLUMN pinned boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'group_discussions' AND column_name = 'pinned_at'
  ) THEN
    ALTER TABLE group_discussions ADD COLUMN pinned_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'group_discussions' AND column_name = 'pinned_by'
  ) THEN
    ALTER TABLE group_discussions ADD COLUMN pinned_by uuid REFERENCES profiles(id);
  END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_group_discussions_pinned ON group_discussions(group_id, pinned, created_at DESC);