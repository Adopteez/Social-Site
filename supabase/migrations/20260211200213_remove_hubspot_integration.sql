/*
  # Remove HubSpot Integration

  1. Changes
    - Remove HubSpot-related columns from feedback_tickets table:
      - hubspot_ticket_id
      - hubspot_ticket_url
      - ticket_status_updated_at
    - Drop index on hubspot_ticket_id

  2. Notes
    - This migration safely removes all HubSpot integration from the database
    - Existing feedback tickets will remain intact, only the HubSpot-specific fields are removed
*/

DROP INDEX IF EXISTS idx_feedback_tickets_hubspot_ticket_id;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback_tickets' AND column_name = 'hubspot_ticket_id'
  ) THEN
    ALTER TABLE feedback_tickets DROP COLUMN hubspot_ticket_id;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback_tickets' AND column_name = 'hubspot_ticket_url'
  ) THEN
    ALTER TABLE feedback_tickets DROP COLUMN hubspot_ticket_url;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback_tickets' AND column_name = 'ticket_status_updated_at'
  ) THEN
    ALTER TABLE feedback_tickets DROP COLUMN ticket_status_updated_at;
  END IF;
END $$;
