import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentStats, error: recentError } = await supabase
      .from("platform_stats")
      .select("total_likes, total_views, total_comments, total_posts, period_start")
      .gte("period_start", thirtyDaysAgo.toISOString())
      .order("period_start", { ascending: false });

    if (recentError) {
      throw recentError;
    }

    const currentTotals = {
      likes: 0,
      views: 0,
      comments: 0,
      posts: 0,
    };

    const sevenDaysTotals = {
      likes: 0,
      views: 0,
      comments: 0,
      posts: 0,
    };

    recentStats?.forEach((stat) => {
      currentTotals.likes += stat.total_likes || 0;
      currentTotals.views += stat.total_views || 0;
      currentTotals.comments += stat.total_comments || 0;
      currentTotals.posts += stat.total_posts || 0;

      const statDate = new Date(stat.period_start);
      if (statDate >= sevenDaysAgo) {
        sevenDaysTotals.likes += stat.total_likes || 0;
        sevenDaysTotals.views += stat.total_views || 0;
        sevenDaysTotals.comments += stat.total_comments || 0;
        sevenDaysTotals.posts += stat.total_posts || 0;
      }
    });

    const growth = {
      likes: currentTotals.likes > 0 ? sevenDaysTotals.likes / currentTotals.likes : 0,
      views: currentTotals.views > 0 ? sevenDaysTotals.views / currentTotals.views : 0,
      comments: currentTotals.comments > 0 ? sevenDaysTotals.comments / currentTotals.comments : 0,
      posts: currentTotals.posts > 0 ? sevenDaysTotals.posts / currentTotals.posts : 0,
    };

    const chartData = recentStats
      ?.slice(0, 7)
      .reverse()
      .map((stat) => ({
        likes: stat.total_likes || 0,
        views: stat.total_views || 0,
        comments: stat.total_comments || 0,
        posts: stat.total_posts || 0,
      })) || [];

    const response = {
      totals: currentTotals,
      growth,
      charts: {
        likes: chartData.map((d) => d.likes),
        views: chartData.map((d) => d.views),
        comments: chartData.map((d) => d.comments),
        posts: chartData.map((d) => d.posts),
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch dashboard summary" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
