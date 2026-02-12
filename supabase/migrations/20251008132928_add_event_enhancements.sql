/*
  # Enhance Events System
  
  1. Changes to `events` table
    - Add `location_searchable` (text) - searchable location field
    - Add `event_type` (text) - 'physical' or 'online'
    - Add `timezone` (text) - timezone for the event
    - Add `deadline_rsvp` (timestamptz) - deadline to commit to event
    - Add `start_time` (time) - event start time
    - Add `end_time` (time) - event end time
    
  2. New Table: `event_attendees`
    - `id` (uuid, primary key)
    - `event_id` (uuid, references events)
    - `profile_id` (uuid, references profiles)
    - `status` (text) - 'yes', 'no', 'maybe'
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    - Unique constraint on (event_id, profile_id)
    
  3. Security
    - Enable RLS on `event_attendees` table
    - Add policies for authenticated users to manage their own attendance
    - Update events policies to allow creation by group members
*/

-- Add new columns to events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'location_searchable'
  ) THEN
    ALTER TABLE events ADD COLUMN location_searchable text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'event_type'
  ) THEN
    ALTER TABLE events ADD COLUMN event_type text DEFAULT 'physical' CHECK (event_type IN ('physical', 'online'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE events ADD COLUMN timezone text DEFAULT 'UTC';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'deadline_rsvp'
  ) THEN
    ALTER TABLE events ADD COLUMN deadline_rsvp timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE events ADD COLUMN start_time time;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'end_time'
  ) THEN
    ALTER TABLE events ADD COLUMN end_time time;
  END IF;
END $$;

-- Create event_attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'maybe' CHECK (status IN ('yes', 'no', 'maybe')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id, profile_id)
);

-- Enable RLS
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Event attendees policies
CREATE POLICY "Users can view event attendees for their groups"
  ON event_attendees FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      INNER JOIN group_subscriptions gs ON e.group_id = gs.group_id
      WHERE e.id = event_attendees.event_id
      AND gs.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can add their own attendance"
  ON event_attendees FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = profile_id
    AND EXISTS (
      SELECT 1 FROM events e
      INNER JOIN group_subscriptions gs ON e.group_id = gs.group_id
      WHERE e.id = event_id
      AND gs.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own attendance"
  ON event_attendees FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own attendance"
  ON event_attendees FOR DELETE
  TO authenticated
  USING (auth.uid() = profile_id);

-- Update events policies to allow creation by group members
DROP POLICY IF EXISTS "Group members can create events" ON events;

CREATE POLICY "Group members can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_subscriptions
      WHERE group_id = events.group_id
      AND profile_id = auth.uid()
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_profile_id ON event_attendees(profile_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_group_id ON events(group_id);