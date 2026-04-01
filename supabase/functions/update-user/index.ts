import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify caller is authenticated
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user: caller } } = await supabaseClient.auth.getUser();
    if (!caller) throw new Error("Unauthorized");

    // Check caller is admin
    const { data: roleData } = await supabaseClient.rpc("has_role", {
      _user_id: caller.id,
      _role: "admin",
    });
    if (!roleData) throw new Error("Only admins can update user credentials");

    const { authUserId, email, password, fullName } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const updates: Record<string, any> = {};
    if (email) updates.email = email;
    if (password) updates.password = password;
    if (fullName) updates.user_metadata = { full_name: fullName };

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      authUserId,
      updates
    );

    if (error) throw error;

    return new Response(JSON.stringify({ user: data.user }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
