/*
  # Indsæt Medlemskabsfunktioner og Pakkefordele

  ## Beskrivelse
  Denne migration indsætter alle features fra pricing pakker og kobler dem til de 4 pakketyper:
  - Country Membership Basic
  - Country Membership Plus
  - World Wide Membership Basic
  - World Wide Membership Plus

  ## Baseret på pricingData.js
  Features er grupperet i kategorier og hver pakke får korrekt adgang baseret på produktbeskrivelsen.

  ## Features
  1. Gruppeadgang features
  2. Profil og privatlivs features
  3. Sociale features (posts, forum, stories)
  4. Begivenhedsfunktioner
  5. Avancerede features (webinarer, mobilapp, osv.)
*/

-- Insert all membership features
INSERT INTO membership_features (feature_key, feature_name, description, category, is_planned, planned_release) VALUES
  -- Gruppeadgang
  ('access_country_group', 'Adgang til Country Group Membership', 'Adgang til dit landespecifikke gruppe', 'Gruppeadgang', false, NULL),
  ('access_worldwide_group', 'Adgang til World Wide Group Membership', 'Adgang til verdensomspændende grupper', 'Gruppeadgang', false, NULL),
  ('view_members_country', 'Se gruppemedlemmer i landet', 'Se profiler af medlemmer i din landegruppe', 'Gruppeadgang', false, NULL),
  ('view_members_worldwide', 'Se gruppemedlemmer platformsbredde', 'Se profiler af alle medlemmer på platformen', 'Gruppeadgang', false, NULL),
  
  -- Profil og privatliv
  ('privacy_basic', 'Privatlivsindstillinger - Basis', 'Visning/skjul af profil', 'Profil og privatliv', false, NULL),
  ('privacy_full', 'Privatlivsindstillinger - Fuld kontrol', 'Fuld kontrol over alle privatlivsindstillinger', 'Profil og privatliv', false, NULL),
  
  -- Sociale funktioner
  ('family_stories_create', 'Opret familiehistorier', 'Opret og del familiehistorier', 'Sociale funktioner', false, NULL),
  ('family_stories_view_group', 'Se familiehistorier i gruppe', 'Se familiehistorier i din gruppe', 'Sociale funktioner', false, NULL),
  ('family_stories_view_all', 'Se familiehistorier på hele platformen', 'Se alle familiehistorier', 'Sociale funktioner', false, NULL),
  ('family_stories_multilang', 'Opret familiehistorier på to sprog', 'Opret historier på både lokalt og engelsk', 'Sociale funktioner', false, NULL),
  
  ('feed_country', 'Feed og diskussioner i Country Group', 'Deltag i feed og diskussioner i din landegruppe', 'Sociale funktioner', false, NULL),
  ('feed_worldwide', 'Feed og diskussioner overalt', 'Deltag i alle feeds og diskussioner', 'Sociale funktioner', false, NULL),
  
  ('forum_view', 'Se og deltag i forum', 'Læs og svar på forum indlæg', 'Sociale funktioner', false, NULL),
  ('forum_create', 'Opret forumindlæg overalt', 'Opret nye forum tråde', 'Sociale funktioner', false, NULL),
  
  ('friend_requests_country', 'Venskabsanmodninger i Country Groups', 'Send venskabsanmodninger til medlemmer i din landegruppe', 'Sociale funktioner', false, NULL),
  ('friend_requests_worldwide', 'Venskabsanmodninger overalt', 'Send venskabsanmodninger til alle medlemmer', 'Sociale funktioner', false, NULL),
  
  -- Begivenheder
  ('events_view', 'Se og deltag i begivenheder', 'Tilmeld dig begivenheder', 'Begivenheder', false, NULL),
  ('events_create_country', 'Opret begivenheder i Country Group', 'Opret begivenheder for din landegruppe', 'Begivenheder', false, NULL),
  ('events_create_worldwide', 'Opret begivenheder overalt', 'Opret begivenheder for alle grupper', 'Begivenheder', false, NULL),
  
  -- Avancerede funktioner
  ('local_city_group', 'Lokal bygruppe', 'Opret eller deltag i lokale bygrupper', 'Avancerede funktioner', true, 'Sommer 2025'),
  ('mobile_app', 'Mobilapp', 'Adgang til mobilapp', 'Avancerede funktioner', true, 'Forår 2025'),
  ('bio_mother_search_basic', 'Søg biologisk mor - Basisfunktioner', 'Basisfunktioner til søgning', 'Avancerede funktioner', true, 'Efterår 2025'),
  ('bio_mother_search_full', 'Søg biologisk mor - Fuld adgang', 'Fuld adgang med match-notifikationer', 'Avancerede funktioner', true, 'Efterår 2025'),
  ('webinars_country', 'Webinarer - Landespecifikke', 'Deltag i landespecifikke webinarer', 'Avancerede funktioner', false, NULL),
  ('webinars_worldwide', 'Webinarer - World Wide og hele platformen', 'Deltag i alle webinarer', 'Avancerede funktioner', false, NULL),
  ('partner_org_request', 'Organisationsmedlemskab - Anmod om adgang', 'Anmod om adgang til partnerorganisationer', 'Avancerede funktioner', false, NULL),
  ('partner_org_full', 'Organisationsmedlemskab - Fuld adgang', 'Fuld adgang til alle partnerorganisationer', 'Avancerede funktioner', false, NULL)
