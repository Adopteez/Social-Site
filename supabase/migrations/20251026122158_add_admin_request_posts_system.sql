/*
  # Admin Request Posts System

  1. Changes
    - Add admin_request_id column to posts table to link posts to admin requests
    - Add is_system_post flag to identify automated system posts
    - Make author_id nullable for system posts
    - Add system_author_name and system_author_avatar for system posts display

  2. Security
    - System posts can be created by authenticated users (triggered by application logic)
    - All users can view system posts like regular posts
*/

-- Make author_id nullable to allow system posts
DO $$
BEGIN
  ALTER TABLE posts ALTER COLUMN author_id DROP NOT NULL;
END $$;

-- Add new columns for admin request posts and system posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'admin_request_id'
  ) THEN
    ALTER TABLE posts ADD COLUMN admin_request_id uuid REFERENCES admin_requests(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'is_system_post'
  ) THEN
    ALTER TABLE posts ADD COLUMN is_system_post boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'system_author_name'
  ) THEN
    ALTER TABLE posts ADD COLUMN system_author_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'system_author_avatar'
  ) THEN
    ALTER TABLE posts ADD COLUMN system_author_avatar text;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_posts_admin_request_id ON posts(admin_request_id);

-- Add constraint: either author_id or is_system_post must be set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_author_or_system_check'
  ) THEN
    ALTER TABLE posts ADD CONSTRAINT posts_author_or_system_check 
    CHECK (
      (author_id IS NOT NULL AND is_system_post = false) OR
      (author_id IS NULL AND is_system_post = true)
    );
  END IF;
END $$;
