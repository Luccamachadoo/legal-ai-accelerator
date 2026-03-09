import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  Flame,
  Clock,
  Inbox,
  Rocket,
  Settings,
  Phone,
  CheckCircle2,
} from "lucide-react";
import {
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
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

import { demandLabels } from "@/lib/constants";

function OnboardingCard() {
  const navigate = useNavigate();

  const steps = [
    { label: "Configure seu perfil", href: "/perfil", icon: Users, done: false },
    { label: "Ajuste os agentes", href: "/configuracoes", icon: Settings, done: false },
    { label: "Conecte seu WhatsApp", href: "#", icon: Phone, done: false },
  ];

  return (
    <Card className="holly-card-shadow border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Rocket className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Bem-vindo ao Holly AI!</CardTitle>
            <p className="text-sm text-muted-foreground">Complete a configuração para começar a operar</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <button
              key={i}
              onClick={() => step.href !== "#" && navigate(step.href)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-background border border-border/50 hover:border-primary/30 transition-colors text-left"
            >
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <step.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">{step.label}</span>
              <span className="ml-auto text-xs text-muted-foreground">Pendente</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  useEffect(() => { document.title = "Dashboard — Holly AI"; }, []);
  const { data: stats, isLoading: statsLoading } = useContatosStats();
  const { data: msgCount } = useMensagensCount();
  const { data: alertas } = useAlertas();

  const hotAlerts = (alertas ?? []).filter((a) => !a.read).slice(0, 4);
  const isEmpty = !statsLoading && (stats?.total ?? 0) === 0;

  const totalContatos = 78;
  const taxaConversao = 21;

  const kpis = [
    {
      title: "Contatos Ativos",
      value: totalContatos,
      icon: Users,
      description: "total no funil",
    },
    {
      title: "Mensagens Hoje",
      value: 67,
      icon: MessageSquare,
      description: "triadas pelo agente",
    },
    {
      title: "Reativações",
      value: 12,
      icon: RefreshCw,
      description: "contatos reativados",
    },
    {
      title: "Taxa Conversão",
      value: `${taxaConversao}%`,
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

      {/* Onboarding when empty */}
      {isEmpty && (
        <motion.div variants={item}>
          <OnboardingCard />
        </motion.div>
      )}

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
        <Card className="lg:col-span-2 holly-card-shadow border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Funil de Conversão Interativo</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">Carregando...</div>
            ) : isEmpty ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                <Inbox className="h-8 w-8" />
                <p>Nenhum contato ainda</p>
                <p className="text-xs">Os dados aparecerão aqui quando o protocolo começar a operar</p>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {[
                  { label: "Novos", value: (stats?.contatos ?? []).filter((c) => c.status === "novo").length, color: "bg-holly-info", desc: "Leads que acabaram de chegar" },
                  { label: "Quentes", value: stats?.quentes ?? 0, color: "bg-primary", desc: "Alto score, prontos para ação" },
                  { label: "Esfriados", value: stats?.esfriados ?? 0, color: "bg-muted-foreground", desc: "Aguardando recuperação automática" },
                  { label: "Reativados", value: stats?.reativados ?? 0, color: "bg-holly-success", desc: "Recuperados pela IA, atenção!" },
                  { label: "Fechados", value: stats?.fechados ?? 0, color: "bg-foreground", desc: "Contratos assinados" },
                ].map((s) => (
                  <div key={s.label} className="group relative flex items-center gap-4 cursor-default">
                    <div className="w-28 text-right">
                      <span className="text-sm font-medium text-foreground">{s.label}</span>
                      <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                    </div>
                    <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden relative">
                      <div
                        className={`h-full ${s.color} rounded-md transition-all duration-1000 ease-out group-hover:brightness-110`}
                        style={{ width: `${stats?.total ? (s.value / stats.total) * 100 : 0}%` }}
                      />
                      <div className="absolute inset-y-0 left-3 flex items-center">
                        <span className="text-xs font-bold text-white drop-shadow-md">{stats?.total ? Math.round((s.value / stats.total) * 100) : 0}%</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold w-12 text-right">{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                    <YAxis type="category" dataKey="tipo" tick={{ fontSize: 11 }} className="fill-muted-foreground" width={80} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Bar dataKey="qtd" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Quantidade" />
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
                {isEmpty ? (
                  <>
                    <p>Aguardando os primeiros contatos</p>
                    <p className="text-xs">Alertas de leads quentes aparecerão aqui automaticamente</p>
                  </>
                ) : (
                  <p>Nenhum alerta pendente</p>
                )}
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
