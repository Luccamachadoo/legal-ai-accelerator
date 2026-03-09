import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || authHeader !== `Bearer ${supabaseServiceKey}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get all lawyers
    const { data: profiles } = await adminClient.from("profiles").select("user_id");
    if (!profiles) return new Response(JSON.stringify({ message: "No profiles found" }), { headers: corsHeaders });

    let reportsCreated = 0;
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

    for (const profile of profiles) {
      const { count: reactivations } = await adminClient
        .from("contatos")
        .select("*", { count: "exact" })
        .eq("advogado_id", profile.user_id)
        .eq("status", "reativado")
        .gte("updated_at", periodStart)
        .lte("updated_at", periodEnd);

      const metrics = { generated_at: now.toISOString(), status: "automatic" };

      await adminClient.from("relatorios").insert({
        advogado_id: profile.user_id,
        period_start: periodStart.split('T')[0],
        period_end: periodEnd.split('T')[0],
        reativacoes: reactivations || 0,
        metrics_json: metrics
      });

      reportsCreated++;
    }

    return new Response(JSON.stringify({ success: true, reports_created: reportsCreated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});