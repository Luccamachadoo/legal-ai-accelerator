import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get configs where anonymization is enabled
    const { data: configs } = await adminClient.from("configuracoes").select("*").eq("lgpd_anonimizacao", true);
    if (!configs) return new Response(JSON.stringify({ message: "No configs found" }), { headers: corsHeaders });

    let anonymizedCount = 0;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 3); // 72 hours
    const thresholdIso = thresholdDate.toISOString();

    for (const config of configs) {
      // Find inactive contacts
      const { data: contatos } = await adminClient
        .from("contatos")
        .select("*")
        .eq("advogado_id", config.user_id)
        .lte("last_msg_at", thresholdIso)
        .in("status", ["fechado", "esfriado"]);

      if (!contatos) continue;

      for (const contato of contatos) {
        // Anonymize personal info
        await adminClient.from("contatos").update({
          name: "Anonimizado (LGPD)",
          phone: "0000000000",
        }).eq("id", contato.id);

        anonymizedCount++;
      }
    }

    return new Response(JSON.stringify({ success: true, anonymized: anonymizedCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});