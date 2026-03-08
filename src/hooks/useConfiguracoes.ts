import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Configuracoes {
  id: string;
  user_id: string;
  secretaria_tom: string;
  secretaria_template_boas_vindas: string;
  secretaria_resposta_auto: boolean;
  secretaria_horario_comercial: boolean;
  recuperacao_timing_dias: number[];
  recuperacao_template_d2: string;
  recuperacao_max_tentativas: number;
  recuperacao_opt_out_auto: boolean;
  lgpd_anonimizacao: boolean;
  lgpd_consentimento: boolean;
  lgpd_auditoria: boolean;
}

const DEFAULTS: Omit<Configuracoes, "id" | "user_id"> = {
  secretaria_tom: "Profissional e acolhedor",
  secretaria_template_boas_vindas:
    "Olá! Sou a assistente virtual do Dr. [Nome]. Como posso ajudá-lo(a) com seu benefício previdenciário?",
  secretaria_resposta_auto: true,
  secretaria_horario_comercial: false,
  recuperacao_timing_dias: [2, 5, 10],
  recuperacao_template_d2:
    "Olá [Nome]! Vi que conversamos sobre [demanda] há alguns dias. Ainda posso ajudá-lo(a) com essa questão?",
  recuperacao_max_tentativas: 3,
  recuperacao_opt_out_auto: true,
  lgpd_anonimizacao: true,
  lgpd_consentimento: true,
  lgpd_auditoria: true,
};

export function useConfiguracoes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["configuracoes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("configuracoes")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      if (data) return data as unknown as Configuracoes;
      // Create default config for user
      const { data: created, error: insertError } = await supabase
        .from("configuracoes")
        .insert({ user_id: user!.id } as any)
        .select()
        .single();
      if (insertError) throw insertError;
      return created as unknown as Configuracoes;
    },
    enabled: !!user,
  });
}

export function useSaveConfiguracoes() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (updates: Partial<Omit<Configuracoes, "id" | "user_id">>) => {
      const { error } = await supabase
        .from("configuracoes")
        .update(updates as any)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracoes"] });
      toast.success("Configurações salvas!");
    },
    onError: () => {
      toast.error("Erro ao salvar configurações.");
    },
  });
}
