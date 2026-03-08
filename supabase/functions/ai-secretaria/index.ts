import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { contato_id, message_content, contato_name, demand_type, config } = await req.json();

    if (!message_content) {
      return new Response(JSON.stringify({ error: "message_content is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tom = config?.secretaria_tom ?? "Profissional e acolhedor";
    const templateBoasVindas = config?.secretaria_template_boas_vindas ?? "";

    // Step 1: Classify the message
    const classifyResponse = await fetch(AI_GATEWAY, {
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
            content: `Você é um assistente de triagem para um escritório de advocacia previdenciária.
Analise a mensagem do cliente e classifique-a.

Retorne usando a função classify_message.`,
          },
          {
            role: "user",
            content: `Mensagem do cliente "${contato_name ?? "Cliente"}": "${message_content}"
Tipo de demanda atual: ${demand_type ?? "não definido"}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "classify_message",
              description: "Classifica a mensagem do cliente quanto à intenção, urgência e demanda.",
              parameters: {
                type: "object",
                properties: {
                  intent: {
                    type: "string",
                    enum: [
                      "consulta_inicial",
                      "duvida_processo",
                      "urgencia",
                      "agendamento",
                      "documentacao",
                      "reclamacao",
                      "elogio",
                      "opt_out",
                      "outro",
                    ],
                    description: "Intenção principal da mensagem",
                  },
                  urgency: {
                    type: "string",
                    enum: ["baixa", "media", "alta", "critica"],
                    description: "Nível de urgência",
                  },
                  demand_type: {
                    type: "string",
                    enum: ["aposentadoria", "inss", "bpc_loas", "revisao", "outros"],
                    description: "Tipo de demanda jurídica identificada",
                  },
                  score_delta: {
                    type: "number",
                    description: "Ajuste sugerido ao score do contato (-0.3 a +0.3)",
                  },
                  summary: {
                    type: "string",
                    description: "Resumo curto da mensagem (max 100 chars)",
                  },
                },
                required: ["intent", "urgency", "demand_type", "score_delta", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "classify_message" } },
      }),
    });

    if (!classifyResponse.ok) {
      if (classifyResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (classifyResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos ao workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await classifyResponse.text();
      throw new Error(`AI classify error [${classifyResponse.status}]: ${errText}`);
    }

    const classifyData = await classifyResponse.json();
    const toolCall = classifyData.choices?.[0]?.message?.tool_calls?.[0];
    let classification = {
      intent: "outro",
      urgency: "media",
      demand_type: demand_type ?? "outros",
      score_delta: 0,
      summary: "",
    };
    if (toolCall?.function?.arguments) {
      try {
        classification = JSON.parse(toolCall.function.arguments);
      } catch { /* use defaults */ }
    }

    // Step 2: Generate auto-response if enabled
    let autoResponse = null;
    if (config?.secretaria_resposta_auto !== false) {
      const responseResult = await fetch(AI_GATEWAY, {
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
              content: `Você é a secretária virtual de um advogado previdenciário.
Tom: ${tom}
Template de boas-vindas para referência: "${templateBoasVindas}"

Regras:
- Nunca dê conselho jurídico direto
- Seja empática e profissional
- Use linguagem acessível (clientes são geralmente idosos)
- Se o cliente pedir para parar, respeite educadamente
- Máximo 3 frases na resposta
- Não use emojis excessivos (no máximo 1)
- Se for primeira mensagem, use uma variação do template de boas-vindas`,
            },
            {
              role: "user",
              content: `Cliente: "${contato_name ?? "Cliente"}"
Demanda: ${classification.demand_type}
Intenção: ${classification.intent}
Urgência: ${classification.urgency}
Mensagem: "${message_content}"

Gere uma resposta adequada.`,
            },
          ],
        }),
      });

      if (responseResult.ok) {
        const respData = await responseResult.json();
        autoResponse = respData.choices?.[0]?.message?.content ?? null;
      }
    }

    return new Response(
      JSON.stringify({
        classification,
        auto_response: autoResponse,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("AI Secretaria error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
