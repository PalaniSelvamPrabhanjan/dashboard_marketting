/*
  # Fix Social Desk RLS Policies

  1. Changes
    - Allow anonymous read access to platform_stats, top_posts, activity_calendar
    - Allow service role full access for webhook ingestion
    - Remove authentication requirement for dashboard viewing
    
  2. Security
    - Dashboard data is public (read-only)
    - Only service role can insert/update data
    - Maintains data integrity
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can read platform stats" ON platform_stats;
DROP POLICY IF EXISTS "Service role can insert platform stats" ON platform_stats;
DROP POLICY IF EXISTS "Authenticated users can read top posts" ON top_posts;
DROP POLICY IF EXISTS "Service role can insert top posts" ON top_posts;
DROP POLICY IF EXISTS "Authenticated users can read activity calendar" ON activity_calendar;
DROP POLICY IF EXISTS "Service role can insert activity calendar" ON activity_calendar;

-- New policies for platform_stats
CREATE POLICY "Anyone can read platform stats"
  ON platform_stats FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert platform stats"
  ON platform_stats FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update platform stats"
  ON platform_stats FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- New policies for top_posts
CREATE POLICY "Anyone can read top posts"
  ON top_posts FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert top posts"
  ON top_posts FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update top posts"
  ON top_posts FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- New policies for activity_calendar
CREATE POLICY "Anyone can read activity calendar"
  ON activity_calendar FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert activity calendar"
  ON activity_calendar FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update activity calendar"
  ON activity_calendar FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);
