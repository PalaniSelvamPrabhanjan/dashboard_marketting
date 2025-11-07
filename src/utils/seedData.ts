import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type PlatformStatsInsert = Database['public']['Tables']['platform_stats']['Insert'];
type TopPostsInsert = Database['public']['Tables']['top_posts']['Insert'];
type ActivityCalendarInsert = Database['public']['Tables']['activity_calendar']['Insert'];

export async function seedMockData() {
  const platforms = ['fb-dupe', 'tw-dupe', 'tt-dupe'] as const;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const platformStats: PlatformStatsInsert[] = [];
  for (let i = 0; i < 30; i++) {
    const periodStart = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    const periodEnd = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000);

    for (const platform of platforms) {
      const baseMultiplier = platform === 'fb-dupe' ? 1.5 : platform === 'tw-dupe' ? 1.2 : 1.0;

      platformStats.push({
        platform,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        total_likes: Math.floor((Math.random() * 5000 + 1000) * baseMultiplier),
        total_views: Math.floor((Math.random() * 50000 + 10000) * baseMultiplier),
        total_comments: Math.floor((Math.random() * 1000 + 100) * baseMultiplier),
        total_posts: Math.floor(Math.random() * 20 + 5),
        signature_verified: true,
      });
    }
  }

  const { error: statsError } = await supabase
    .from('platform_stats')
    .insert(platformStats as any);

  if (statsError) {
    console.error('Error seeding platform stats:', statsError);
    return false;
  }

  const topPosts: TopPostsInsert[] = [];
  for (const platform of platforms) {
    for (let i = 0; i < 10; i++) {
      topPosts.push({
        platform,
        post_id: `${platform}-post-${i + 1}`,
        views: Math.floor(Math.random() * 100000 + 10000),
        likes: Math.floor(Math.random() * 10000 + 1000),
        comments: Math.floor(Math.random() * 1000 + 100),
      });
    }
  }

  const { error: postsError } = await supabase
    .from('top_posts')
    .insert(topPosts as any);

  if (postsError) {
    console.error('Error seeding top posts:', postsError);
    return false;
  }

  const activities: ActivityCalendarInsert[] = [];
  for (let i = 0; i < 30; i++) {
    const activityDate = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = activityDate.toISOString().split('T')[0];

    if (Math.random() > 0.3) {
      const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
      activities.push({
        date: dateStr,
        platform: randomPlatform,
        event_type: 'post',
        event_count: Math.floor(Math.random() * 10 + 1),
        color_code: '#EC4899',
      });
    }
  }

  const { error: activitiesError } = await supabase
    .from('activity_calendar')
    .insert(activities as any);

  if (activitiesError) {
    console.error('Error seeding activities:', activitiesError);
    return false;
  }

  console.log('Mock data seeded successfully!');
  return true;
}
