import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Clock, MessageSquare, CheckCircle, Phone, Inbox } from "lucide-react";
import { useAlertas, useMarkAlertaRead } from "@/hooks/useData";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const demandLabels: Record<string, string> = {
  aposentadoria: "Aposentadoria",
  inss: "INSS",
  bpc_loas: "BPC/LOAS",
  revisao: "Revisão",
  outros: "Outros",
};

export default function Alertas() {
  const { data: alertas, isLoading } = useAlertas();
  const markRead = useMarkAlertaRead();

  const unread = (alertas ?? []).filter((a) => !a.read).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Alertas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Leads quentes que precisam da sua atenção
          </p>
        </div>
        {unread > 0 && (
          <Badge className="holly-gradient border-0 text-primary-foreground">
            <Flame className="h-3 w-3 mr-1" />
            {unread} novos
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
          Carregando...
        </div>
      ) : (alertas ?? []).length === 0 ? (
        <Card className="holly-card-shadow border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm gap-2">
            <Inbox className="h-8 w-8" />
            Nenhum alerta ainda
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(alertas ?? []).map((alerta, i) => (
            <motion.div
              key={alerta.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
            >
              <Card
                className={`holly-card-shadow border-border/50 transition-all ${
                  !alerta.read ? "border-l-2 border-l-primary" : ""
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {(alerta.contatos?.name ?? "??").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm">{alerta.contatos?.name ?? "Contato"}</h3>
                          <Badge variant="outline" className="text-[11px] bg-primary/10 text-primary border-primary/30">
                            {alerta.score}% score
                          </Badge>
                          {!alerta.read && (
                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse-gold" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {demandLabels[alerta.contatos?.demand_type ?? ""] ?? "—"}
                        </p>
                        <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{alerta.summary}</p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(alerta.created_at), { addSuffix: true, locale: ptBR })}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button size="sm" className="holly-gradient border-0 text-primary-foreground hover:opacity-90">
                        <Phone className="h-3.5 w-3.5 mr-1.5" />
                        Ligar
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                        WhatsApp
                      </Button>
                      {!alerta.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground"
                          onClick={() => markRead.mutate(alerta.id)}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          Resolver
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
