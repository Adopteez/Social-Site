/*
  # Create Feedback System

  1. New Tables
    - `feedback_tickets`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `type` (text) - 'bug' or 'feature'
      - `title` (text)
      - `description` (text)
      - `status` (text) - 'open', 'in_progress', 'resolved', 'closed'
      - `priority` (text) - 'low', 'medium', 'high'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `resolved_at` (timestamptz, nullable)
      - `admin_notes` (text, nullable)

  2. Security
    - Enable RLS on `feedback_tickets` table
    - Users can create their own tickets
    - Users can view their own tickets
    - Super admins can view and update all tickets
*/

CREATE TABLE IF NOT EXISTS feedback_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('bug', 'feature')),
  title text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  admin_notes text
);

ALTER TABLE feedback_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own feedback tickets"
  ON feedback_tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can view own feedback tickets"
  ON feedback_tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

CREATE POLICY "Super admins can view all feedback tickets"
  ON feedback_tickets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can update all feedback tickets"
  ON feedback_tickets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_feedback_tickets_profile ON feedback_tickets(profile_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tickets_status ON feedback_tickets(status);
CREATE INDEX IF NOT EXISTS idx_feedback_tickets_created ON feedback_tickets(created_at DESC);
