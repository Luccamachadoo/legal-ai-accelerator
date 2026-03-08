import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Client as the user (to verify identity)
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Admin client for deletion operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Delete in order: mensagens (via contatos), alertas, contatos, configuracoes, relatorios, profiles
    // 1. Get user's contato IDs
    const { data: contatos } = await adminClient
      .from("contatos")
      .select("id")
      .eq("advogado_id", userId);

    const contatoIds = (contatos ?? []).map((c: any) => c.id);

    if (contatoIds.length > 0) {
      // 2. Delete mensagens for those contatos
      await adminClient.from("mensagens").delete().in("contato_id", contatoIds);
      // 3. Delete alertas
      await adminClient.from("alertas").delete().eq("advogado_id", userId);
      // 4. Delete contatos
      await adminClient.from("contatos").delete().eq("advogado_id", userId);
    }

    // 5. Delete configuracoes
    await adminClient.from("configuracoes").delete().eq("user_id", userId);
    // 6. Delete relatorios
    await adminClient.from("relatorios").delete().eq("advogado_id", userId);
    // 7. Delete profile
    await adminClient.from("profiles").delete().eq("user_id", userId);

    // 8. Delete avatar files from storage
    const { data: avatarFiles } = await adminClient.storage
      .from("avatars")
      .list(userId);
    if (avatarFiles && avatarFiles.length > 0) {
      await adminClient.storage
        .from("avatars")
        .remove(avatarFiles.map((f: any) => `${userId}/${f.name}`));
    }

    // 9. Delete auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      throw new Error(`Failed to delete auth user: ${deleteError.message}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
