import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "openai/gpt-5-nano";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
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
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { contato_id } = await req.json();

    if (!contato_id) {
      return new Response(JSON.stringify({ error: "contato_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get contact details
    const { data: contato, error: contatoErr } = await adminClient
      .from("contatos")
      .select("*")
      .eq("id", contato_id)
      .eq("advogado_id", userId)
      .single();

    if (contatoErr || !contato) {
      return new Response(JSON.stringify({ error: "Contato não encontrado" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's config
    const { data: config } = await adminClient
      .from("configuracoes")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const templateD2 = config?.recuperacao_template_d2 ?? "Olá [Nome]! Vi que conversamos sobre [demanda] há alguns dias. Ainda posso ajudá-lo(a) com essa questão?";
    const tom = config?.secretaria_tom ?? "Profissional e acolhedor";

    // Get recent message history for context
    const { data: recentMsgs } = await adminClient
      .from("mensagens")
      .select("content, direction, created_at")
      .eq("contato_id", contato_id)
      .order("created_at", { ascending: false })
      .limit(5);

    const msgHistory = (recentMsgs ?? [])
      .reverse()
      .map((m) => `[${m.direction === "in" ? "Cliente" : "Escritório"}]: ${m.content}`)
      .join("\n");

    const demandLabels: Record<string, string> = {
      aposentadoria: "Aposentadoria",
      inss: "INSS",
      bpc_loas: "BPC/LOAS",
      revisao: "Revisão",
      outros: "Outros",
    };

    // Calculate days since last message
    const lastMsgDate = contato.last_msg_at ? new Date(contato.last_msg_at) : new Date(contato.created_at);
    const daysSinceContact = Math.floor((Date.now() - lastMsgDate.getTime()) / (1000 * 60 * 60 * 24));

    // Generate recovery message
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
            content: `Você é o agente de recuperação de um escritório de advocacia previdenciária.
Seu objetivo é reativar contatos que esfriaram — pessoas que demonstraram interesse mas pararam de responder.

Tom: ${tom}
Template base para referência (adapte criativamente): "${templateD2}"

Regras:
- Seja empática, nunca invasiva
- Personalize com o nome e a demanda do cliente
- Mencione algo relevante do histórico se possível
- Crie senso de oportunidade (não urgência agressiva)
- Use linguagem acessível (clientes geralmente são idosos)
- Máximo 3 frases
- No máximo 1 emoji
- Nunca dê conselho jurídico direto
- Se o contato tem score alto, seja mais direto; se baixo, mais sutil`,
          },
          {
            role: "user",
            content: `Contato: "${contato.name}"
Demanda: ${demandLabels[contato.demand_type ?? ""] ?? "Não definida"}
Status atual: ${contato.status}
Score: ${Math.round(contato.score_hot * 100)}%
Dias sem contato: ${daysSinceContact}
${msgHistory ? `\nHistórico recente:\n${msgHistory}` : "Sem histórico de mensagens."}

Gere uma mensagem de recuperação personalizada.`,
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, tente novamente." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      throw new Error(`AI error [${aiResponse.status}]: ${errText}`);
    }

    const aiData = await aiResponse.json();
    const recoveryMessage = aiData.choices?.[0]?.message?.content ?? null;

    if (!recoveryMessage) {
      throw new Error("AI did not return a message");
    }

    return new Response(
      JSON.stringify({
        message: recoveryMessage,
        contato_name: contato.name,
        demand_type: contato.demand_type,
        days_since_contact: daysSinceContact,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("AI Recuperacao error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
