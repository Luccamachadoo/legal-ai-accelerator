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

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Gather data
    const [contatosRes, alertasRes, mensagensRes, relatoriosRes] = await Promise.all([
      adminClient.from("contatos").select("*").eq("advogado_id", user.id),
      adminClient.from("alertas").select("*, contatos(name, demand_type)").eq("advogado_id", user.id).order("created_at", { ascending: false }).limit(20),
      adminClient.from("mensagens").select("content, direction, created_at, ai_class").order("created_at", { ascending: false }).limit(100),
      adminClient.from("relatorios").select("*").eq("advogado_id", user.id).order("period_start", { ascending: false }).limit(3),
    ]);

    const contatos = contatosRes.data ?? [];
    const alertas = alertasRes.data ?? [];
    const mensagens = mensagensRes.data ?? [];
    const relatorios = relatoriosRes.data ?? [];

    const statusCounts: Record<string, number> = {};
    const demandCounts: Record<string, number> = {};
    for (const c of contatos) {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
      if (c.demand_type) demandCounts[c.demand_type] = (demandCounts[c.demand_type] || 0) + 1;
    }

    const topLeads = contatos
      .sort((a: any, b: any) => b.score_hot - a.score_hot)
      .slice(0, 10)
      .map((c: any) => `${c.name}: score ${Math.round(c.score_hot * 100)}%, status ${c.status}, demanda ${c.demand_type ?? "N/A"}, último contato: ${c.last_msg_at ?? c.created_at}`)
      .join("\n");

    const recentAlerts = alertas.slice(0, 10).map((a: any) => `${a.contatos?.name ?? "?"}: ${a.summary}`).join("\n");
    const prevReport = relatorios[0] ? JSON.stringify(relatorios[0].metrics_json) : "N/A";

    const dataContext = `
Total contatos: ${contatos.length}
Status: ${JSON.stringify(statusCounts)}
Demandas: ${JSON.stringify(demandCounts)}
Mensagens recentes: ${mensagens.length}
Alertas não lidos: ${alertas.filter((a: any) => !a.read).length}

Top Leads:
${topLeads}

Alertas recentes:
${recentAlerts}

Último relatório: ${prevReport}
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
            content: `Você é Holly AI, assistente de um escritório de advocacia previdenciária. Gere um relatório semanal inteligente com base nos dados abaixo.

${dataContext}

O relatório deve conter:
1. **Resumo Executivo** — Parágrafo curto com os destaques da semana
2. **Leads Prioritários** — Os 3-5 contatos que merecem ação imediata e por quê
3. **Oportunidades** — Padrões identificados e oportunidades de conversão
4. **Alertas e Riscos** — Contatos que podem ser perdidos se não houver ação
5. **Recomendações** — 3-5 ações concretas para a próxima semana
6. **Métricas-Chave** — Números importantes em formato de lista

Use markdown. Seja direto e acionável. Use emojis com moderação.`,
          },
          {
            role: "user",
            content: "Gere o relatório inteligente semanal.",
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${await aiResponse.text()}`);
    }

    const aiData = await aiResponse.json();
    const report = aiData.choices?.[0]?.message?.content ?? "Erro ao gerar relatório.";

    return new Response(
      JSON.stringify({ report }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("AI Report error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});