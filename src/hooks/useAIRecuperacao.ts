import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RecoveryResult {
  message: string;
  contato_name: string;
  demand_type: string;
  days_since_contact: number;
}

export function useGenerateRecoveryMessage() {
  return useMutation({
    mutationFn: async (contato_id: string): Promise<RecoveryResult> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/ai-recuperacao`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ contato_id }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao gerar mensagem");
      return data as RecoveryResult;
    },
    onError: (err) => {
      toast.error("Erro: " + (err as Error).message);
    },
  });
}
