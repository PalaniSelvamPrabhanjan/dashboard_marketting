import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function generateHmacSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return `sha256=${hashHex}`;
}

async function sendStatsToSocialDesk(supabase: any) {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  const { data: postsData } = await supabase
    .from("tw_posts")
    .select("id, likes_count, views_count, comments_count")
    .gte("created_at", oneHourAgo.toISOString())
    .lte("created_at", now.toISOString());

  const { count: totalPosts } = await supabase
    .from("tw_posts")
    .select("*", { count: "exact", head: true })
    .gte("created_at", oneHourAgo.toISOString())
    .lte("created_at", now.toISOString());

  const { data: likesData } = await supabase
    .from("tw_likes")
    .select("id", { count: "exact" })
    .gte("created_at", oneHourAgo.toISOString())
    .lte("created_at", now.toISOString());

  const { data: commentsData } = await supabase
    .from("tw_comments")
    .select("id", { count: "exact" })
    .gte("created_at", oneHourAgo.toISOString())
    .lte("created_at", now.toISOString());

  const { data: viewsData } = await supabase
    .from("tw_post_views")
    .select("id", { count: "exact" })
    .gte("viewed_at", oneHourAgo.toISOString())
    .lte("viewed_at", now.toISOString());

  const { data: topPosts } = await supabase
    .from("tw_posts")
    .select("id, views_count, likes_count, comments_count")
    .order("views_count", { ascending: false })
    .limit(10);

  const payload = {
    platform: "tw-dupe",
    period_start: oneHourAgo.toISOString(),
    period_end: now.toISOString(),
    totals: {
      total_posts: totalPosts || 0,
      total_likes: likesData?.length || 0,
      total_views: viewsData?.length || 0,
      total_comments: commentsData?.length || 0,
    },
    top_k_posts: (topPosts || []).map(post => ({
      post_id: post.id,
      views: post.views_count,
      likes: post.likes_count,
      comments: post.comments_count,
    })),
  };

  const webhookSecret = Deno.env.get("SOCIAL_DESK_WEBHOOK_SECRET") || "shared-secret-key";
  const socialDeskUrl = Deno.env.get("SOCIAL_DESK_INGEST_URL") ||
    "https://aabzwjzzchkddrlcxxjk.supabase.co/functions/v1/ingest-platform-stats";
  const anonKey = Deno.env.get("SOCIAL_DESK_ANON_KEY") || Deno.env.get("SUPABASE_ANON_KEY");

  const payloadString = JSON.stringify(payload);
  const signature = await generateHmacSignature(payloadString, webhookSecret);

  const response = await fetch(socialDeskUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Signature": signature,
      "Authorization": `Bearer ${anonKey}`,
    },
    body: payloadString,
  });

  return {
    success: response.ok,
    status: response.status,
    payload,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);

    if (url.pathname.endsWith("/holistic") && req.method === "GET") {
      const fromParam = url.searchParams.get("from");
      const toParam = url.searchParams.get("to");

      const from = fromParam ? new Date(fromParam) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const to = toParam ? new Date(toParam) : new Date();

      const { count: totalPosts } = await supabase
        .from("tw_posts")
        .select("*", { count: "exact", head: true })
        .gte("created_at", from.toISOString())
        .lte("created_at", to.toISOString());

      const { data: allPosts } = await supabase
        .from("tw_posts")
        .select("likes_count, views_count, comments_count")
        .gte("created_at", from.toISOString())
        .lte("created_at", to.toISOString());

      const totalLikes = allPosts?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0;
      const totalViews = allPosts?.reduce((sum, post) => sum + (post.views_count || 0), 0) || 0;
      const totalComments = allPosts?.reduce((sum, post) => sum + (post.comments_count || 0), 0) || 0;

      return new Response(
        JSON.stringify({
          total_posts: totalPosts || 0,
          total_likes: totalLikes,
          total_views: totalViews,
          total_comments: totalComments,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (url.pathname.endsWith("/send-webhook") && req.method === "POST") {
      const result = await sendStatsToSocialDesk(supabase);

      return new Response(
        JSON.stringify(result),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});