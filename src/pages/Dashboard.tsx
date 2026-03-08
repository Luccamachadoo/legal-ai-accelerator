import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Clock,
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

const stats = [
  {
    title: "Contatos Ativos",
    value: "247",
    change: "+12%",
    positive: true,
    icon: Users,
    description: "vs. semana anterior",
  },
  {
    title: "Mensagens Hoje",
    value: "89",
    change: "+23%",
    positive: true,
    icon: MessageSquare,
    description: "triadas pelo agente",
  },
  {
    title: "Reativações",
    value: "34",
    change: "+8%",
    positive: true,
    icon: RefreshCw,
    description: "últimos 30 dias",
  },
  {
    title: "Taxa de Conversão",
    value: "22%",
    change: "-2%",
    positive: false,
    icon: TrendingUp,
    description: "leads → consultas",
  },
];

const funnelData = [
  { name: "Seg", entrantes: 18, triados: 15, quentes: 6, reativados: 3 },
  { name: "Ter", entrantes: 22, triados: 19, quentes: 8, reativados: 5 },
  { name: "Qua", entrantes: 15, triados: 13, quentes: 5, reativados: 2 },
  { name: "Qui", entrantes: 28, triados: 24, quentes: 10, reativados: 7 },
  { name: "Sex", entrantes: 20, triados: 18, quentes: 7, reativados: 4 },
  { name: "Sáb", entrantes: 8, triados: 7, quentes: 3, reativados: 1 },
  { name: "Dom", entrantes: 5, triados: 4, quentes: 2, reativados: 1 },
];

const demandData = [
  { tipo: "Aposentadoria", qtd: 42 },
  { tipo: "INSS", qtd: 38 },
  { tipo: "BPC/LOAS", qtd: 22 },
  { tipo: "Revisão", qtd: 15 },
  { tipo: "Outros", qtd: 8 },
];

const recentAlerts = [
  { name: "Maria Santos", demand: "Aposentadoria", score: 0.92, time: "2min" },
  { name: "João Costa", demand: "INSS", score: 0.87, time: "15min" },
  { name: "Ana Oliveira", demand: "BPC/LOAS", score: 0.85, time: "32min" },
  { name: "Carlos Lima", demand: "Revisão", score: 0.81, time: "1h" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Dashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-display font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Protocolo de Dupla Ação — Visão geral do funil
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="holly-card-shadow border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    stat.positive ? "text-holly-success" : "text-destructive"
                  }`}
                >
                  {stat.positive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.title}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Funnel Chart */}
        <Card className="lg:col-span-2 holly-card-shadow border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Funil Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={funnelData}>
                  <defs>
                    <linearGradient id="colorEntrantes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(210, 80%, 55%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(210, 80%, 55%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorQuentes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(40, 80%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(40, 80%, 50%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorReativados" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 15%, 90%)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="entrantes"
                    stroke="hsl(210, 80%, 55%)"
                    fill="url(#colorEntrantes)"
                    strokeWidth={2}
                    name="Entrantes"
                  />
                  <Area
                    type="monotone"
                    dataKey="quentes"
                    stroke="hsl(40, 80%, 50%)"
                    fill="url(#colorQuentes)"
                    strokeWidth={2}
                    name="Quentes"
                  />
                  <Area
                    type="monotone"
                    dataKey="reativados"
                    stroke="hsl(152, 60%, 42%)"
                    fill="url(#colorReativados)"
                    strokeWidth={2}
                    name="Reativados"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Demand Distribution */}
        <Card className="holly-card-shadow border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Demandas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demandData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" />
                  <YAxis
                    type="category"
                    dataKey="tipo"
                    tick={{ fontSize: 11 }}
                    stroke="hsl(220, 10%, 46%)"
                    width={80}
                  />
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
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Alerts */}
      <motion.div variants={item}>
        <Card className="holly-card-shadow border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Leads Quentes</CardTitle>
              <Badge variant="outline" className="text-primary border-primary/30 text-xs">
                <Flame className="h-3 w-3 mr-1" />
                {recentAlerts.length} pendentes
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">
                        {alert.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{alert.name}</p>
                      <p className="text-xs text-muted-foreground">{alert.demand}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">
                        {Math.round(alert.score * 100)}%
                      </p>
                      <p className="text-[11px] text-muted-foreground">score</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {alert.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
