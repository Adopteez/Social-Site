/*
  # Add Video URL Support to Posts

  1. Changes
    - Add `video_url` column to `posts` table to store YouTube/video links
    - This allows users to share video content in their posts
  
  2. Notes
    - Video URL is optional (nullable)
    - Can be used alongside or instead of image_url
    - Frontend will handle YouTube embed conversion
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE posts ADD COLUMN video_url text;
  END IF;
END $$;
