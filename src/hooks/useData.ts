import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type Contato = Database["public"]["Tables"]["contatos"]["Row"];
type ContatoInsert = Database["public"]["Tables"]["contatos"]["Insert"];
type Alerta = Database["public"]["Tables"]["alertas"]["Row"] & {
  contatos?: { name: string; phone: string; demand_type: string | null } | null;
};

export function useContatos(statusFilter?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["contatos", user?.id, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("contatos")
        .select("*")
        .order("last_msg_at", { ascending: false });

      if (statusFilter && statusFilter !== "todos") {
        query = query.eq("status", statusFilter as Contato["status"]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Contato[];
    },
    enabled: !!user,
  });
}

export function useContatosStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["contatos-stats", user?.id],
    queryFn: async () => {
      const { data: contatos, error } = await supabase
        .from("contatos")
        .select("status, score_hot, demand_type, created_at, last_msg_at");
      if (error) throw error;

      const total = contatos.length;
      const quentes = contatos.filter((c) => c.score_hot >= 0.8).length;
      const esfriados = contatos.filter((c) => c.status === "esfriado").length;
      const reativados = contatos.filter((c) => c.status === "reativado").length;
      const fechados = contatos.filter((c) => c.status === "fechado").length;

      // Demand distribution
      const demandCounts: Record<string, number> = {};
      contatos.forEach((c) => {
        const key = c.demand_type ?? "outros";
        demandCounts[key] = (demandCounts[key] || 0) + 1;
      });

      const demandLabels: Record<string, string> = {
        aposentadoria: "Aposentadoria",
        inss: "INSS",
        bpc_loas: "BPC/LOAS",
        revisao: "Revisão",
        outros: "Outros",
      };

      const demandData = Object.entries(demandCounts).map(([key, qtd]) => ({
        tipo: demandLabels[key] || key,
        qtd,
      }));

      return { total, quentes, esfriados, reativados, fechados, demandData, contatos };
    },
    enabled: !!user,
  });
}

export function useAlertas() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["alertas", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alertas")
        .select("*, contatos(name, phone, demand_type)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Alerta[];
    },
    enabled: !!user,
  });
}

export function useMarkAlertaRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("alertas")
        .update({ read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alertas"] }),
  });
}

export function useMensagensCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["mensagens-count-today", user?.id],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from("mensagens")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
  });
}

export function useRelatorios() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["relatorios", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("relatorios")
        .select("*")
        .order("period_start", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useUnreadAlertasCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["alertas-unread-count", user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("alertas")
        .select("*", { count: "exact", head: true })
        .eq("read", false);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user,
  });
}
