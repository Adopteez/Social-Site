/*
  # Add image to family stories

  1. Changes
    - Add `image_url` column to family_stories table
    - Optional text field for storing image URL
  
  2. Notes
    - Images can be uploaded to Supabase storage
    - URL will be stored in this field
*/

-- Add image_url column
ALTER TABLE family_stories 
ADD COLUMN IF NOT EXISTS image_url text;
