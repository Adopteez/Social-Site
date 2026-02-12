/*
  # Add Shared Family Story Ownership

  ## Changes Made
  1. **Update RLS Policies for Shared Editing**
     - Allow tagged partners to update family stories
     - Allow tagged partners to delete family stories (optional)
     - Both creator and tagged partners can manage story members
  
  2. **Add Children Support to Family Story Members**
     - Add reference to children table
     - Allow tagging both profiles (partners) and children
     - Update indexes for performance

  ## Security
  - Only story creators and tagged partners can edit stories
  - Only story creators and tagged partners can manage members
  - Maintain existing view permissions for group members
*/

-- Drop existing policies to recreate them with new logic
DROP POLICY IF EXISTS "Users can update own family stories" ON family_stories;
DROP POLICY IF EXISTS "Users can delete own family stories" ON family_stories;
DROP POLICY IF EXISTS "Story creators can add members" ON family_story_members;
DROP POLICY IF EXISTS "Story creators can remove members" ON family_story_members;

-- Updated policy: Allow both creators and tagged partners to update family stories
CREATE POLICY "Story owners and tagged partners can update family stories"
  ON family_stories FOR UPDATE
  TO authenticated
  USING (
    profile_id = auth.uid() OR
    id IN (
      SELECT family_story_id FROM family_story_members WHERE profile_id = auth.uid()
    )
  )
  WITH CHECK (
    profile_id = auth.uid() OR
    id IN (
      SELECT family_story_id FROM family_story_members WHERE profile_id = auth.uid()
    )
  );

-- Updated policy: Allow both creators and tagged partners to delete family stories
CREATE POLICY "Story owners and tagged partners can delete family stories"
  ON family_stories FOR DELETE
  TO authenticated
  USING (
    profile_id = auth.uid() OR
    id IN (
      SELECT family_story_id FROM family_story_members WHERE profile_id = auth.uid()
    )
  );

-- Updated policy: Allow both creators and tagged partners to add members
CREATE POLICY "Story owners and tagged partners can add members"
  ON family_story_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_stories 
      WHERE family_stories.id = family_story_id 
      AND (
        family_stories.profile_id = auth.uid() OR
        family_story_id IN (
          SELECT family_story_id FROM family_story_members WHERE profile_id = auth.uid()
        )
      )
    )
  );

-- Updated policy: Allow both creators and tagged partners to remove members
CREATE POLICY "Story owners and tagged partners can remove members"
  ON family_story_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM family_stories 
      WHERE family_stories.id = family_story_id 
      AND (
        family_stories.profile_id = auth.uid() OR
        family_story_id IN (
          SELECT family_story_id FROM family_story_members WHERE profile_id = auth.uid()
        )
      )
    )
  );

-- Add child_id column to family_story_members to support tagging children
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'family_story_members' AND column_name = 'child_id'
  ) THEN
    ALTER TABLE family_story_members 
    ADD COLUMN child_id uuid REFERENCES children(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add check constraint: Either profile_id or child_id must be set, but not both
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'family_story_members_member_type_check'
  ) THEN
    ALTER TABLE family_story_members
    ADD CONSTRAINT family_story_members_member_type_check
    CHECK (
      (profile_id IS NOT NULL AND child_id IS NULL) OR
      (profile_id IS NULL AND child_id IS NOT NULL)
    );
  END IF;
END $$;

-- Drop old unique constraint and create new one
ALTER TABLE family_story_members DROP CONSTRAINT IF EXISTS family_story_members_family_story_id_profile_id_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'family_story_members_unique_member'
  ) THEN
    ALTER TABLE family_story_members
    ADD CONSTRAINT family_story_members_unique_member
    UNIQUE NULLS NOT DISTINCT (family_story_id, profile_id, child_id);
  END IF;
END $$;

-- Create index for child_id lookups
CREATE INDEX IF NOT EXISTS idx_family_story_members_child_id ON family_story_members(child_id);
