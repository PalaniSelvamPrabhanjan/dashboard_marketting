import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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

Deno.serve(async (_req: Request) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    console.log(`[CRON] Running tw-dupe stats aggregation at ${now.toISOString()}`);

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

    console.log(`[CRON] Aggregated stats:`, payload.totals);

    const webhookSecret = Deno.env.get("SOCIAL_DESK_WEBHOOK_SECRET") || "shared-secret-key";
    const socialDeskUrl = "https://aabzwjzzchkddrlcxxjk.supabase.co/functions/v1/ingest-platform-stats";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

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

    const responseText = await response.text();

    if (response.ok) {
      console.log(`[CRON] Successfully sent stats to Social Desk: ${response.status}`);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Stats sent to Social Desk successfully",
          payload,
          response: responseText,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      console.error(`[CRON] Failed to send stats: ${response.status} - ${responseText}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to send stats: ${response.status}`,
          response: responseText,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error(`[CRON] Error:`, error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});