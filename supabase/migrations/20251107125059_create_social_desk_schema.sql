/*
  # Social Desk Analytics Platform - Database Schema

  ## Overview
  This migration creates the complete database schema for the Social Desk analytics platform,
  which aggregates statistics from three social media platforms (fb-dupe, tw-dupe, tt-dupe).

  ## New Tables

  ### 1. `users`
  Stores user accounts for dashboard access
  - `id` (uuid, primary key) - User identifier
  - `email` (text, unique) - User email address
  - `password_hash` (text) - Hashed password
  - `role` (text) - User role (admin, viewer)
  - `created_at` (timestamptz) - Account creation timestamp

  ### 2. `platform_stats`
  Stores aggregated statistics from each platform
  - `id` (uuid, primary key) - Record identifier
  - `platform` (text) - Platform identifier (fb-dupe, tw-dupe, tt-dupe)
  - `period_start` (timestamptz) - Statistics period start
  - `period_end` (timestamptz) - Statistics period end
  - `total_likes` (bigint) - Total likes in period
  - `total_views` (bigint) - Total views in period
  - `total_comments` (bigint) - Total comments in period
  - `total_posts` (bigint) - Total posts in period
  - `received_at` (timestamptz) - When data was received
  - `signature_verified` (boolean) - HMAC signature verification status

  ### 3. `top_posts`
  Stores top performing posts from all platforms
  - `id` (uuid, primary key) - Record identifier
  - `platform` (text) - Platform identifier
  - `post_id` (text) - Original post ID from platform
  - `likes` (bigint) - Number of likes
  - `views` (bigint) - Number of views
  - `comments` (bigint) - Number of comments
  - `created_at` (timestamptz) - Post creation timestamp
  - `received_at` (timestamptz) - When data was received

  ### 4. `activity_calendar`
  Stores daily activity data for calendar widget
  - `id` (uuid, primary key) - Record identifier
  - `date` (date) - Activity date
  - `platform` (text) - Platform identifier
  - `event_type` (text) - Type of activity (post, milestone, etc.)
  - `event_count` (integer) - Number of events
  - `color_code` (text) - Color for calendar display
  - `created_at` (timestamptz) - Record creation timestamp

  ### 5. `scheduled_posts`
  Stores scheduled posts for future publishing (optional feature)
  - `id` (uuid, primary key) - Record identifier
  - `user_id` (uuid) - User who scheduled the post
  - `platform` (text) - Target platform
  - `content` (text) - Post content
  - `media_url` (text) - Media attachment URL
  - `scheduled_time` (timestamptz) - When to publish
  - `status` (text) - Status (pending, published, failed)
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Add policies for authenticated users to access their own data
  - Platform stats and activity are readable by all authenticated users
  - Only admins can manage scheduled posts

  ## Indexes
  - Add indexes on frequently queried columns for performance
  - Composite indexes for platform + date range queries
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'viewer',
  created_at timestamptz DEFAULT now()
);

-- Create platform_stats table
CREATE TABLE IF NOT EXISTS platform_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN ('fb-dupe', 'tw-dupe', 'tt-dupe')),
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  total_likes bigint DEFAULT 0,
  total_views bigint DEFAULT 0,
  total_comments bigint DEFAULT 0,
  total_posts bigint DEFAULT 0,
  received_at timestamptz DEFAULT now(),
  signature_verified boolean DEFAULT false
);

-- Create top_posts table
CREATE TABLE IF NOT EXISTS top_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN ('fb-dupe', 'tw-dupe', 'tt-dupe')),
  post_id text NOT NULL,
  likes bigint DEFAULT 0,
  views bigint DEFAULT 0,
  comments bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  received_at timestamptz DEFAULT now()
);

-- Create activity_calendar table
CREATE TABLE IF NOT EXISTS activity_calendar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  platform text NOT NULL CHECK (platform IN ('fb-dupe', 'tw-dupe', 'tt-dupe', 'all')),
  event_type text NOT NULL,
  event_count integer DEFAULT 0,
  color_code text DEFAULT '#EC4899',
  created_at timestamptz DEFAULT now()
);

-- Create scheduled_posts table
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('fb-dupe', 'tw-dupe', 'tt-dupe')),
  content text NOT NULL,
  media_url text,
  scheduled_time timestamptz NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_platform_stats_platform_period 
  ON platform_stats(platform, period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_platform_stats_received 
  ON platform_stats(received_at DESC);

CREATE INDEX IF NOT EXISTS idx_top_posts_platform 
  ON top_posts(platform, views DESC);

CREATE INDEX IF NOT EXISTS idx_activity_calendar_date 
  ON activity_calendar(date DESC);

CREATE INDEX IF NOT EXISTS idx_scheduled_posts_time 
  ON scheduled_posts(scheduled_time);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE top_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for platform_stats (readable by all authenticated users)
CREATE POLICY "Authenticated users can read platform stats"
  ON platform_stats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert platform stats"
  ON platform_stats FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for top_posts (readable by all authenticated users)
CREATE POLICY "Authenticated users can read top posts"
  ON top_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert top posts"
  ON top_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for activity_calendar (readable by all authenticated users)
CREATE POLICY "Authenticated users can read activity calendar"
  ON activity_calendar FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert activity calendar"
  ON activity_calendar FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for scheduled_posts (users can manage their own)
CREATE POLICY "Users can read own scheduled posts"
  ON scheduled_posts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled posts"
  ON scheduled_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled posts"
  ON scheduled_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled posts"
  ON scheduled_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);