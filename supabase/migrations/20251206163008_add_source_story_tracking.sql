/*
  # Add Source Story Tracking to Family Stories

  1. Changes
    - Add `source_story_id` column to `family_stories` table to link group copies to original profile story
    - This allows proper updating and deletion of stories across all groups
  
  2. Purpose
    - When a user creates a story in their profile, copies are made to their groups
    - The `source_story_id` links group copies back to the original
    - When the original is updated/deleted, all linked copies are updated/deleted
*/

-- Add source_story_id column to track which story this is copied from
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'family_stories' AND column_name = 'source_story_id'
  ) THEN
    ALTER TABLE family_stories ADD COLUMN source_story_id uuid REFERENCES family_stories(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_family_stories_source_story_id ON family_stories(source_story_id);
  END IF;
END $$;
