/*
  # Add Membership Tier Feature Access Control

  ## Overview
  This migration implements granular feature access control for the four membership tiers:
  - Country Membership Basic ($21/year)
  - Country Membership Plus ($43/year)
  - Worldwide Membership Basic ($32/year)
  - Worldwide Membership Plus ($49/year)
*/

-- Create membership_features table
CREATE TABLE IF NOT EXISTS membership_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text UNIQUE NOT NULL,
  feature_name text NOT NULL,
  description text,
  category text NOT NULL,
  is_planned boolean DEFAULT false,
  planned_release text,
  created_at timestamptz DEFAULT now()
);

-- Create package_features table
CREATE TABLE IF NOT EXISTS package_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_type text NOT NULL CHECK (package_type IN ('country_basic', 'country_plus', 'worldwide_basic', 'worldwide_plus')),
  feature_key text REFERENCES membership_features(feature_key) ON DELETE CASCADE NOT NULL,
  is_enabled boolean DEFAULT true,
  UNIQUE(package_type, feature_key)
);

-- Enable RLS
ALTER TABLE membership_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view features"
  ON membership_features FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify features"
  ON membership_features FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
  );

CREATE POLICY "Anyone can view package features"
  ON package_features FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify package features"
  ON package_features FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
  );

-- Insert ALL features first
INSERT INTO membership_features (feature_key, feature_name, description, category, is_planned, planned_release) VALUES
-- Social
('view_country_group_members', 'View Country Group Members', 'View members in your country adoption group', 'social', false, null),
('view_worldwide_group_members', 'View Worldwide Group Members', 'View members in worldwide adoption groups', 'social', false, null),
('request_friendships_country', 'Request Friendships in Country', 'Send friendship requests to country group members', 'social', false, null),
('request_friendships_worldwide', 'Request Friendships Worldwide', 'Send friendship requests to worldwide members', 'social', false, null),
('full_social_access', 'Full Social Media Access', 'Access to all social features across the platform', 'social', false, null),

-- Privacy
('basic_privacy_controls', 'Basic Privacy Controls', 'Show or hide your profile information', 'privacy', false, null),
('personalized_privacy_controls', 'Personalized Privacy Controls', 'Fine-grained control over information visibility', 'privacy', false, null),

-- Content
('create_family_stories', 'Create Family Stories', 'Share your adoption story', 'content', false, null),
('create_family_stories_bilingual', 'Create Bilingual Family Stories', 'Write stories in local language and English', 'content', false, null),
('view_family_stories_in_group', 'View Family Stories in Group', 'Read stories from your group members', 'content', false, null),
('view_family_stories_worldwide', 'View Worldwide Family Stories', 'Read stories from worldwide members', 'content', false, null),
('view_family_stories_full_social', 'View All Family Stories', 'Access all family stories on the platform', 'content', false, null),

-- Feed
('read_feed_country_group', 'Read Country Group Feed', 'View posts in your country group', 'feed', false, null),
('write_feed_country_group', 'Write in Country Group Feed', 'Post to your country group feed', 'feed', false, null),
('read_feed_worldwide', 'Read Worldwide Feed', 'View posts in worldwide groups', 'feed', false, null),
('write_feed_worldwide', 'Write in Worldwide Feed', 'Post to worldwide group feeds', 'feed', false, null),
('write_feed_full_social', 'Write to Full Social Feed', 'Post anywhere on the platform', 'feed', false, null),

-- Forum
('participate_forum_country', 'Participate in Country Forums', 'Write and reply in country group forums', 'forum', false, null),
('participate_forum_worldwide', 'Participate in Worldwide Forums', 'Write and reply in worldwide forums', 'forum', false, null),
('create_forums_full_social', 'Create Forums in Full Social', 'Create and manage forum discussions everywhere', 'forum', false, null),
('create_forums_worldwide', 'Create Worldwide Forums', 'Create forums in worldwide groups', 'forum', false, null),

-- Events
('view_events_country', 'View Country Events', 'See events in your country group', 'events', false, null),
('create_events_country', 'Create Country Events', 'Organize events for your country group', 'events', false, null),
('view_events_worldwide', 'View Worldwide Events', 'See events in worldwide groups', 'events', false, null),
('create_events_worldwide', 'Create Worldwide Events', 'Organize worldwide events', 'events', false, null),
('attend_country_webinars', 'Attend Country Webinars', 'Join country-specific webinars', 'events', false, null),
('attend_worldwide_webinars', 'Attend Worldwide Webinars', 'Join worldwide webinars', 'events', false, null),

