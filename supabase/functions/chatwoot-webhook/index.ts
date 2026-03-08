import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-chatwoot-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const event = body.event;

    if (!event) {
      return new Response(JSON.stringify({ error: "No event" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Extract account_id from payload to find which user owns this integration
    const accountId = String(body.account?.id ?? body.account_id ?? "");
    if (!accountId) {
      return new Response(JSON.stringify({ error: "No account_id in payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find the user who owns this Chatwoot account
    const { data: integration, error: intError } = await supabase
      .from("integracoes_chatwoot")
      .select("user_id, webhook_secret, enabled")
      .eq("chatwoot_account_id", accountId)
      .single();

    if (intError || !integration) {
      console.log("No integration found for account:", accountId);
      return new Response(JSON.stringify({ error: "Integration not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!integration.enabled) {
      return new Response(JSON.stringify({ skipped: true, reason: "Integration disabled" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate webhook signature if secret is configured
    if (integration.webhook_secret) {
      const signature = req.headers.get("x-chatwoot-signature");
      // Chatwoot signs with HMAC SHA256
      if (signature) {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(integration.webhook_secret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        const rawBody = JSON.stringify(body);
        const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
        const computed = Array.from(new Uint8Array(sig))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        if (computed !== signature) {
          console.warn("Invalid webhook signature");
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    const advogadoId = integration.user_id;

    // ---- Handle events ----
    if (event === "message_created") {
      await handleMessageCreated(supabase, body, advogadoId);
    } else if (event === "contact_created" || event === "contact_updated") {
      await handleContactEvent(supabase, body, advogadoId);
    } else if (event === "conversation_created") {
      await handleConversationCreated(supabase, body, advogadoId);
    }

    return new Response(JSON.stringify({ success: true, event }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleMessageCreated(
  supabase: ReturnType<typeof createClient>,
  body: Record<string, unknown>,
  advogadoId: string
) {
  const msg = body as Record<string, unknown>;
  const content = String(msg.content ?? "");
  if (!content) return;

  // Determine direction: message_type 0 = incoming, 1 = outgoing
  const messageType = Number(msg.message_type ?? 0);
  const direction = messageType === 1 ? "out" : "in";

  // Find or create the contact by phone from conversation
  const conversation = msg.conversation as Record<string, unknown> | undefined;
  const contactPayload = (conversation?.contact ?? msg.sender) as Record<string, unknown> | undefined;
  const phone = String(contactPayload?.phone_number ?? contactPayload?.identifier ?? "");

  if (!phone) {
    console.log("No phone found in message payload, skipping");
    return;
  }

  // Find existing contact
  const { data: contato } = await supabase
    .from("contatos")
    .select("id")
    .eq("advogado_id", advogadoId)
    .eq("phone", phone.replace(/\D/g, ""))
    .maybeSingle();

  let contatoId = contato?.id;

  // Create contact if not exists
  if (!contatoId) {
    const name = String(contactPayload?.name ?? "Contato Chatwoot");
    const { data: newContato } = await supabase
      .from("contatos")
      .insert({
        advogado_id: advogadoId,
        phone: phone.replace(/\D/g, ""),
        name,
        status: "novo",
        score_hot: 0,
      })
      .select("id")
      .single();
    contatoId = newContato?.id;
  }

  if (!contatoId) return;

  // Insert message
  await supabase.from("mensagens").insert({
    contato_id: contatoId,
    content,
    direction,
  });

  // Update last_msg_at
  await supabase
    .from("contatos")
    .update({ last_msg_at: new Date().toISOString() })
    .eq("id", contatoId);

  // For incoming messages, run AI classification
  if (direction === "in") {
    try {
      // Get contato details
      const { data: contatoData } = await supabase
        .from("contatos")
        .select("name, demand_type, score_hot")
        .eq("id", contatoId)
        .single();

      // Get user config
      const { data: userConfig } = await supabase
        .from("configuracoes")
        .select("*")
        .eq("user_id", advogadoId)
        .maybeSingle();

      // Get Chatwoot config for auto-reply
      const { data: cwConfig } = await supabase
        .from("integracoes_chatwoot")
        .select("*")
        .eq("user_id", advogadoId)
        .single();

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const aiRes = await fetch(`${supabaseUrl}/functions/v1/ai-secretaria`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contato_id: contatoId,
          message_content: content,
          contato_name: contatoData?.name,
          demand_type: contatoData?.demand_type,
          config: userConfig,
        }),
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const classification = aiData.classification;

        // Update message ai_class
        if (classification?.intent) {
          // Update the last inserted message with classification
          const { data: lastMsg } = await supabase
            .from("mensagens")
            .select("id")
            .eq("contato_id", contatoId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (lastMsg) {
            await supabase
              .from("mensagens")
              .update({ ai_class: classification.intent })
              .eq("id", lastMsg.id);
          }
        }

        // Update contato score and demand_type
        if (classification) {
          const currentScore = contatoData?.score_hot ?? 0;
          const newScore = Math.max(0, Math.min(1, currentScore + (classification.score_delta ?? 0)));
          const updates: Record<string, unknown> = { score_hot: newScore };
          if (classification.demand_type && classification.demand_type !== "outros") {
            updates.demand_type = classification.demand_type;
          }
          // If score is high, mark as quente
          if (newScore >= 0.6 && contatoData?.demand_type !== "fechado") {
            updates.status = "quente";
          }
          await supabase.from("contatos").update(updates).eq("id", contatoId);

          // Create alert if score is high
          if (newScore >= 0.6 && classification.summary) {
            await supabase.from("alertas").insert({
              advogado_id: advogadoId,
              contato_id: contatoId,
              score: Math.round(newScore * 100),
              summary: classification.summary,
            });
          }
        }

        // Send auto-reply via Chatwoot if available
        if (aiData.auto_response && cwConfig) {
          const baseUrl = cwConfig.chatwoot_base_url.replace(/\/$/, "");
          const accountId = cwConfig.chatwoot_account_id;
          const apiToken = cwConfig.chatwoot_api_token;

          // Find conversation in Chatwoot
          const convId = (msg.conversation as Record<string, unknown>)?.id;
          if (convId) {
            await fetch(
              `${baseUrl}/api/v1/accounts/${accountId}/conversations/${convId}/messages`,
              {
                method: "POST",
                headers: {
                  api_access_token: apiToken,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  content: aiData.auto_response,
                  message_type: "outgoing",
                  private: false,
                }),
              }
            );

            // Save auto-reply locally
            await supabase.from("mensagens").insert({
              contato_id: contatoId,
              content: aiData.auto_response,
              direction: "out",
              ai_class: "auto_reply",
            });
          }
        }
      }
    } catch (aiErr) {
      console.error("AI classification failed (non-blocking):", aiErr);
      // Non-blocking: message is already saved even if AI fails
    }
  }

async function handleContactEvent(
  supabase: ReturnType<typeof createClient>,
  body: Record<string, unknown>,
  advogadoId: string
) {
  const contact = body as Record<string, unknown>;
  const phone = String(contact.phone_number ?? "").replace(/\D/g, "");
  if (!phone) return;

  const name = String(contact.name ?? "Contato Chatwoot");

  // Upsert: find existing or create
  const { data: existing } = await supabase
    .from("contatos")
    .select("id")
    .eq("advogado_id", advogadoId)
    .eq("phone", phone)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("contatos")
      .update({ name })
      .eq("id", existing.id);
  } else {
    await supabase.from("contatos").insert({
      advogado_id: advogadoId,
      phone,
      name,
      status: "novo",
      score_hot: 0,
    });
  }
}

async function handleConversationCreated(
  supabase: ReturnType<typeof createClient>,
  body: Record<string, unknown>,
  advogadoId: string
) {
  const conversation = body as Record<string, unknown>;
  const meta = conversation.meta as Record<string, unknown> | undefined;
  const sender = meta?.sender as Record<string, unknown> | undefined;
  const phone = String(sender?.phone_number ?? "").replace(/\D/g, "");
  if (!phone) return;

  const name = String(sender?.name ?? "Contato Chatwoot");

  // Create contact if not exists
  const { data: existing } = await supabase
    .from("contatos")
    .select("id")
    .eq("advogado_id", advogadoId)
    .eq("phone", phone)
    .maybeSingle();

  if (!existing) {
    await supabase.from("contatos").insert({
      advogado_id: advogadoId,
      phone,
      name,
      status: "novo",
      score_hot: 0,
    });
  }
}
