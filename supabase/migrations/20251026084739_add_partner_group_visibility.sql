/*
  # Add visibility settings for partner groups

  1. Changes
    - Add `visibility_scope` column to groups table
      - 'local' - Only visible in specific country
      - 'worldwide' - Visible globally
    - Add `visibility_country` column to specify which country for local visibility
    - Default partner groups to 'worldwide'
    - Add index for better query performance

  2. Notes
    - Only relevant for partner groups (group_type = 'partner')
    - Local groups (group_type = 'parents' or 'adopted') are always local by nature
    - Visibility country should match the country where the partner group wants to be visible
*/

-- Add visibility_scope column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'groups' AND column_name = 'visibility_scope'
  ) THEN
    ALTER TABLE groups ADD COLUMN visibility_scope text DEFAULT 'worldwide' CHECK (visibility_scope IN ('local', 'worldwide'));
  END IF;
END $$;

-- Add visibility_country column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'groups' AND column_name = 'visibility_country'
  ) THEN
    ALTER TABLE groups ADD COLUMN visibility_country text;
  END IF;
END $$;

-- Create index for visibility queries
CREATE INDEX IF NOT EXISTS idx_groups_visibility ON groups(visibility_scope, visibility_country);

-- Add comment explaining the visibility system
COMMENT ON COLUMN groups.visibility_scope IS 'Determines if partner group is visible locally or worldwide. Local groups (parents/adopted) ignore this field.';
COMMENT ON COLUMN groups.visibility_country IS 'Specifies country for local visibility when visibility_scope is local';
