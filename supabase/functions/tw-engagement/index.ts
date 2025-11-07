import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function getUserFromToken(req: Request): string | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = JSON.parse(atob(token));

    if (decoded.exp < Date.now()) {
      return null;
    }

    return decoded.userId;
  } catch {
    return null;
  }
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
    const pathParts = url.pathname.split('/').filter(Boolean);
    const postId = pathParts[1];
    const action = pathParts[2];

    if (action === "like" && req.method === "POST") {
      const userId = getUserFromToken(req);
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: existingLike } = await supabase
        .from("tw_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .maybeSingle();

      if (existingLike) {
        return new Response(
          JSON.stringify({ error: "Already liked" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error: likeError } = await supabase
        .from("tw_likes")
        .insert({ post_id: postId, user_id: userId });

      if (likeError) {
        return new Response(
          JSON.stringify({ error: likeError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase.rpc("increment_likes_count", { post_id: postId });

      return new Response(
        JSON.stringify({ message: "Liked successfully" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "like" && req.method === "DELETE") {
      const userId = getUserFromToken(req);
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("tw_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase.rpc("decrement_likes_count", { post_id: postId });

      return new Response(
        JSON.stringify({ message: "Unliked successfully" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "comments" && req.method === "POST") {
      const userId = getUserFromToken(req);
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { content } = await req.json();

      if (!content || content.trim().length === 0) {
        return new Response(
          JSON.stringify({ error: "Content is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: newComment, error } = await supabase
        .from("tw_comments")
        .insert({
          post_id: postId,
          user_id: userId,
          content,
        })
        .select(`
          *,
          tw_users!inner (
            id,
            username,
            avatar_url
          )
        `)
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase.rpc("increment_comments_count", { post_id: postId });

      return new Response(
        JSON.stringify({ comment: newComment }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "comments" && req.method === "GET") {
      const { data: comments, error } = await supabase
        .from("tw_comments")
        .select(`
          *,
          tw_users!inner (
            id,
            username,
            avatar_url
          )
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: false });

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ comments }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "retweet" && req.method === "POST") {
      const userId = getUserFromToken(req);
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { quote_content } = await req.json();

      const { data: existingRetweet } = await supabase
        .from("tw_retweets")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", userId)
        .is("quote_content", null)
        .maybeSingle();

      if (existingRetweet && !quote_content) {
        return new Response(
          JSON.stringify({ error: "Already retweeted" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: newRetweet, error } = await supabase
        .from("tw_retweets")
        .insert({
          post_id: postId,
          user_id: userId,
          quote_content: quote_content || null,
        })
        .select()
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase.rpc("increment_retweets_count", { post_id: postId });

      return new Response(
        JSON.stringify({ retweet: newRetweet }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "retweet" && req.method === "DELETE") {
      const userId = getUserFromToken(req);
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("tw_retweets")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase.rpc("decrement_retweets_count", { post_id: postId });

      return new Response(
        JSON.stringify({ message: "Retweet removed successfully" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "view" && req.method === "POST") {
      const userId = getUserFromToken(req);

      const { error } = await supabase
        .from("tw_post_views")
        .insert({
          post_id: postId,
          user_id: userId,
        });

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase.rpc("increment_views_count", { post_id: postId });

      return new Response(
        JSON.stringify({ message: "View tracked" }),
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