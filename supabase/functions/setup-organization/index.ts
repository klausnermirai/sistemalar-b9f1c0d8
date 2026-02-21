import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    const body = await req.json();
    const { org_name, org_type, cnpj, city, state, central_council_name, metropolitan_council_name, role_title } = body;

    if (!org_name || !org_type || !cnpj) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if CNPJ already exists
    const { data: existingOrg } = await supabaseAdmin
      .from("organizations")
      .select("id")
      .eq("cnpj", cnpj)
      .maybeSingle();

    if (existingOrg) {
      return new Response(JSON.stringify({ error: "CNPJ já cadastrado" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already belongs to an org
    const { data: existingRole } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingRole) {
      return new Response(JSON.stringify({ error: "Usuário já pertence a uma organização" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create org
    const { data: org, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert({
        name: org_name,
        org_type,
        cnpj,
        city: city || null,
        state: state || null,
        central_council_name: central_council_name || null,
        metropolitan_council_name: metropolitan_council_name || null,
      })
      .select("id")
      .single();

    if (orgError) {
      throw orgError;
    }

    // Create user_role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: userId,
        organization_id: org.id,
        role: "admin",
        is_primary: true,
      });

    if (roleError) {
      // Rollback org
      await supabaseAdmin.from("organizations").delete().eq("id", org.id);
      throw roleError;
    }

    // Update profile with role_title
    if (role_title) {
      await supabaseAdmin
        .from("profiles")
        .update({ role_title })
        .eq("user_id", userId);
    }

    return new Response(JSON.stringify({ organization_id: org.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
