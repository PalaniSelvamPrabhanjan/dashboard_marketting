import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
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
    const path = url.pathname;

    if (path.endsWith("/register") && req.method === "POST") {
      const { username, email, password }: RegisterRequest = await req.json();

      if (!username || !email || !password) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (password.length < 6) {
        return new Response(
          JSON.stringify({ error: "Password must be at least 6 characters" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: existingUser } = await supabase
        .from("tw_users")
        .select("id")
        .or(`username.eq.${username},email.eq.${email}`)
        .maybeSingle();

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: "Username or email already exists" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const passwordHash = await hashPassword(password);

      const { data: newUser, error } = await supabase
        .from("tw_users")
        .insert({
          username,
          email,
          password_hash: passwordHash,
        })
        .select("id, username, email, avatar_url, bio, followers_count, following_count, created_at")
        .single();

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const token = btoa(JSON.stringify({ userId: newUser.id, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));

      return new Response(
        JSON.stringify({ user: newUser, token }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (path.endsWith("/login") && req.method === "POST") {
      const { email, password }: LoginRequest = await req.json();

      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: "Missing email or password" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: user, error } = await supabase
        .from("tw_users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (error || !user) {
        return new Response(
          JSON.stringify({ error: "Invalid credentials" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const isValid = await verifyPassword(password, user.password_hash);

      if (!isValid) {
        return new Response(
          JSON.stringify({ error: "Invalid credentials" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const token = btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));

      const { password_hash, ...userWithoutPassword } = user;

      return new Response(
        JSON.stringify({ user: userWithoutPassword, token }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (path.endsWith("/me") && req.method === "GET") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const token = authHeader.substring(7);
      const decoded = JSON.parse(atob(token));

      if (decoded.exp < Date.now()) {
        return new Response(
          JSON.stringify({ error: "Token expired" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: user, error } = await supabase
        .from("tw_users")
        .select("id, username, email, avatar_url, bio, followers_count, following_count, created_at")
        .eq("id", decoded.userId)
        .maybeSingle();

      if (error || !user) {
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ user }),
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