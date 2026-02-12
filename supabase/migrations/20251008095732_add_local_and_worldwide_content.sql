/*
  # Add separate local and worldwide content fields

  1. Changes
    - Rename `content` to `content_local` (for local language)
    - Add `content_worldwide` (for English/worldwide groups)
    - Make both fields optional (at least one must be filled)
    - Keep existing data in content_local
  
  2. Notes
    - Existing content will be migrated to content_local
    - Users can provide one or both versions of their story
*/

-- Add new worldwide content column
ALTER TABLE family_stories 
ADD COLUMN IF NOT EXISTS content_worldwide text;

-- Rename existing content to content_local
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'family_stories' AND column_name = 'content'
  ) THEN
    ALTER TABLE family_stories RENAME COLUMN content TO content_local;
  END IF;
END $$;

-- Make content_local nullable (at least one content field should be filled)
ALTER TABLE family_stories 
ALTER COLUMN content_local DROP NOT NULL;
