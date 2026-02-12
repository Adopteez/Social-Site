/*
  # Add Group Banners Storage

  1. Storage
    - Create `group-banners` storage bucket for group banner images
    - Set public access for viewing banners
    - Add RLS policies for upload/delete permissions
  
  2. Security
    - Only authenticated users can upload banners
    - Only group admins can update their group banners
    - Public read access for all banners
*/

-- Create storage bucket for group banners
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'group-banners',
  'group-banners',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload group banners" ON storage.objects;
DROP POLICY IF EXISTS "Group admins can update their group banners" ON storage.objects;
DROP POLICY IF EXISTS "Group admins can delete their group banners" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view group banners" ON storage.objects;

-- Allow authenticated users to upload group banners
CREATE POLICY "Authenticated users can upload group banners"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'group-banners');

-- Allow users to update their own group banners (if they are group admin)
CREATE POLICY "Group admins can update their group banners"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'group-banners' AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.profile_id = auth.uid()
      AND group_members.role = 'admin'
      AND storage.objects.name LIKE group_members.group_id::text || '%'
    )
  );

-- Allow group admins to delete their group banners
CREATE POLICY "Group admins can delete their group banners"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'group-banners' AND
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.profile_id = auth.uid()
      AND group_members.role = 'admin'
      AND storage.objects.name LIKE group_members.group_id::text || '%'
    )
  );

-- Public read access for all group banners
CREATE POLICY "Anyone can view group banners"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'group-banners');
