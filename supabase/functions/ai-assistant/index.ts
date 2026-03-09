import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AI_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

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
    const userId = user.id;

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { message } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gather all user data for context
    const [contatosRes, alertasRes, mensagensRes, relatoriosRes, configRes] = await Promise.all([
      adminClient.from("contatos").select("*").eq("advogado_id", userId),
      adminClient.from("alertas").select("*, contatos(name, phone, demand_type)").eq("advogado_id", userId).order("created_at", { ascending: false }).limit(20),
      adminClient.from("mensagens").select("content, direction, created_at, contato_id, ai_class").order("created_at", { ascending: false }).limit(50),
      adminClient.from("relatorios").select("*").eq("advogado_id", userId).order("period_start", { ascending: false }).limit(5),
      adminClient.from("configuracoes").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    const contatos = contatosRes.data ?? [];
    const alertas = alertasRes.data ?? [];
    const mensagens = mensagensRes.data ?? [];
    const relatorios = relatoriosRes.data ?? [];

    // Build context summary
    const totalContatos = contatos.length;
    const statusCounts: Record<string, number> = {};
    const demandCounts: Record<string, number> = {};
    let totalScore = 0;

    for (const c of contatos) {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
      if (c.demand_type) demandCounts[c.demand_type] = (demandCounts[c.demand_type] || 0) + 1;
      totalScore += c.score_hot;
    }

    const avgScore = totalContatos > 0 ? (totalScore / totalContatos).toFixed(2) : "0";
    const unreadAlerts = alertas.filter((a: any) => !a.read).length;

    const topLeads = contatos
      .sort((a: any, b: any) => b.score_hot - a.score_hot)
      .slice(0, 5)
      .map((c: any) => `- ${c.name} (Score: ${Math.round(c.score_hot * 100)}%, Status: ${c.status}, Demanda: ${c.demand_type ?? "N/A"})`)
      .join("\n");

    const recentAlerts = alertas.slice(0, 5).map((a: any) => `- ${a.contatos?.name ?? "?"}: ${a.summary} (Score: ${a.score}%)`).join("\n");

    const lastReport = relatorios[0];
    const reportSummary = lastReport
      ? `Último relatório (${lastReport.period_start} a ${lastReport.period_end}): ${lastReport.reativacoes} reativações, métricas: ${JSON.stringify(lastReport.metrics_json)}`
      : "Nenhum relatório disponível.";

    const dataContext = `
DADOS DO ESCRITÓRIO (em tempo real):

📊 Resumo Geral:
- Total de contatos: ${totalContatos}
- Distribuição por status: ${JSON.stringify(statusCounts)}
- Distribuição por demanda: ${JSON.stringify(demandCounts)}
- Score médio: ${avgScore}
- Alertas não lidos: ${unreadAlerts}
- Total de mensagens recentes: ${mensagens.length}

🔥 Top 5 Leads (maior score):
${topLeads || "Nenhum lead disponível."}

🔔 Alertas Recentes:
${recentAlerts || "Nenhum alerta."}

📈 Relatórios:
${reportSummary}
`;

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
            content: `Você é Holly, a assistente de IA de um escritório de advocacia previdenciária. Você tem acesso a todos os dados do sistema e deve responder perguntas do advogado com insights acionáveis.

${dataContext}

Regras:
- Responda sempre em português brasileiro
- Seja objetiva e prática
- Use dados reais do sistema nas respostas
- Formate com markdown (negrito, listas, etc.)
- Sugira ações concretas quando relevante
- Use emojis com moderação para tornar a leitura agradável
- Se o advogado perguntar algo que não está nos dados, diga que não tem essa informação
- Nunca invente dados — use apenas o que está disponível acima`,
          },
          {
            role: "user",
            content: message,
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
    const reply = aiData.choices?.[0]?.message?.content ?? "Desculpe, não consegui processar sua pergunta.";

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("AI Assistant error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});