-- Advanced (Planned)
('make_local_city_group', 'Make Local City Group', 'Create city-level groups', 'advanced', true, 'Summer 2025'),
('mobile_app_access', 'Mobile App Access', 'Access iOS and Android apps', 'advanced', true, 'Summer/Fall 2025'),
('birthmother_search_write', 'Write Birthmother Search Data', 'Enter birthmother search information', 'search', true, 'Fall 2025'),
('birthmother_search_match_notify', 'Birthmother Match Notifications', 'Get notified of matches', 'search', true, 'Fall 2025'),
('cooperation_agencies_request', 'Request Agency Cooperation', 'Request info from agencies', 'agencies', true, 'Fall 2025')
ON CONFLICT (feature_key) DO NOTHING;

-- Country Basic features
INSERT INTO package_features (package_type, feature_key) VALUES
('country_basic', 'view_country_group_members'),
('country_basic', 'basic_privacy_controls'),
('country_basic', 'create_family_stories'),
('country_basic', 'view_family_stories_in_group'),
('country_basic', 'read_feed_country_group'),
('country_basic', 'write_feed_country_group'),
('country_basic', 'participate_forum_country'),
('country_basic', 'request_friendships_country'),
('country_basic', 'view_events_country'),
('country_basic', 'mobile_app_access'),
('country_basic', 'birthmother_search_write'),
('country_basic', 'cooperation_agencies_request')
ON CONFLICT DO NOTHING;

-- Country Plus features (all Basic + extras)
INSERT INTO package_features (package_type, feature_key)
SELECT 'country_plus', feature_key FROM package_features WHERE package_type = 'country_basic'
ON CONFLICT DO NOTHING;

INSERT INTO package_features (package_type, feature_key) VALUES
('country_plus', 'personalized_privacy_controls'),
('country_plus', 'view_family_stories_full_social'),
('country_plus', 'write_feed_full_social'),
('country_plus', 'create_forums_full_social'),
('country_plus', 'create_events_country'),
('country_plus', 'make_local_city_group'),
('country_plus', 'full_social_access'),
('country_plus', 'attend_country_webinars'),
('country_plus', 'birthmother_search_match_notify')
ON CONFLICT DO NOTHING;

-- Worldwide Basic features (all Country Basic + worldwide extras)
INSERT INTO package_features (package_type, feature_key)
SELECT 'worldwide_basic', feature_key FROM package_features WHERE package_type = 'country_basic'
ON CONFLICT DO NOTHING;

INSERT INTO package_features (package_type, feature_key) VALUES
('worldwide_basic', 'view_worldwide_group_members'),
('worldwide_basic', 'view_family_stories_worldwide'),
('worldwide_basic', 'read_feed_worldwide'),
('worldwide_basic', 'write_feed_worldwide'),
('worldwide_basic', 'participate_forum_worldwide'),
('worldwide_basic', 'request_friendships_worldwide'),
('worldwide_basic', 'view_events_worldwide')
ON CONFLICT DO NOTHING;

-- Worldwide Plus features (all Country Plus + all Worldwide Basic)
INSERT INTO package_features (package_type, feature_key)
SELECT 'worldwide_plus', feature_key FROM package_features WHERE package_type = 'country_plus'
ON CONFLICT DO NOTHING;

INSERT INTO package_features (package_type, feature_key)
SELECT 'worldwide_plus', feature_key FROM package_features WHERE package_type = 'worldwide_basic'
ON CONFLICT DO NOTHING;

INSERT INTO package_features (package_type, feature_key) VALUES
('worldwide_plus', 'create_family_stories_bilingual'),
('worldwide_plus', 'create_forums_worldwide'),
('worldwide_plus', 'create_events_worldwide'),
('worldwide_plus', 'attend_worldwide_webinars')
ON CONFLICT DO NOTHING;

-- Helper function to check if user has a specific feature
CREATE OR REPLACE FUNCTION user_has_feature(user_id uuid, feature text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_product_access upa
    JOIN package_features pf ON pf.package_type = upa.package_type
    WHERE upa.profile_id = user_id
    AND upa.is_active = true
    AND (upa.expires_at IS NULL OR upa.expires_at > now())
    AND pf.feature_key = feature
    AND pf.is_enabled = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's highest package type for a country
CREATE OR REPLACE FUNCTION get_user_package_type(user_id uuid, country text)
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT package_type
    FROM user_product_access
    WHERE profile_id = user_id
    AND adoption_country = country
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    ORDER BY 
      CASE package_type
        WHEN 'worldwide_plus' THEN 4
        WHEN 'worldwide_basic' THEN 3
        WHEN 'country_plus' THEN 2
        WHEN 'country_basic' THEN 1
      END DESC
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_membership_features_category ON membership_features(category);
CREATE INDEX IF NOT EXISTS idx_membership_features_planned ON membership_features(is_planned);
CREATE INDEX IF NOT EXISTS idx_package_features_package_type ON package_features(package_type);
CREATE INDEX IF NOT EXISTS idx_package_features_feature_key ON package_features(feature_key);
