import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "openai/gpt-5-nano";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

    // Verify cron authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get all configurations
    const { data: configs } = await adminClient.from("configuracoes").select("*");
    
    if (!configs) return new Response(JSON.stringify({ message: "No configs found" }), { headers: corsHeaders });

    let processedCount = 0;

    for (const config of configs) {
      const timings = config.recuperacao_timing_dias || [2, 5, 10];
      
      // For each timing, find contacts last modified exactly that many days ago
      for (const days of timings) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - days);
        const startOfDay = new Date(targetDate.setHours(0,0,0,0)).toISOString();
        const endOfDay = new Date(targetDate.setHours(23,59,59,999)).toISOString();

        const { data: contatos } = await adminClient
          .from("contatos")
          .select("*")
          .eq("advogado_id", config.user_id)
          .eq("status", "esfriado")
          .gte("last_msg_at", startOfDay)
          .lte("last_msg_at", endOfDay);

        if (!contatos || contatos.length === 0) continue;

        for (const contato of contatos) {
          // Trigger the AI Recuperacao logic directly or send message
          const { data: recentMsgs } = await adminClient
            .from("mensagens")
            .select("content, direction, created_at")
            .eq("contato_id", contato.id)
            .order("created_at", { ascending: false })
            .limit(5);

          const msgHistory = (recentMsgs ?? []).reverse().map((m: any) => `[${m.direction === "in" ? "Cliente" : "Escritório"}]: ${m.content}`).join("\n");

          const aiResponse = await fetch(AI_GATEWAY, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: MODEL,
              messages: [
                {
                  role: "system",
                  content: `Você é o agente de recuperação. Tom: ${config.secretaria_tom}. Template: ${config.recuperacao_template_d2}. Máx 3 frases. Seja gentil e recupere o contato.`,
                },
                {
                  role: "user",
                  content: `Contato: ${contato.name}, Demanda: ${contato.demand_type}, Dias: ${days}\nHistórico: ${msgHistory}`,
                },
              ],
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const msg = aiData.choices?.[0]?.message?.content;
            if (msg) {
              // Add to alertas for user to review, or send directly if fully automated
              await adminClient.from("alertas").insert({
                advogado_id: contato.advogado_id,
                contato_id: contato.id,
                score: contato.score_hot,
                summary: `Mensagem de recuperação gerada (Dia ${days}): ${msg}`,
                read: false
              });
              processedCount++;
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, processed: processedCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Cron Recovery Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});