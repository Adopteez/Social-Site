/*
  # Add banner image to groups
  
  1. Changes
    - Add `banner_url` column to groups table for header images
  
  2. Data
    - Set Taiwan landscape images for Taiwan groups
*/

-- Add banner_url column to groups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'groups' AND column_name = 'banner_url'
  ) THEN
    ALTER TABLE groups ADD COLUMN banner_url text;
  END IF;
END $$;

-- Update Taiwan groups with Taiwan landscape images
UPDATE groups
SET banner_url = 'https://images.pexels.com/photos/2351674/pexels-photo-2351674.jpeg?auto=compress&cs=tinysrgb&w=1920'
WHERE adoption_country = 'Taiwan';
