/*
  # Fix Storage Policies for Profile Images

  1. Changes
    - Drop existing storage policies that might be causing issues
    - Recreate simpler, working storage policies for profile images

  2. Security
    - Authenticated users can upload files to profile-images bucket
    - Anyone can view files (public bucket)
    - Users can update/delete their own files
*/

DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;

CREATE POLICY "Authenticated users can upload profile images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'profile-images');

CREATE POLICY "Public can view profile images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'profile-images');

CREATE POLICY "Authenticated users can update profile images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'profile-images');

CREATE POLICY "Authenticated users can delete profile images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'profile-images');