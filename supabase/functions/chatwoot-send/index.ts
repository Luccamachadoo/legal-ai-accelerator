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
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // User client for auth
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Admin client for DB operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's Chatwoot integration
    const { data: integration, error: intError } = await adminClient
      .from("integracoes_chatwoot")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (intError || !integration) {
      return new Response(
        JSON.stringify({ error: "Integração Chatwoot não configurada" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!integration.enabled) {
      return new Response(
        JSON.stringify({ error: "Integração Chatwoot desativada" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { contato_id, content } = await req.json();
    if (!contato_id || !content) {
      return new Response(
        JSON.stringify({ error: "contato_id e content são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the contact's phone
    const { data: contato } = await adminClient
      .from("contatos")
      .select("phone, name")
      .eq("id", contato_id)
      .eq("advogado_id", userId)
      .single();

    if (!contato) {
      return new Response(
        JSON.stringify({ error: "Contato não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const baseUrl = integration.chatwoot_base_url.replace(/\/$/, "");
    const accountId = integration.chatwoot_account_id;
    const inboxId = integration.chatwoot_inbox_id;
    const apiToken = integration.chatwoot_api_token;

    // Step 1: Search for existing contact in Chatwoot by phone
    const searchRes = await fetch(
      `${baseUrl}/api/v1/accounts/${accountId}/contacts/search?q=${encodeURIComponent(contato.phone)}`,
      {
        headers: {
          "api_access_token": apiToken,
          "Content-Type": "application/json",
        },
      }
    );
    const searchData = await searchRes.json();
    let chatwootContactId = searchData?.payload?.[0]?.id;

    // Step 2: Create contact in Chatwoot if not found
    if (!chatwootContactId) {
      const createRes = await fetch(
        `${baseUrl}/api/v1/accounts/${accountId}/contacts`,
        {
          method: "POST",
          headers: {
            "api_access_token": apiToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inbox_id: Number(inboxId),
            name: contato.name,
            phone_number: `+${contato.phone}`,
          }),
        }
      );
      const createData = await createRes.json();
      chatwootContactId = createData?.payload?.contact?.id;
    }

    if (!chatwootContactId) {
      return new Response(
        JSON.stringify({ error: "Não foi possível encontrar/criar contato no Chatwoot" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Get or create conversation
    const convSearchRes = await fetch(
      `${baseUrl}/api/v1/accounts/${accountId}/contacts/${chatwootContactId}/conversations`,
      {
        headers: {
          "api_access_token": apiToken,
          "Content-Type": "application/json",
        },
      }
    );
    const convData = await convSearchRes.json();
    let conversationId = convData?.payload?.[0]?.id;

    if (!conversationId) {
      const newConvRes = await fetch(
        `${baseUrl}/api/v1/accounts/${accountId}/conversations`,
        {
          method: "POST",
          headers: {
            "api_access_token": apiToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contact_id: chatwootContactId,
            inbox_id: Number(inboxId),
          }),
        }
      );
      const newConvData = await newConvRes.json();
      conversationId = newConvData?.id;
    }

    if (!conversationId) {
      return new Response(
        JSON.stringify({ error: "Não foi possível criar conversa no Chatwoot" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 4: Send message via Chatwoot
    const msgRes = await fetch(
      `${baseUrl}/api/v1/accounts/${accountId}/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "api_access_token": apiToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          message_type: "outgoing",
          private: false,
        }),
      }
    );

    if (!msgRes.ok) {
      const errBody = await msgRes.text();
      throw new Error(`Chatwoot API error [${msgRes.status}]: ${errBody}`);
    }

    // Step 5: Save message locally
    await adminClient.from("mensagens").insert({
      contato_id,
      content,
      direction: "out",
    });

    // Update last_msg_at
    await adminClient
      .from("contatos")
      .update({ last_msg_at: new Date().toISOString() })
      .eq("id", contato_id);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Send error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
