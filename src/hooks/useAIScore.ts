import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useCalculateScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contato_id: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-score`,
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
      if (!res.ok) throw new Error(data.error ?? "Erro ao calcular score");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contatos"] });
      queryClient.invalidateQueries({ queryKey: ["contatos-stats"] });
    },
    onError: (err) => {
      toast.error("Erro: " + (err as Error).message);
    },
  });
}