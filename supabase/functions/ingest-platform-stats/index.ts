import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Signature",
};

interface IngestPayload {
  platform: "fb-dupe" | "tw-dupe" | "tt-dupe";
  period_start: string;
  period_end: string;
  totals: {
    total_posts: number;
    total_likes: number;
    total_views: number;
    total_comments: number;
  };
  top_k_posts?: Array<{
    post_id: string;
    views: number;
    likes: number;
    comments?: number;
  }>;
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  try {
    const hmac = createHmac("sha256", secret);
    hmac.update(payload);
    const expectedSignature = `sha256=${hmac.digest("hex")}`;
    return signature === expectedSignature;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const signature = req.headers.get("X-Signature");
    const rawBody = await req.text();
    const data: IngestPayload = JSON.parse(rawBody);

    const secret = Deno.env.get("WEBHOOK_SECRET") || "default-secret-change-in-production";
    
    let signatureVerified = false;
    if (signature) {
      signatureVerified = verifySignature(rawBody, signature, secret);
    }

    if (!data.platform || !data.period_start || !data.period_end || !data.totals) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: statsError } = await supabase
      .from("platform_stats")
      .insert({
        platform: data.platform,
        period_start: data.period_start,
        period_end: data.period_end,
        total_likes: data.totals.total_likes,
        total_views: data.totals.total_views,
        total_comments: data.totals.total_comments,
        total_posts: data.totals.total_posts,
        signature_verified: signatureVerified,
      });

    if (statsError) {
      console.error("Error inserting stats:", statsError);
      return new Response(
        JSON.stringify({ error: "Failed to store stats" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (data.top_k_posts && data.top_k_posts.length > 0) {
      const topPostsData = data.top_k_posts.map((post) => ({
        platform: data.platform,
        post_id: post.post_id,
        views: post.views,
        likes: post.likes,
        comments: post.comments || 0,
      }));

      const { error: postsError } = await supabase
        .from("top_posts")
        .insert(topPostsData);

      if (postsError) {
        console.error("Error inserting top posts:", postsError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Data ingested successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