ON CONFLICT (feature_key) DO NOTHING;

-- Assign features to Country Basic package
INSERT INTO package_features (package_type, feature_key, is_enabled) VALUES
  ('country_basic', 'access_country_group', true),
  ('country_basic', 'view_members_country', true),
  ('country_basic', 'privacy_basic', true),
  ('country_basic', 'family_stories_create', true),
  ('country_basic', 'family_stories_view_group', true),
  ('country_basic', 'feed_country', true),
  ('country_basic', 'forum_view', true),
  ('country_basic', 'friend_requests_country', true),
  ('country_basic', 'events_view', true),
  ('country_basic', 'mobile_app', true),
  ('country_basic', 'bio_mother_search_basic', true),
  ('country_basic', 'partner_org_request', true)
ON CONFLICT DO NOTHING;

-- Assign features to Country Plus package
INSERT INTO package_features (package_type, feature_key, is_enabled) VALUES
  ('country_plus', 'access_country_group', true),
  ('country_plus', 'view_members_country', true),
  ('country_plus', 'view_members_worldwide', true),
  ('country_plus', 'privacy_full', true),
  ('country_plus', 'family_stories_create', true),
  ('country_plus', 'family_stories_view_group', true),
  ('country_plus', 'family_stories_view_all', true),
  ('country_plus', 'feed_country', true),
  ('country_plus', 'feed_worldwide', true),
  ('country_plus', 'forum_view', true),
  ('country_plus', 'forum_create', true),
  ('country_plus', 'friend_requests_worldwide', true),
  ('country_plus', 'events_view', true),
  ('country_plus', 'events_create_country', true),
  ('country_plus', 'events_create_worldwide', true),
  ('country_plus', 'local_city_group', true),
  ('country_plus', 'mobile_app', true),
  ('country_plus', 'bio_mother_search_full', true),
  ('country_plus', 'webinars_country', true),
  ('country_plus', 'partner_org_full', true)
ON CONFLICT DO NOTHING;

-- Assign features to Worldwide Basic package
INSERT INTO package_features (package_type, feature_key, is_enabled) VALUES
  ('worldwide_basic', 'access_country_group', true),
  ('worldwide_basic', 'access_worldwide_group', true),
  ('worldwide_basic', 'view_members_country', true),
  ('worldwide_basic', 'view_members_worldwide', true),
  ('worldwide_basic', 'privacy_basic', true),
  ('worldwide_basic', 'family_stories_create', true),
  ('worldwide_basic', 'family_stories_view_group', true),
  ('worldwide_basic', 'feed_country', true),
  ('worldwide_basic', 'feed_worldwide', true),
  ('worldwide_basic', 'forum_view', true),
  ('worldwide_basic', 'friend_requests_country', true),
  ('worldwide_basic', 'friend_requests_worldwide', true),
  ('worldwide_basic', 'events_view', true),
  ('worldwide_basic', 'mobile_app', true),
  ('worldwide_basic', 'bio_mother_search_basic', true),
  ('worldwide_basic', 'partner_org_request', true)
ON CONFLICT DO NOTHING;

-- Assign features to Worldwide Plus package (full access)
INSERT INTO package_features (package_type, feature_key, is_enabled) VALUES
  ('worldwide_plus', 'access_country_group', true),
  ('worldwide_plus', 'access_worldwide_group', true),
  ('worldwide_plus', 'view_members_country', true),
  ('worldwide_plus', 'view_members_worldwide', true),
  ('worldwide_plus', 'privacy_full', true),
  ('worldwide_plus', 'family_stories_create', true),
  ('worldwide_plus', 'family_stories_view_group', true),
  ('worldwide_plus', 'family_stories_view_all', true),
  ('worldwide_plus', 'family_stories_multilang', true),
  ('worldwide_plus', 'feed_country', true),
  ('worldwide_plus', 'feed_worldwide', true),
  ('worldwide_plus', 'forum_view', true),
  ('worldwide_plus', 'forum_create', true),
  ('worldwide_plus', 'friend_requests_country', true),
  ('worldwide_plus', 'friend_requests_worldwide', true),
  ('worldwide_plus', 'events_view', true),
  ('worldwide_plus', 'events_create_country', true),
  ('worldwide_plus', 'events_create_worldwide', true),
  ('worldwide_plus', 'local_city_group', true),
  ('worldwide_plus', 'mobile_app', true),
  ('worldwide_plus', 'bio_mother_search_full', true),
  ('worldwide_plus', 'webinars_country', true),
  ('worldwide_plus', 'webinars_worldwide', true),
  ('worldwide_plus', 'partner_org_full', true)
ON CONFLICT DO NOTHING;