import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, TrendingUp, Users, RefreshCw, AlertTriangle, Inbox } from "lucide-react";
import { useRelatorios, useContatosStats } from "@/hooks/useData";
import { toast } from "sonner";

export default function Relatorios() {
  useEffect(() => { document.title = "Relatórios — Holly AI"; }, []);
  const { data: relatorios, isLoading } = useRelatorios();
  const { data: stats } = useContatosStats();

  const total = stats?.total ?? 0;
  const reativados = stats?.reativados ?? 0;
  const taxaReativacao = total > 0 ? Math.round((reativados / total) * 100) : 0;

  const kpis = [
    { title: "Taxa Reativação", value: `${taxaReativacao}%`, target: ">20%", met: taxaReativacao >= 20, icon: RefreshCw },
    { title: "Contatos Ativos", value: `${total}`, target: "—", met: true, icon: Users },
    { title: "Reativados", value: `${reativados}`, target: "—", met: reativados > 0, icon: TrendingUp },
    { title: "Esfriados", value: `${stats?.esfriados ?? 0}`, target: "—", met: false, icon: AlertTriangle },
  ];

  const exportPDF = () => {
    // Generate a simple printable report
    const w = window.open("", "_blank");
    if (!w) {
      toast.error("Pop-up bloqueado. Permita pop-ups para exportar.");
      return;
    }

    const contatos = stats?.contatos ?? [];
    const statusCounts = {
      novo: contatos.filter((c) => c.status === "novo").length,
      quente: (stats?.quentes ?? 0),
      esfriado: (stats?.esfriados ?? 0),
      reativado: (stats?.reativados ?? 0),
      fechado: (stats?.fechados ?? 0),
    };

    w.document.write(`<!DOCTYPE html><html><head><title>Relatório Holly AI</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 24px; margin-bottom: 4px; }
        .subtitle { color: #666; font-size: 14px; margin-bottom: 32px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        .kpi { border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; }
        .kpi-value { font-size: 28px; font-weight: 700; }
        .kpi-label { font-size: 12px; color: #666; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #e5e5e5; font-size: 13px; }
        th { font-weight: 600; background: #f9f9f9; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #999; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <h1>Relatório de Performance — Holly AI</h1>
      <p class="subtitle">Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-value">${taxaReativacao}%</div><div class="kpi-label">Taxa Reativação</div></div>
        <div class="kpi"><div class="kpi-value">${total}</div><div class="kpi-label">Contatos Ativos</div></div>
        <div class="kpi"><div class="kpi-value">${reativados}</div><div class="kpi-label">Reativados</div></div>
        <div class="kpi"><div class="kpi-value">${stats?.esfriados ?? 0}</div><div class="kpi-label">Esfriados</div></div>
      </div>
      <h2 style="font-size:16px;margin-bottom:8px;">Distribuição por Status</h2>
      <table>
        <thead><tr><th>Status</th><th>Quantidade</th><th>%</th></tr></thead>
        <tbody>
          ${Object.entries(statusCounts).map(([k, v]) =>
            `<tr><td>${k.charAt(0).toUpperCase() + k.slice(1)}</td><td>${v}</td><td>${total > 0 ? Math.round((v / total) * 100) : 0}%</td></tr>`
          ).join("")}
        </tbody>
      </table>
      <div class="footer">Holly AI — Protocolo de Dupla Atuação HOLLY™ • Este relatório é confidencial.</div>
      <script>window.print();</script>
    </body></html>`);
    w.document.close();
    toast.success("Relatório gerado! Use Ctrl+P para salvar como PDF.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Consolidado de performance
          </p>
        </div>
        <Button
          size="sm"
          className="holly-gradient border-0 text-primary-foreground hover:opacity-90"
          onClick={exportPDF}
        >
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Export PDF
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="holly-card-shadow border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <kpi.icon className="h-5 w-5 text-primary" />
                </div>
                <Badge
                  variant="outline"
                  className={
                    kpi.met
                      ? "bg-holly-success/10 text-holly-success border-holly-success/30"
                      : "bg-holly-warning/10 text-holly-warning border-holly-warning/30"
                  }
                >
                  {kpi.met ? "✓ OK" : "Atenção"}
                </Badge>
              </div>
              <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.title}</p>
              {kpi.target !== "—" && (
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">Meta: {kpi.target}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Smart Report */}
      <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} initial="hidden" animate="show">
        <Card className="holly-card-shadow border-primary/20">
          <CardHeader className="pb-3 border-b border-border/50 bg-primary/5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Análise Inteligente da Semana</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {aiLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Gerando relatório inteligente...</span>
              </div>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-semibold prose-a:text-primary">
                {aiReport ? (
                  <ReactMarkdown>{aiReport}</ReactMarkdown>
                ) : (
                  <p>Não foi possível gerar a análise inteligente no momento.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Relatórios salvos */}
      <Card className="holly-card-shadow border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Relatórios Gerados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground text-sm">Carregando...</div>
          ) : (relatorios ?? []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm gap-2">
              <Inbox className="h-8 w-8" />
              Nenhum relatório gerado ainda.
              <p className="text-xs">Relatórios serão gerados automaticamente ao final do período de 30 dias.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(relatorios ?? []).map((rel) => (
                <div key={rel.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(rel.period_start).toLocaleDateString("pt-BR")} — {new Date(rel.period_end).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-xs text-muted-foreground">{rel.reativacoes} reativações</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={exportPDF}>
                    <Download className="h-3.5 w-3.5 mr-1" />
                    PDF
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
