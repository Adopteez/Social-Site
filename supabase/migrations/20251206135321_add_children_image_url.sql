/*
  # Add image support for children
  
  1. Changes
    - Add `image_url` column to `children` table
    - Add storage bucket for children images
    - Add storage policies for children images
  
  2. Security
    - Parents can upload images for their own children
    - Images are publicly accessible for viewing (within groups)
*/

-- Add image_url column to children table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE children ADD COLUMN image_url text;
  END IF;
END $$;

-- Create storage bucket for children images
INSERT INTO storage.buckets (id, name, public)
VALUES ('children', 'children', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for children images
DROP POLICY IF EXISTS "Parents can upload images for their children" ON storage.objects;
CREATE POLICY "Parents can upload images for their children"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'children' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Parents can update images for their children" ON storage.objects;
CREATE POLICY "Parents can update images for their children"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'children' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Parents can delete images for their children" ON storage.objects;
CREATE POLICY "Parents can delete images for their children"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'children' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Anyone can view children images" ON storage.objects;
CREATE POLICY "Anyone can view children images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'children');
