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
    const postId = pathParts[pathParts.length - 1];

    if (req.method === "POST" && !pathParts.includes('posts')) {
      const userId = getUserFromToken(req);
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { content, media_url, media_type } = await req.json();

      if (!content || content.trim().length === 0) {
        return new Response(
          JSON.stringify({ error: "Content is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (content.length > 280) {
        return new Response(
          JSON.stringify({ error: "Tweet must be 280 characters or less" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: newPost, error } = await supabase
        .from("tw_posts")
        .insert({
          user_id: userId,
          content,
          media_url: media_url || null,
          media_type: media_type || null,
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

      return new Response(
        JSON.stringify({ post: newPost }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "GET" && pathParts.length === 1) {
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "20");
      const offset = (page - 1) * limit;

      const { data: posts, error } = await supabase
        .from("tw_posts")
        .select(`
          *,
          tw_users!inner (
            id,
            username,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ posts, page, limit }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "GET" && postId) {
      const { data: post, error } = await supabase
        .from("tw_posts")
        .select(`
          *,
          tw_users!inner (
            id,
            username,
            avatar_url
          )
        `)
        .eq("id", postId)
        .maybeSingle();

      if (error || !post) {
        return new Response(
          JSON.stringify({ error: "Post not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ post }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "DELETE" && postId) {
      const userId = getUserFromToken(req);
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: post } = await supabase
        .from("tw_posts")
        .select("user_id")
        .eq("id", postId)
        .maybeSingle();

      if (!post) {
        return new Response(
          JSON.stringify({ error: "Post not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (post.user_id !== userId) {
        return new Response(
          JSON.stringify({ error: "Forbidden" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("tw_posts")
        .delete()
        .eq("id", postId);

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ message: "Post deleted successfully" }),
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