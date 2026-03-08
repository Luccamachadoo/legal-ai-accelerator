import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, TrendingUp, Users, RefreshCw, AlertTriangle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const monthlyData = [
  { semana: "S1", reativacoes: 8, novos: 22, fechados: 3 },
  { semana: "S2", reativacoes: 12, novos: 28, fechados: 5 },
  { semana: "S3", reativacoes: 15, novos: 18, fechados: 7 },
  { semana: "S4", reativacoes: 10, novos: 25, fechados: 6 },
];

const kpis = [
  { title: "Taxa Reativação", value: "22%", target: ">20%", met: true, icon: RefreshCw },
  { title: "Tempo Resposta (P95)", value: "3.2min", target: "<5min", met: true, icon: TrendingUp },
  { title: "Leads Quentes/Dia", value: "12%", target: ">10%", met: true, icon: Users },
  { title: "Vazamentos Detectados", value: "14", target: "—", met: false, icon: AlertTriangle },
];

export default function Relatorios() {
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
            Consolidado de performance — Período de 30 dias
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Mar 2026
          </Button>
          <Button size="sm" className="holly-gradient border-0 text-primary-foreground hover:opacity-90">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export PDF
          </Button>
        </div>
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
                  {kpi.met ? "✓ Meta" : "Atenção"}
                </Badge>
              </div>
              <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.title}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5">Meta: {kpi.target}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="holly-card-shadow border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Evolução Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                <XAxis dataKey="semana" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(220, 15%, 90%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="novos" stroke="hsl(210, 80%, 55%)" strokeWidth={2} name="Novos" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="reativacoes" stroke="hsl(40, 80%, 50%)" strokeWidth={2} name="Reativações" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="fechados" stroke="hsl(152, 60%, 42%)" strokeWidth={2} name="Fechados" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostics */}
      <Card className="holly-card-shadow border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Diagnóstico de Vazamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: "Leads sem resposta >24h", count: 6, severity: "alta" },
              { label: "Triagem incompleta", count: 4, severity: "média" },
              { label: "Retomada sem retorno (3 tentativas)", count: 3, severity: "baixa" },
              { label: "Opt-out antes de contato", count: 1, severity: "baixa" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      item.severity === "alta"
                        ? "bg-destructive"
                        : item.severity === "média"
                        ? "bg-holly-warning"
                        : "bg-muted-foreground"
                    }`}
                  />
                  <span className="text-sm">{item.label}</span>
                </div>
                <Badge variant="secondary">{item.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
