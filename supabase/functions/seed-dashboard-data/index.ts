import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const platforms = ['fb-dupe', 'tw-dupe', 'tt-dupe'] as const;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const platformStats = [];
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
      .insert(platformStats);

    if (statsError) {
      console.error('Error seeding platform stats:', statsError);
      return new Response(
        JSON.stringify({ error: 'Failed to seed platform stats', details: statsError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const topPosts = [];
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
      .insert(topPosts);

    if (postsError) {
      console.error('Error seeding top posts:', postsError);
      return new Response(
        JSON.stringify({ error: 'Failed to seed top posts', details: postsError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const activities = [];
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
      .insert(activities);

    if (activitiesError) {
      console.error('Error seeding activities:', activitiesError);
      return new Response(
        JSON.stringify({ error: 'Failed to seed activities', details: activitiesError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Mock data seeded successfully',
        counts: {
          platformStats: platformStats.length,
          topPosts: topPosts.length,
          activities: activities.length
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});