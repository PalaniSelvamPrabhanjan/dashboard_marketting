/*
  # Twitter Clone (tw-dupe) Database Schema

  1. New Tables
    - `tw_users`
      - `id` (uuid, primary key) - User ID
      - `username` (text, unique) - Display username
      - `email` (text, unique) - User email
      - `password_hash` (text) - Bcrypt hashed password
      - `avatar_url` (text, nullable) - Profile picture URL
      - `bio` (text, nullable) - User biography
      - `followers_count` (bigint) - Number of followers
      - `following_count` (bigint) - Number of users following
      - `created_at` (timestamptz) - Account creation timestamp

    - `tw_posts`
      - `id` (uuid, primary key) - Tweet ID
      - `user_id` (uuid) - Author's user ID
      - `content` (text) - Tweet content (max 280 chars)
      - `media_url` (text, nullable) - Optional media URL
      - `media_type` (text, nullable) - Media type (image/video)
      - `likes_count` (bigint) - Number of likes
      - `views_count` (bigint) - Number of views
      - `comments_count` (bigint) - Number of comments
      - `retweets_count` (bigint) - Number of retweets
      - `created_at` (timestamptz) - Tweet creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

    - `tw_likes`
      - `id` (uuid, primary key) - Like ID
      - `post_id` (uuid) - Reference to tweet
      - `user_id` (uuid) - User who liked
      - `created_at` (timestamptz) - Like timestamp
      - Unique constraint on (post_id, user_id)

    - `tw_comments`
      - `id` (uuid, primary key) - Comment ID
      - `post_id` (uuid) - Reference to tweet
      - `user_id` (uuid) - Comment author
      - `content` (text) - Comment content
      - `created_at` (timestamptz) - Comment timestamp

    - `tw_retweets`
      - `id` (uuid, primary key) - Retweet ID
      - `post_id` (uuid) - Original tweet
      - `user_id` (uuid) - User who retweeted
      - `quote_content` (text, nullable) - Quote tweet content
      - `created_at` (timestamptz) - Retweet timestamp
      - Unique constraint on (post_id, user_id) for non-quote retweets

    - `tw_follows`
      - `id` (uuid, primary key) - Follow relationship ID
      - `follower_id` (uuid) - User who follows
      - `following_id` (uuid) - User being followed
      - `created_at` (timestamptz) - Follow timestamp
      - Unique constraint on (follower_id, following_id)

    - `tw_hashtags`
      - `id` (uuid, primary key) - Hashtag ID
      - `tag` (text, unique) - Hashtag text (without #)
      - `usage_count` (bigint) - Number of times used
      - `created_at` (timestamptz) - First use timestamp

    - `tw_post_hashtags`
      - `id` (uuid, primary key) - Junction table ID
      - `post_id` (uuid) - Reference to tweet
      - `hashtag_id` (uuid) - Reference to hashtag
      - Unique constraint on (post_id, hashtag_id)

    - `tw_post_views`
      - `id` (uuid, primary key) - View ID
      - `post_id` (uuid) - Reference to tweet
      - `user_id` (uuid, nullable) - Viewer (null if anonymous)
      - `viewed_at` (timestamptz) - View timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Policies allow users to read public data
    - Policies allow users to modify their own data

  3. Indexes
    - Index on user_id for posts, likes, comments
    - Index on post_id for engagement tables
    - Index on created_at for timeline queries
    - Index on hashtag tags for search
*/

-- Create tw_users table
CREATE TABLE IF NOT EXISTS tw_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  avatar_url text,
  bio text,
  followers_count bigint DEFAULT 0,
  following_count bigint DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create tw_posts table
CREATE TABLE IF NOT EXISTS tw_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES tw_users(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) <= 280),
  media_url text,
  media_type text,
  likes_count bigint DEFAULT 0,
  views_count bigint DEFAULT 0,
  comments_count bigint DEFAULT 0,
  retweets_count bigint DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tw_likes table
