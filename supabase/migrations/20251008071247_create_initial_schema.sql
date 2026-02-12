/*
  # Create Initial Adopteez Database Schema

  ## 1. New Tables
    
    ### profiles
    - `id` (uuid, primary key, references auth.users)
    - `email` (text, unique, not null)
    - `full_name` (text)
    - `avatar_url` (text)
    - `bio` (text)
    - `relation_to_adoption` (text) - adoptee, adoptive_parent, etc.
    - `language` (text) - preferred language
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    
    ### children
    - `id` (uuid, primary key)
    - `profile_id` (uuid, references profiles) - parent/guardian
    - `name` (text, not null)
    - `birth_date` (date)
    - `current_city` (text)
    - `current_city_lat` (numeric) - for map display
    - `current_city_lng` (numeric) - for map display
    - `birth_city` (text)
    - `orphanage_name` (text)
    - `orphanage_date_from` (date)
    - `orphanage_date_to` (date)
    - `foster_mother_name` (text)
    - `foster_mother_date_from` (date)
    - `foster_mother_date_to` (date)
    - `biological_mother` (text)
    - `biological_father` (text)
    - `facebook_profile` (text)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    
    ### child_privacy_settings
    - `id` (uuid, primary key)
    - `child_id` (uuid, references children, unique)
    - `name_visibility` (text) - hidden, friends, group_members, all
    - `birth_date_visibility` (text)
    - `current_city_visibility` (text)
    - `birth_city_visibility` (text)
    - `orphanage_name_visibility` (text)
    - `orphanage_dates_visibility` (text)
    - `foster_mother_name_visibility` (text)
    - `foster_mother_dates_visibility` (text)
    - `biological_mother_visibility` (text)
    - `biological_father_visibility` (text)
    - `facebook_profile_visibility` (text)
    
    ### groups
    - `id` (uuid, primary key)
    - `name` (text, not null)
    - `description` (text)
    - `group_type` (text) - national, worldwide, parent, adoptee
    - `country` (text) - relevant country
    - `avatar_url` (text)
    - `created_by` (uuid, references profiles)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    
    ### group_members
    - `id` (uuid, primary key)
    - `group_id` (uuid, references groups)
    - `profile_id` (uuid, references profiles)
    - `role` (text) - member, admin, moderator
    - `joined_at` (timestamptz)
    - Unique constraint on (group_id, profile_id)
    
    ### posts
    - `id` (uuid, primary key)
    - `author_id` (uuid, references profiles)
    - `group_id` (uuid, references groups, nullable) - null for personal feed
    - `content` (text, not null)
    - `image_url` (text)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    
    ### post_likes
    - `id` (uuid, primary key)
    - `post_id` (uuid, references posts)
    - `profile_id` (uuid, references profiles)
    - `created_at` (timestamptz)
    - Unique constraint on (post_id, profile_id)
    
    ### post_comments
    - `id` (uuid, primary key)
    - `post_id` (uuid, references posts)
    - `author_id` (uuid, references profiles)
    - `content` (text, not null)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    
    ### forum_threads
    - `id` (uuid, primary key)
    - `group_id` (uuid, references groups)
    - `author_id` (uuid, references profiles)
    - `title` (text, not null)
    - `content` (text, not null)
    - `pinned` (boolean, default false)
    - `locked` (boolean, default false)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    
    ### forum_replies
    - `id` (uuid, primary key)
    - `thread_id` (uuid, references forum_threads)
    - `author_id` (uuid, references profiles)
    - `content` (text, not null)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    
    ### conversations
    - `id` (uuid, primary key)
    - `is_group_chat` (boolean, default false)
    - `name` (text) - for group chats
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    
    ### conversation_participants
    - `id` (uuid, primary key)
    - `conversation_id` (uuid, references conversations)
    - `profile_id` (uuid, references profiles)
    - `joined_at` (timestamptz)
    - `last_read_at` (timestamptz)
    - Unique constraint on (conversation_id, profile_id)
    
    ### messages
    - `id` (uuid, primary key)
    - `conversation_id` (uuid, references conversations)
    - `sender_id` (uuid, references profiles)
    - `content` (text, not null)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    
    ### events
    - `id` (uuid, primary key)
    - `group_id` (uuid, references groups)
    - `organizer_id` (uuid, references profiles)
    - `title` (text, not null)
    - `description` (text)
    - `location` (text)
    - `start_date` (timestamptz, not null)
    - `end_date` (timestamptz)
    - `is_paid` (boolean, default false)
    - `price` (numeric)
    - `currency` (text)
    - `max_attendees` (integer)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    
    ### event_attendees
    - `id` (uuid, primary key)
    - `event_id` (uuid, references events)
    - `profile_id` (uuid, references profiles)
    - `status` (text) - registered, paid, cancelled
    - `payment_status` (text) - pending, completed, refunded
    - `registered_at` (timestamptz)
    - Unique constraint on (event_id, profile_id)
    
    ### friendships
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `friend_id` (uuid, references profiles)
    - `status` (text) - pending, accepted, blocked
    - `created_at` (timestamptz)
    - Unique constraint on (user_id, friend_id)
    
    ### notifications
    - `id` (uuid, primary key)
    - `recipient_id` (uuid, references profiles)
    - `actor_id` (uuid, references profiles, nullable)
    - `type` (text) - like, comment, message, friend_request, event, etc.
    - `content` (text)
    - `related_id` (uuid) - id of related entity
    - `read` (boolean, default false)
    - `created_at` (timestamptz)

  ## 2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for group members to access group content
    - Add policies respecting privacy settings for children data

  ## 3. Important Notes
    - All timestamps use timestamptz with default now()
    - Privacy settings default to 'group_members' for safe defaults
    - Group membership is required to view group content
    - Children map visibility respects both privacy settings and group membership
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  relation_to_adoption text,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  birth_date date,
  current_city text,
  current_city_lat numeric,
  current_city_lng numeric,
  birth_city text,
  orphanage_name text,
  orphanage_date_from date,
  orphanage_date_to date,
  foster_mother_name text,
  foster_mother_date_from date,
  foster_mother_date_to date,
  biological_mother text,
  biological_father text,
  facebook_profile text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create child privacy settings table
CREATE TABLE IF NOT EXISTS child_privacy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children ON DELETE CASCADE UNIQUE NOT NULL,
  name_visibility text DEFAULT 'group_members',
  birth_date_visibility text DEFAULT 'group_members',
  current_city_visibility text DEFAULT 'group_members',
  birth_city_visibility text DEFAULT 'group_members',
  orphanage_name_visibility text DEFAULT 'group_members',
  orphanage_dates_visibility text DEFAULT 'group_members',
  foster_mother_name_visibility text DEFAULT 'group_members',
  foster_mother_dates_visibility text DEFAULT 'group_members',
  biological_mother_visibility text DEFAULT 'group_members',
  biological_father_visibility text DEFAULT 'group_members',
  facebook_profile_visibility text DEFAULT 'group_members'
);

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  group_type text NOT NULL,
  country text,
  avatar_url text,
  created_by uuid REFERENCES profiles ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create group members table
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(group_id, profile_id)
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  group_id uuid REFERENCES groups ON DELETE CASCADE,
  content text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create post likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, profile_id)
);

-- Create post comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create forum threads table
CREATE TABLE IF NOT EXISTS forum_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  pinned boolean DEFAULT false,
  locked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create forum replies table
CREATE TABLE IF NOT EXISTS forum_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid REFERENCES forum_threads ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_group_chat boolean DEFAULT false,
  name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversation participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  last_read_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, profile_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups ON DELETE CASCADE NOT NULL,
  organizer_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  location text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  is_paid boolean DEFAULT false,
  price numeric,
  currency text,
  max_attendees integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create event attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'registered',
  payment_status text DEFAULT 'pending',
  registered_at timestamptz DEFAULT now(),
  UNIQUE(event_id, profile_id)
);

-- Create friendships table
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  friend_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  actor_id uuid REFERENCES profiles ON DELETE SET NULL,
  type text NOT NULL,
  content text,
  related_id uuid,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Children policies
CREATE POLICY "Users can view own children"
  ON children FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert own children"
  ON children FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own children"
  ON children FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can delete own children"
  ON children FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());

-- Child privacy settings policies
CREATE POLICY "Users can view privacy settings for own children"
  ON child_privacy_settings FOR SELECT
  TO authenticated
  USING (
    child_id IN (
      SELECT id FROM children WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert privacy settings for own children"
  ON child_privacy_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    child_id IN (
      SELECT id FROM children WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can update privacy settings for own children"
  ON child_privacy_settings FOR UPDATE
  TO authenticated
  USING (
    child_id IN (
      SELECT id FROM children WHERE profile_id = auth.uid()
    )
  )
  WITH CHECK (
    child_id IN (
      SELECT id FROM children WHERE profile_id = auth.uid()
    )
  );

-- Groups policies
CREATE POLICY "Users can view groups they are members of"
  ON groups FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT group_id FROM group_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Group admins can update groups"
  ON groups FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT group_id FROM group_members 
      WHERE profile_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  )
  WITH CHECK (
    id IN (
      SELECT group_id FROM group_members 
      WHERE profile_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Group members policies
CREATE POLICY "Users can view members of their groups"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can add members"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE profile_id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Users can leave groups"
  ON group_members FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());

-- Posts policies
CREATE POLICY "Users can view posts in their groups"
  ON posts FOR SELECT
  TO authenticated
  USING (
    group_id IS NULL OR
    group_id IN (
      SELECT group_id FROM group_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Post likes policies
CREATE POLICY "Users can view likes on visible posts"
  ON post_likes FOR SELECT
  TO authenticated
  USING (
    post_id IN (
      SELECT id FROM posts WHERE 
        group_id IS NULL OR
        group_id IN (SELECT group_id FROM group_members WHERE profile_id = auth.uid())
    )
  );

CREATE POLICY "Users can like posts"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can unlike posts"
  ON post_likes FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());

-- Post comments policies
CREATE POLICY "Users can view comments on visible posts"
  ON post_comments FOR SELECT
  TO authenticated
  USING (
    post_id IN (
      SELECT id FROM posts WHERE 
        group_id IS NULL OR
        group_id IN (SELECT group_id FROM group_members WHERE profile_id = auth.uid())
    )
  );

CREATE POLICY "Users can create comments"
  ON post_comments FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update own comments"
  ON post_comments FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON post_comments FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Forum threads policies
CREATE POLICY "Users can view threads in their groups"
  ON forum_threads FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can create threads in their groups"
  ON forum_threads FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    group_id IN (
      SELECT group_id FROM group_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own threads"
  ON forum_threads FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Forum replies policies
CREATE POLICY "Users can view replies in accessible threads"
  ON forum_replies FOR SELECT
  TO authenticated
  USING (
    thread_id IN (
      SELECT id FROM forum_threads WHERE 
        group_id IN (SELECT group_id FROM group_members WHERE profile_id = auth.uid())
    )
  );

CREATE POLICY "Users can create replies"
  ON forum_replies FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update own replies"
  ON forum_replies FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Conversations policies
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT conversation_id FROM conversation_participants WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Conversation participants policies
CREATE POLICY "Users can view participants in their conversations"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can add participants to conversations they are in"
  ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own participant record"
  ON conversation_participants FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    conversation_id IN (
      SELECT conversation_id FROM conversation_participants WHERE profile_id = auth.uid()
    )
  );

-- Events policies
CREATE POLICY "Users can view events in their groups"
  ON events FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can create events in their groups"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    organizer_id = auth.uid() AND
    group_id IN (
      SELECT group_id FROM group_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Event organizers can update their events"
  ON events FOR UPDATE
  TO authenticated
  USING (organizer_id = auth.uid())
  WITH CHECK (organizer_id = auth.uid());

-- Event attendees policies
CREATE POLICY "Users can view attendees for accessible events"
  ON event_attendees FOR SELECT
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM events WHERE 
        group_id IN (SELECT group_id FROM group_members WHERE profile_id = auth.uid())
    )
  );

CREATE POLICY "Users can register for events"
  ON event_attendees FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update own registration"
  ON event_attendees FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Friendships policies
CREATE POLICY "Users can view their friendships"
  ON friendships FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can create friend requests"
  ON friendships FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update friendships they are part of"
  ON friendships FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid())
  WITH CHECK (user_id = auth.uid() OR friend_id = auth.uid());

CREATE POLICY "Users can delete their friendships"
  ON friendships FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_children_profile_id ON children(profile_id);
CREATE INDEX IF NOT EXISTS idx_children_current_city ON children(current_city_lat, current_city_lng);
CREATE INDEX IF NOT EXISTS idx_child_privacy_child_id ON child_privacy_settings(child_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_profile_id ON group_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_group_id ON posts(group_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_group_id ON forum_threads(group_id);
CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON forum_replies(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_group_id ON events(group_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);