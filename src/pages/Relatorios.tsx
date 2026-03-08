import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, TrendingUp, Users, RefreshCw, AlertTriangle, Inbox } from "lucide-react";
import { useRelatorios, useContatosStats } from "@/hooks/useData";

export default function Relatorios() {
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
        <Button size="sm" className="holly-gradient border-0 text-primary-foreground hover:opacity-90">
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
                  <Button variant="outline" size="sm">
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