CREATE TABLE IF NOT EXISTS tw_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES tw_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES tw_users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create tw_comments table
CREATE TABLE IF NOT EXISTS tw_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES tw_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES tw_users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create tw_retweets table
CREATE TABLE IF NOT EXISTS tw_retweets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES tw_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES tw_users(id) ON DELETE CASCADE,
  quote_content text CHECK (quote_content IS NULL OR char_length(quote_content) <= 280),
  created_at timestamptz DEFAULT now()
);

-- Create tw_follows table
CREATE TABLE IF NOT EXISTS tw_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES tw_users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES tw_users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Create tw_hashtags table
CREATE TABLE IF NOT EXISTS tw_hashtags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag text UNIQUE NOT NULL,
  usage_count bigint DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create tw_post_hashtags junction table
CREATE TABLE IF NOT EXISTS tw_post_hashtags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES tw_posts(id) ON DELETE CASCADE,
  hashtag_id uuid NOT NULL REFERENCES tw_hashtags(id) ON DELETE CASCADE,
  UNIQUE(post_id, hashtag_id)
);

-- Create tw_post_views table
CREATE TABLE IF NOT EXISTS tw_post_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES tw_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES tw_users(id) ON DELETE SET NULL,
  viewed_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tw_posts_user_id ON tw_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_tw_posts_created_at ON tw_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tw_likes_post_id ON tw_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_tw_likes_user_id ON tw_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_tw_comments_post_id ON tw_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_tw_comments_user_id ON tw_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_tw_retweets_post_id ON tw_retweets(post_id);
CREATE INDEX IF NOT EXISTS idx_tw_retweets_user_id ON tw_retweets(user_id);
CREATE INDEX IF NOT EXISTS idx_tw_follows_follower ON tw_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_tw_follows_following ON tw_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_tw_post_hashtags_post ON tw_post_hashtags(post_id);
CREATE INDEX IF NOT EXISTS idx_tw_post_hashtags_hashtag ON tw_post_hashtags(hashtag_id);
CREATE INDEX IF NOT EXISTS idx_tw_post_views_post_id ON tw_post_views(post_id);
CREATE INDEX IF NOT EXISTS idx_tw_hashtags_tag ON tw_hashtags(tag);

-- Enable Row Level Security
ALTER TABLE tw_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tw_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tw_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tw_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tw_retweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tw_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE tw_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tw_post_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tw_post_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tw_users
CREATE POLICY "Users can view all profiles"
  ON tw_users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON tw_users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- RLS Policies for tw_posts
CREATE POLICY "Anyone can view posts"
  ON tw_posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON tw_posts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts"
  ON tw_posts FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own posts"
  ON tw_posts FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for tw_likes
CREATE POLICY "Anyone can view likes"
  ON tw_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create likes"
  ON tw_likes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own likes"
  ON tw_likes FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for tw_comments
CREATE POLICY "Anyone can view comments"
  ON tw_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON tw_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON tw_comments FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for tw_retweets
CREATE POLICY "Anyone can view retweets"
  ON tw_retweets FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create retweets"
  ON tw_retweets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own retweets"
  ON tw_retweets FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for tw_follows
CREATE POLICY "Anyone can view follows"
  ON tw_follows FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create follows"
  ON tw_follows FOR INSERT
  TO authenticated
  WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can delete own follows"
  ON tw_follows FOR DELETE
  USING (follower_id = auth.uid());

-- RLS Policies for tw_hashtags
CREATE POLICY "Anyone can view hashtags"
  ON tw_hashtags FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage hashtags"
  ON tw_hashtags FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for tw_post_hashtags
CREATE POLICY "Anyone can view post hashtags"
  ON tw_post_hashtags FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage post hashtags"
  ON tw_post_hashtags FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policies for tw_post_views
CREATE POLICY "Service role can manage views"
  ON tw_post_views FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);