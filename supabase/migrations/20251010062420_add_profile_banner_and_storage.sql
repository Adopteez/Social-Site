/*
  # Add Profile Banner and Storage for Profile Images

  1. Changes
    - Add `banner_url` column to `profiles` table
    - Create `profile-images` storage bucket for avatars and banners
    - Set up storage policies for authenticated users

  2. Security
    - Users can upload their own profile images
    - Users can view all profile images (public read)
    - Users can only update/delete their own images
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'banner_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN banner_url text;
  END IF;
END $$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own profile images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-images' AND
    (storage.foldername(name))[1] IN ('avatars', 'banners') AND
    (SELECT split_part((storage.foldername(name))[2], '-', 1)) = auth.uid()::text
  );

CREATE POLICY "Anyone can view profile images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'profile-images');

CREATE POLICY "Users can update their own profile images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-images' AND
    (SELECT split_part((storage.foldername(name))[2], '-', 1)) = auth.uid()::text
  );

CREATE POLICY "Users can delete their own profile images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-images' AND
    (SELECT split_part((storage.foldername(name))[2], '-', 1)) = auth.uid()::text
  );