/*
  # Add HubSpot Ticket Integration to Feedback System

  ## Changes
  1. Add HubSpot ticket tracking fields to feedback_tickets table:
    - `hubspot_ticket_id` (text) - The HubSpot ticket ID
    - `hubspot_ticket_url` (text) - Direct link to the ticket in HubSpot
    - `ticket_status_updated_at` (timestamptz) - When the status was last updated from HubSpot
  
  2. Security
    - All fields are nullable to support existing feedback entries
    - Users can view their own ticket status through existing RLS policies
*/

-- Add HubSpot ticket fields to feedback_tickets table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback_tickets' AND column_name = 'hubspot_ticket_id'
  ) THEN
    ALTER TABLE feedback_tickets ADD COLUMN hubspot_ticket_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback_tickets' AND column_name = 'hubspot_ticket_url'
  ) THEN
    ALTER TABLE feedback_tickets ADD COLUMN hubspot_ticket_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback_tickets' AND column_name = 'ticket_status_updated_at'
  ) THEN
    ALTER TABLE feedback_tickets ADD COLUMN ticket_status_updated_at timestamptz;
  END IF;
END $$;

-- Create index for faster ticket lookups
CREATE INDEX IF NOT EXISTS idx_feedback_tickets_hubspot_ticket_id ON feedback_tickets(hubspot_ticket_id);