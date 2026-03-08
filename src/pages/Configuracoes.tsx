import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bot, Shield, Clock, MessageSquare, Save } from "lucide-react";

export default function Configuracoes() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6 max-w-3xl"
    >
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure o Protocolo de Dupla Ação
        </p>
      </div>

      {/* Agente Secretária */}
      <Card className="holly-card-shadow border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Agente Secretária</CardTitle>
              <CardDescription>Configurações do agente preventivo</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tom de voz</Label>
            <Input placeholder="Profissional e acolhedor" defaultValue="Profissional e acolhedor" />
          </div>
          <div className="space-y-2">
            <Label>Template de boas-vindas</Label>
            <Textarea
              rows={3}
              defaultValue="Olá! Sou a assistente virtual do Dr. [Nome]. Como posso ajudá-lo(a) com seu benefício previdenciário?"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Resposta automática</Label>
              <p className="text-xs text-muted-foreground">Responder novas mensagens em &lt;5min</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Horário comercial</Label>
              <p className="text-xs text-muted-foreground">Limitar respostas completas a horário útil</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Agente Recuperação */}
      <Card className="holly-card-shadow border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-holly-success/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-holly-success" />
            </div>
            <div>
              <CardTitle className="text-base">Agente de Recuperação</CardTitle>
              <CardDescription>Configurações do agente corretivo</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Timing de retomada</Label>
            <div className="flex items-center gap-2">
              {["D2", "D5", "D10"].map((day) => (
                <Badge key={day} variant="outline" className="bg-primary/10 text-primary border-primary/30 cursor-pointer">
                  {day}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Dias após inatividade para retomada</p>
          </div>
          <div className="space-y-2">
            <Label>Template retomada D2</Label>
            <Textarea
              rows={3}
              defaultValue="Olá [Nome]! Vi que conversamos sobre [demanda] há alguns dias. Ainda posso ajudá-lo(a) com essa questão?"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Máximo de tentativas</Label>
              <p className="text-xs text-muted-foreground">Número máximo de retomadas por contato</p>
            </div>
            <Input className="w-20 text-center" type="number" defaultValue={3} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Opt-out automático</Label>
              <p className="text-xs text-muted-foreground">Detectar e respeitar pedidos de parada</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* LGPD */}
      <Card className="holly-card-shadow border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-holly-info/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-holly-info" />
            </div>
            <div>
              <CardTitle className="text-base">Compliance LGPD/OAB</CardTitle>
              <CardDescription>Conformidade e ética</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Anonimização PII</Label>
              <p className="text-xs text-muted-foreground">Ocultar CPF e dados sensíveis nos logs</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Consentimento explícito</Label>
              <p className="text-xs text-muted-foreground">Solicitar aceite antes de processar dados</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auditoria de logs</Label>
              <p className="text-xs text-muted-foreground">Registrar todas ações para compliance</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="holly-gradient border-0 text-primary-foreground hover:opacity-90">
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </motion.div>
  );
}
