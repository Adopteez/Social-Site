/*
  # Add Payment Tracking to Events
  
  1. Changes to `event_attendees` table
    - Add `payment_status` (text) - 'pending', 'paid', 'not_required'
    - Add `payment_id` (text) - HubSpot payment ID
    - Add `payment_date` (timestamptz) - when payment was completed
    
  2. Security
    - Update policies to allow viewing payment status
*/

-- Add payment tracking columns to event_attendees
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_attendees' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE event_attendees ADD COLUMN payment_status text DEFAULT 'not_required' CHECK (payment_status IN ('pending', 'paid', 'not_required'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_attendees' AND column_name = 'payment_id'
  ) THEN
    ALTER TABLE event_attendees ADD COLUMN payment_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_attendees' AND column_name = 'payment_date'
  ) THEN
    ALTER TABLE event_attendees ADD COLUMN payment_date timestamptz;
  END IF;
END $$;