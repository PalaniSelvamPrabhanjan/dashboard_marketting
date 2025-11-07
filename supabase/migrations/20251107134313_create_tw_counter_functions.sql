/*
  # Create Counter Functions for tw-dupe

  1. Functions
    - `increment_likes_count` - Increments likes_count on a post
    - `decrement_likes_count` - Decrements likes_count on a post
    - `increment_comments_count` - Increments comments_count on a post
    - `decrement_comments_count` - Decrements comments_count on a post
    - `increment_retweets_count` - Increments retweets_count on a post
    - `decrement_retweets_count` - Decrements retweets_count on a post
    - `increment_views_count` - Increments views_count on a post

  2. Purpose
    - Atomic counter updates to prevent race conditions
    - Used by engagement endpoints to update post metrics
*/

CREATE OR REPLACE FUNCTION increment_likes_count(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE tw_posts
  SET likes_count = likes_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_likes_count(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE tw_posts
  SET likes_count = GREATEST(0, likes_count - 1)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_comments_count(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE tw_posts
  SET comments_count = comments_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_comments_count(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE tw_posts
  SET comments_count = GREATEST(0, comments_count - 1)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_retweets_count(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE tw_posts
  SET retweets_count = retweets_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_retweets_count(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE tw_posts
  SET retweets_count = GREATEST(0, retweets_count - 1)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_views_count(post_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE tw_posts
  SET views_count = views_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;
