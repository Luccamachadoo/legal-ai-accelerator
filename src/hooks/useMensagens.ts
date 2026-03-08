import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type Mensagem = Database["public"]["Tables"]["mensagens"]["Row"];

export function useMensagens(contatoId: string | null) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["mensagens", contatoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mensagens")
        .select("*")
        .eq("contato_id", contatoId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Mensagem[];
    },
    enabled: !!user && !!contatoId,
  });
}
