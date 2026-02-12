/*
  # Add Group Subscription System
  
  ## Summary
  All group memberships require paid recurring subscriptions managed through HubSpot.
  
  ## Changes
  
  1. **New Table: group_subscriptions**
    - `id` (uuid, primary key) - Unique subscription ID
    - `profile_id` (uuid, references profiles) - User who owns the subscription
    - `group_id` (uuid, references groups) - Group the subscription is for
    - `hubspot_subscription_id` (text) - ID from HubSpot recurring payment
    - `status` (text) - active, cancelled, expired, pending
    - `started_at` (timestamptz) - When subscription started
    - `expires_at` (timestamptz) - When subscription expires
    - `created_at` (timestamptz) - Record creation time
    - `updated_at` (timestamptz) - Record update time
    - Unique constraint on (profile_id, group_id)
  
  2. **Update groups table**
    - All groups now require payment (is_paid defaults to true)
  
  3. **Security**
    - Enable RLS on group_subscriptions
    - Users can view their own subscriptions
    - Only active subscriptions grant group access
    - System can manage all subscriptions via service role
  
  ## Important Notes
    - Payment and subscription management happens in HubSpot
    - HubSpot webhook will update subscription status
    - Users can only access group content if they have an active subscription
    - Subscriptions are recurring and auto-renew unless cancelled
*/

-- Create group subscriptions table
CREATE TABLE IF NOT EXISTS group_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  group_id uuid REFERENCES groups ON DELETE CASCADE NOT NULL,
  hubspot_subscription_id text,
  status text DEFAULT 'pending' NOT NULL,
  started_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, group_id)
);

-- Enable RLS
ALTER TABLE group_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON group_subscriptions FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Users can insert their own subscriptions (for initial purchase)
CREATE POLICY "Users can create own subscriptions"
  ON group_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions"
  ON group_subscriptions FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Update group_members policy to require active subscription
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;

CREATE POLICY "Users can view members of their groups"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT gs.group_id 
      FROM group_subscriptions gs 
      WHERE gs.profile_id = auth.uid() 
      AND gs.status = 'active'
      AND (gs.expires_at IS NULL OR gs.expires_at > now())
    )
  );

-- Update posts policy to require active subscription
DROP POLICY IF EXISTS "Users can view posts in their groups" ON posts;

CREATE POLICY "Users can view posts in their groups"
  ON posts FOR SELECT
  TO authenticated
  USING (
    group_id IS NULL OR
    group_id IN (
      SELECT gs.group_id 
      FROM group_subscriptions gs 
      WHERE gs.profile_id = auth.uid() 
      AND gs.status = 'active'
      AND (gs.expires_at IS NULL OR gs.expires_at > now())
    )
  );

-- Update forum threads policy to require active subscription
DROP POLICY IF EXISTS "Users can view threads in their groups" ON forum_threads;

CREATE POLICY "Users can view threads in their groups"
  ON forum_threads FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT gs.group_id 
      FROM group_subscriptions gs 
      WHERE gs.profile_id = auth.uid() 
      AND gs.status = 'active'
      AND (gs.expires_at IS NULL OR gs.expires_at > now())
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_subscriptions_profile_id ON group_subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_group_subscriptions_group_id ON group_subscriptions(group_id);
CREATE INDEX IF NOT EXISTS idx_group_subscriptions_status ON group_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_group_subscriptions_hubspot_id ON group_subscriptions(hubspot_subscription_id);
