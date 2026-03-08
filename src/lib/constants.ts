import type { Database } from "@/integrations/supabase/types";

type ContatoStatus = Database["public"]["Enums"]["contato_status"];
type DemandType = Database["public"]["Enums"]["demand_type"];

export const demandLabels: Record<string, string> = {
  aposentadoria: "Aposentadoria",
  inss: "INSS",
  bpc_loas: "BPC/LOAS",
  revisao: "Revisão",
  outros: "Outros",
};

export const statusConfig: Record<ContatoStatus, { label: string; className: string }> = {
  novo: { label: "Novo", className: "bg-holly-info/10 text-holly-info border-holly-info/30" },
  quente: { label: "Quente", className: "bg-primary/10 text-primary border-primary/30" },
  esfriado: { label: "Esfriado", className: "bg-muted text-muted-foreground border-border" },
  reativado: { label: "Reativado", className: "bg-holly-success/10 text-holly-success border-holly-success/30" },
  fechado: { label: "Fechado", className: "bg-holly-navy/10 text-foreground border-border" },
};

export const PAGE_SIZE = 25;
