import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "openai/gpt-5-nano";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { contato_id } = await req.json();

    if (!contato_id) {
      return new Response(JSON.stringify({ error: "contato_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: contato } = await adminClient
      .from("contatos")
      .select("*")
      .eq("id", contato_id)
      .eq("advogado_id", user.id)
      .single();

    if (!contato) {
      return new Response(JSON.stringify({ error: "Contato não encontrado" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get message history
    const { data: msgs } = await adminClient
      .from("mensagens")
      .select("content, direction, created_at, ai_class")
      .eq("contato_id", contato_id)
      .order("created_at", { ascending: false })
      .limit(20);

    const msgHistory = (msgs ?? []).reverse().map((m: any) =>
      `[${m.direction === "in" ? "Cliente" : "Escritório"}] ${m.content} ${m.ai_class ? `(classificação: ${m.ai_class})` : ""}`
    ).join("\n");

    const daysSinceFirst = Math.floor((Date.now() - new Date(contato.created_at).getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceLastMsg = contato.last_msg_at
      ? Math.floor((Date.now() - new Date(contato.last_msg_at).getTime()) / (1000 * 60 * 60 * 24))
      : daysSinceFirst;
    const totalMsgs = msgs?.length ?? 0;
    const inMsgs = msgs?.filter((m: any) => m.direction === "in").length ?? 0;
    const outMsgs = totalMsgs - inMsgs;
    const responseRate = outMsgs > 0 ? (inMsgs / outMsgs).toFixed(2) : "0";

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
            content: `Analise o lead e retorne um score preditivo de conversão usando a função score_lead.`,
          },
          {
            role: "user",
            content: `Lead: ${contato.name}
Demanda: ${contato.demand_type ?? "N/A"}
Status: ${contato.status}
Score atual: ${Math.round(contato.score_hot * 100)}%
Dias desde primeiro contato: ${daysSinceFirst}
Dias sem mensagem: ${daysSinceLastMsg}
Msgs do cliente: ${inMsgs}, Msgs do escritório: ${outMsgs}
Taxa de resposta: ${responseRate}

Histórico:
${msgHistory || "Sem histórico."}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "score_lead",
              description: "Score preditivo de conversão do lead.",
              parameters: {
                type: "object",
                properties: {
                  score: { type: "number", description: "Score de 0 a 1 (probabilidade de conversão)" },
                  confidence: { type: "string", enum: ["baixa", "media", "alta"], description: "Confiança na previsão" },
                  reasoning: { type: "string", description: "Justificativa em 1-2 frases" },
                  recommended_action: { type: "string", description: "Ação recomendada em 1 frase" },
                  risk_level: { type: "string", enum: ["baixo", "medio", "alto"], description: "Risco de perder o lead" },
                },
                required: ["score", "confidence", "reasoning", "recommended_action", "risk_level"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "score_lead" } },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) return new Response(JSON.stringify({ error: "Rate limit" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResponse.status === 402) return new Response(JSON.stringify({ error: "Créditos esgotados" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${await aiResponse.text()}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let prediction = { score: contato.score_hot, confidence: "media", reasoning: "Análise indisponível", recommended_action: "Acompanhar", risk_level: "medio" };
    if (toolCall?.function?.arguments) {
      try { prediction = JSON.parse(toolCall.function.arguments); } catch {}
    }

    // Update contato score
    await adminClient.from("contatos").update({ score_hot: prediction.score }).eq("id", contato_id);

    return new Response(
      JSON.stringify({ prediction, contato_name: contato.name }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("AI Score error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});