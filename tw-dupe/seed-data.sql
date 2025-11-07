-- Seed data for tw-dupe testing

-- Insert test users
INSERT INTO tw_users (id, username, email, password_hash, bio, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'alice_wonder', 'alice@example.com', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'Tech enthusiast and coffee lover', NOW() - INTERVAL '30 days'),
('22222222-2222-2222-2222-222222222222', 'bob_builder', 'bob@example.com', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'Building the future, one tweet at a time', NOW() - INTERVAL '25 days'),
('33333333-3333-3333-3333-333333333333', 'carol_creative', 'carol@example.com', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'Designer by day, dreamer by night', NOW() - INTERVAL '20 days'),
('44444444-4444-4444-4444-444444444444', 'dave_dev', 'dave@example.com', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'Full-stack developer | Open source contributor', NOW() - INTERVAL '15 days'),
('55555555-5555-5555-5555-555555555555', 'emma_explorer', 'emma@example.com', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'Travel blogger | Adventure seeker', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- Insert tweets over the past 7 days
INSERT INTO tw_posts (user_id, content, likes_count, views_count, comments_count, retweets_count, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Just launched my new project! So excited to share it with everyone. Check it out and let me know what you think!', 145, 3200, 23, 45, NOW() - INTERVAL '6 days'),
('22222222-2222-2222-2222-222222222222', 'The future of web development is here! JavaScript frameworks are evolving faster than ever.', 89, 2100, 15, 28, NOW() - INTERVAL '6 days'),
('33333333-3333-3333-3333-333333333333', 'New design trends for 2024: minimalism meets bold colors. What do you think?', 234, 5600, 34, 67, NOW() - INTERVAL '5 days'),
('44444444-4444-4444-4444-444444444444', 'Just fixed a bug that''s been haunting me for days. Best feeling ever!', 178, 4200, 29, 52, NOW() - INTERVAL '5 days'),
('55555555-5555-5555-5555-555555555555', 'Exploring the mountains of Colorado. The views are breathtaking!', 312, 7800, 45, 89, NOW() - INTERVAL '4 days'),
('11111111-1111-1111-1111-111111111111', 'Coffee and code - the perfect combination for a productive morning.', 156, 3900, 21, 38, NOW() - INTERVAL '4 days'),
('22222222-2222-2222-2222-222222222222', 'TypeScript has changed the way I write JavaScript. Highly recommend it!', 267, 6500, 38, 71, NOW() - INTERVAL '3 days'),
('33333333-3333-3333-3333-333333333333', 'Just finished a major client project. Time to celebrate!', 198, 4800, 27, 49, NOW() - INTERVAL '3 days'),
('44444444-4444-4444-4444-444444444444', 'Open source contributions are so rewarding. Join the community!', 145, 3600, 19, 42, NOW() - INTERVAL '2 days'),
('55555555-5555-5555-5555-555555555555', 'Travel tip: Always pack light and bring a good book.', 223, 5400, 31, 58, NOW() - INTERVAL '2 days'),
('11111111-1111-1111-1111-111111111111', 'Working on something exciting. Can''t wait to share more details soon!', 189, 4600, 25, 47, NOW() - INTERVAL '1 day'),
('22222222-2222-2222-2222-222222222222', 'Debugging is like being a detective in a crime movie where you are also the murderer.', 445, 10200, 56, 102, NOW() - INTERVAL '1 day'),
('33333333-3333-3333-3333-333333333333', 'New UI mockups are ready! Feedback welcome.', 178, 4300, 23, 41, NOW() - INTERVAL '12 hours'),
('44444444-4444-4444-4444-444444444444', 'Just discovered an amazing npm package that solves a major pain point!', 234, 5700, 32, 64, NOW() - INTERVAL '10 hours'),
('55555555-5555-5555-5555-555555555555', 'Sunset in Santorini is absolutely magical. #TravelGoals', 389, 9100, 48, 95, NOW() - INTERVAL '8 hours'),
('11111111-1111-1111-1111-111111111111', 'Late night coding session. The bugs don''t stand a chance!', 167, 4100, 22, 39, NOW() - INTERVAL '6 hours'),
('22222222-2222-2222-2222-222222222222', 'React 19 features look amazing. Can''t wait to try them out!', 298, 7200, 41, 78, NOW() - INTERVAL '5 hours'),
('33333333-3333-3333-3333-333333333333', 'Design inspiration: nature is the best teacher.', 145, 3500, 18, 35, NOW() - INTERVAL '4 hours'),
('44444444-4444-4444-4444-444444444444', 'Refactored legacy code today. Feels like a huge accomplishment!', 201, 4900, 28, 53, NOW() - INTERVAL '3 hours'),
('55555555-5555-5555-5555-555555555555', 'Just booked flights for my next adventure. Where should I go?', 256, 6200, 38, 69, NOW() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;

-- Insert some likes
INSERT INTO tw_likes (post_id, user_id, created_at)
SELECT p.id, u.id, NOW() - (random() * INTERVAL '7 days')
FROM tw_posts p
CROSS JOIN tw_users u
WHERE random() < 0.3
ON CONFLICT DO NOTHING;

-- Insert some views
INSERT INTO tw_post_views (post_id, user_id, viewed_at)
SELECT p.id, u.id, NOW() - (random() * INTERVAL '7 days')
FROM tw_posts p
CROSS JOIN tw_users u
WHERE random() < 0.6
ON CONFLICT DO NOTHING;

-- Insert some comments
INSERT INTO tw_comments (post_id, user_id, content, created_at) VALUES
((SELECT id FROM tw_posts ORDER BY created_at DESC LIMIT 1), '22222222-2222-2222-2222-222222222222', 'This is amazing! Great work!', NOW() - INTERVAL '2 hours'),
((SELECT id FROM tw_posts ORDER BY created_at DESC LIMIT 1 OFFSET 1), '33333333-3333-3333-3333-333333333333', 'I totally agree with this!', NOW() - INTERVAL '3 hours'),
((SELECT id FROM tw_posts ORDER BY created_at DESC LIMIT 1 OFFSET 2), '44444444-4444-4444-4444-444444444444', 'Thanks for sharing!', NOW() - INTERVAL '4 hours'),
((SELECT id FROM tw_posts ORDER BY created_at DESC LIMIT 1 OFFSET 3), '55555555-5555-5555-5555-555555555555', 'Very insightful post', NOW() - INTERVAL '5 hours')
ON CONFLICT DO NOTHING;

-- Update follower counts
UPDATE tw_users SET followers_count = (SELECT floor(random() * 500 + 100)::bigint);
UPDATE tw_users SET following_count = (SELECT floor(random() * 300 + 50)::bigint);
