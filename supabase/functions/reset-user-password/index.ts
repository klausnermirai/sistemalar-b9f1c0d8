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
    if (!authHeader) throw new Error("Não autenticado");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller identity
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) throw new Error("Não autenticado");

    // Verify caller is admin
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: callerRole } = await adminClient
      .from("user_roles")
      .select("role, organization_id")
      .eq("user_id", caller.id)
      .limit(1)
      .single();

    if (!callerRole || callerRole.role !== "admin") {
      throw new Error("Apenas administradores podem redefinir senhas");
    }

    const { user_id, new_password } = await req.json();
    if (!user_id || !new_password) throw new Error("user_id e new_password são obrigatórios");
    if (new_password.length < 6) throw new Error("Senha deve ter pelo menos 6 caracteres");

    // Verify target user belongs to same org
    const { data: targetRole } = await adminClient
      .from("user_roles")
      .select("organization_id")
      .eq("user_id", user_id)
      .limit(1)
      .single();

    if (!targetRole || targetRole.organization_id !== callerRole.organization_id) {
      throw new Error("Usuário não pertence à sua organização");
    }

    // Reset password
    const { error } = await adminClient.auth.admin.updateUser(user_id, { password: new_password });
    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
