import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Clock, MessageSquare, CheckCircle, Phone } from "lucide-react";

interface Alerta {
  id: string;
  name: string;
  demand: string;
  score: number;
  time: string;
  summary: string;
  read: boolean;
}

const mockAlertas: Alerta[] = [
  {
    id: "1",
    name: "Maria Santos",
    demand: "Aposentadoria por idade",
    score: 0.92,
    time: "2 min atrás",
    summary: "Lead respondeu positivamente à triagem. Tem 62 anos, 15 anos de contribuição, quer agendar consulta urgente.",
    read: false,
  },
  {
    id: "2",
    name: "João Costa",
    demand: "Auxílio-doença INSS",
    score: 0.87,
    time: "15 min atrás",
    summary: "Reativado pelo Agente Corretivo (D2). Retornou após 3 dias, mencionou laudo médico pronto.",
    read: false,
  },
  {
    id: "3",
    name: "Ana Oliveira",
    demand: "BPC/LOAS",
    score: 0.85,
    time: "32 min atrás",
    summary: "Nova lead, triada como BPC. Mãe de criança com deficiência, renda familiar abaixo de 1/4 SM.",
    read: false,
  },
  {
    id: "4",
    name: "Fernanda Alves",
    demand: "Aposentadoria especial",
    score: 0.78,
    time: "1h atrás",
    summary: "Reativada (D5). Trabalhou 25 anos com exposição a ruído. Quer saber sobre PPP.",
    read: true,
  },
  {
    id: "5",
    name: "Pedro Mendes",
    demand: "Aposentadoria por tempo",
    score: 0.7,
    time: "2h atrás",
    summary: "Lead novo, 58 anos, 32 anos de contribuição. Perguntou sobre regras de transição.",
    read: true,
  },
];

export default function Alertas() {
  const unread = mockAlertas.filter((a) => !a.read).length;

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

      <div className="space-y-3">
        {mockAlertas.map((alerta, i) => (
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
                        {alerta.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{alerta.name}</h3>
                        <Badge variant="outline" className="text-[11px] bg-primary/10 text-primary border-primary/30">
                          {Math.round(alerta.score * 100)}% score
                        </Badge>
                        {!alerta.read && (
                          <span className="h-2 w-2 rounded-full bg-primary animate-pulse-gold" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{alerta.demand}</p>
                      <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{alerta.summary}</p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {alerta.time}
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
                    <Button size="sm" variant="ghost" className="text-muted-foreground">
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                      Resolver
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
