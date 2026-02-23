import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get user's organization
    const { data: orgData } = await supabaseAdmin.rpc(
      "get_user_organization_id",
      { _user_id: userId }
    );
    if (!orgData) {
      return new Response(
        JSON.stringify({ error: "Usuário sem organização" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    const organizationId = orgData;

    const body = await req.json();
    const { residents: rows, relatives: relRows } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "Nenhum residente enviado" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let inserted = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.name || row.name.trim() === "") {
        errors++;
        errorDetails.push(`Linha ${i + 1}: nome vazio`);
        continue;
      }

      const { data: resident, error: insertErr } = await supabaseAdmin
        .from("residents")
        .insert({ ...row, organization_id: organizationId })
        .select("id")
        .single();

      if (insertErr) {
        errors++;
        errorDetails.push(`${row.name}: ${insertErr.message}`);
        continue;
      }

      // Insert relatives for this resident
      const residentRelatives = (relRows || []).filter(
        (r: { _rowIndex: number }) => r._rowIndex === i
      );
      for (const rel of residentRelatives) {
        const { _rowIndex, ...relData } = rel;
        await supabaseAdmin
          .from("resident_relatives")
          .insert({ ...relData, resident_id: resident.id });
      }

      inserted++;
    }

    return new Response(
      JSON.stringify({ inserted, errors, errorDetails }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
