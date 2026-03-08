import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ChatwootConfig {
  id: string;
  user_id: string;
  chatwoot_base_url: string;
  chatwoot_api_token: string;
  chatwoot_account_id: string;
  chatwoot_inbox_id: string;
  webhook_secret: string;
  enabled: boolean;
}

export function useChatwootConfig() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["chatwoot-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("integracoes_chatwoot")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as ChatwootConfig | null;
    },
    enabled: !!user,
  });
}

export function useSaveChatwootConfig() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (config: Omit<ChatwootConfig, "id" | "user_id">) => {
      const { data: existing } = await supabase
        .from("integracoes_chatwoot")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("integracoes_chatwoot")
          .update(config)
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("integracoes_chatwoot")
          .insert({ ...config, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chatwoot-config"] });
      toast.success("Configuração Chatwoot salva!");
    },
    onError: (err) => {
      toast.error("Erro ao salvar: " + (err as Error).message);
    },
  });
}

export function useSendChatwootMessage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ contato_id, content }: { contato_id: string; content: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/chatwoot-send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ contato_id, content }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao enviar");
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["mensagens", vars.contato_id] });
    },
    onError: (err) => {
      toast.error("Erro ao enviar: " + (err as Error).message);
    },
  });
}
