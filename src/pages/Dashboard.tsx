import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  Flame,
  Clock,
  Inbox,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useContatosStats, useMensagensCount, useAlertas } from "@/hooks/useData";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const demandLabels: Record<string, string> = {
  aposentadoria: "Aposentadoria",
  inss: "INSS",
  bpc_loas: "BPC/LOAS",
  revisao: "Revisão",
  outros: "Outros",
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useContatosStats();
  const { data: msgCount } = useMensagensCount();
  const { data: alertas } = useAlertas();

  const hotAlerts = (alertas ?? []).filter((a) => !a.read).slice(0, 4);

  const kpis = [
    {
      title: "Contatos Ativos",
      value: stats?.total ?? 0,
      icon: Users,
      description: "total no funil",
    },
    {
      title: "Mensagens Hoje",
      value: msgCount ?? 0,
      icon: MessageSquare,
      description: "triadas pelo agente",
    },
    {
      title: "Reativações",
      value: stats?.reativados ?? 0,
      icon: RefreshCw,
      description: "contatos reativados",
    },
    {
      title: "Taxa Conversão",
      value: stats?.total
        ? `${Math.round(((stats.fechados ?? 0) / stats.total) * 100)}%`
        : "0%",
      icon: TrendingUp,
      description: "leads → fechados",
    },
  ];

  const demandData = stats?.demandData ?? [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-display font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Protocolo de Dupla Ação — Visão geral do funil
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((stat) => (
          <Card key={stat.title} className="holly-card-shadow border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status Distribution - simple bars */}
        <Card className="lg:col-span-2 holly-card-shadow border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">Carregando...</div>
            ) : (
              <div className="space-y-3 py-4">
                {[
                  { label: "Novos", value: (stats?.contatos ?? []).filter((c) => c.status === "novo").length, color: "bg-holly-info" },
                  { label: "Quentes", value: stats?.quentes ?? 0, color: "bg-primary" },
                  { label: "Esfriados", value: stats?.esfriados ?? 0, color: "bg-muted-foreground" },
                  { label: "Reativados", value: stats?.reativados ?? 0, color: "bg-holly-success" },
                  { label: "Fechados", value: stats?.fechados ?? 0, color: "bg-foreground" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="text-sm w-24 text-muted-foreground">{s.label}</span>
                    <div className="flex-1 h-6 bg-muted rounded-md overflow-hidden">
                      <div
                        className={`h-full ${s.color} rounded-md transition-all`}
                        style={{ width: `${stats?.total ? (s.value / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demand Distribution */}
        <Card className="holly-card-shadow border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Demandas</CardTitle>
          </CardHeader>
          <CardContent>
            {demandData.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                <Inbox className="h-8 w-8" />
                Sem dados ainda
              </div>
            ) : (
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demandData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" />
                    <YAxis type="category" dataKey="tipo" tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" width={80} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(220, 15%, 90%)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="qtd" fill="hsl(40, 80%, 50%)" radius={[0, 4, 4, 0]} name="Quantidade" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Alerts */}
      <motion.div variants={item}>
        <Card className="holly-card-shadow border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Leads Quentes</CardTitle>
              {hotAlerts.length > 0 && (
                <Badge variant="outline" className="text-primary border-primary/30 text-xs">
                  <Flame className="h-3 w-3 mr-1" />
                  {hotAlerts.length} pendentes
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {hotAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm gap-2">
                <Inbox className="h-8 w-8" />
                Nenhum alerta pendente
              </div>
            ) : (
              <div className="space-y-3">
                {hotAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {(alert.contatos?.name ?? "??").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{alert.contatos?.name ?? "Contato"}</p>
                        <p className="text-xs text-muted-foreground">
                          {demandLabels[alert.contatos?.demand_type ?? ""] ?? alert.contatos?.demand_type ?? "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">
                          {alert.score}%
                        </p>
                        <p className="text-[11px] text-muted-foreground">score</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: ptBR })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
