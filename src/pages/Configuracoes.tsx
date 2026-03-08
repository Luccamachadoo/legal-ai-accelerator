import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bot, Shield, Clock, Save, Loader2, MessageSquare, Link, ExternalLink, Copy } from "lucide-react";
import { useConfiguracoes, useSaveConfiguracoes } from "@/hooks/useConfiguracoes";
import { useChatwootConfig, useSaveChatwootConfig } from "@/hooks/useChatwoot";
import { toast } from "sonner";

export default function Configuracoes() {
  useEffect(() => { document.title = "Configurações — Holly AI"; }, []);
  const { data: config, isLoading } = useConfiguracoes();
  const saveConfig = useSaveConfiguracoes();
  const { data: chatwootConfig, isLoading: cwLoading } = useChatwootConfig();
  const saveChatwoot = useSaveChatwootConfig();

  const [cwForm, setCwForm] = useState({
    chatwoot_base_url: "",
    chatwoot_api_token: "",
    chatwoot_account_id: "",
    chatwoot_inbox_id: "",
    webhook_secret: "",
    enabled: false,
  });

  useEffect(() => {
    if (chatwootConfig) {
      setCwForm({
        chatwoot_base_url: chatwootConfig.chatwoot_base_url,
        chatwoot_api_token: chatwootConfig.chatwoot_api_token,
        chatwoot_account_id: chatwootConfig.chatwoot_account_id,
        chatwoot_inbox_id: chatwootConfig.chatwoot_inbox_id,
        webhook_secret: chatwootConfig.webhook_secret,
        enabled: chatwootConfig.enabled,
      });
    }
  }, [chatwootConfig]);

  const webhookUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/chatwoot-webhook`;

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success("URL copiada!");
  };

  const handleSaveChatwoot = () => saveChatwoot.mutate(cwForm);

  const [form, setForm] = useState({
    secretaria_tom: "",
    secretaria_template_boas_vindas: "",
    secretaria_resposta_auto: true,
    secretaria_horario_comercial: false,
    recuperacao_timing_dias: [2, 5, 10] as number[],
    recuperacao_template_d2: "",
    recuperacao_max_tentativas: 3,
    recuperacao_opt_out_auto: true,
    lgpd_anonimizacao: true,
    lgpd_consentimento: true,
    lgpd_auditoria: true,
  });

  useEffect(() => {
    if (config) {
      setForm({
        secretaria_tom: config.secretaria_tom,
        secretaria_template_boas_vindas: config.secretaria_template_boas_vindas,
        secretaria_resposta_auto: config.secretaria_resposta_auto,
        secretaria_horario_comercial: config.secretaria_horario_comercial,
        recuperacao_timing_dias: config.recuperacao_timing_dias,
        recuperacao_template_d2: config.recuperacao_template_d2,
        recuperacao_max_tentativas: config.recuperacao_max_tentativas,
        recuperacao_opt_out_auto: config.recuperacao_opt_out_auto,
        lgpd_anonimizacao: config.lgpd_anonimizacao,
        lgpd_consentimento: config.lgpd_consentimento,
        lgpd_auditoria: config.lgpd_auditoria,
      });
    }
  }, [config]);

  const toggleDay = (day: number) => {
    setForm((prev) => ({
      ...prev,
      recuperacao_timing_dias: prev.recuperacao_timing_dias.includes(day)
        ? prev.recuperacao_timing_dias.filter((d) => d !== day)
        : [...prev.recuperacao_timing_dias, day].sort((a, b) => a - b),
    }));
  };

  const handleSave = () => saveConfig.mutate(form);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

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
            <Input
              value={form.secretaria_tom}
              onChange={(e) => setForm((p) => ({ ...p, secretaria_tom: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Template de boas-vindas</Label>
            <Textarea
              rows={3}
              value={form.secretaria_template_boas_vindas}
              onChange={(e) => setForm((p) => ({ ...p, secretaria_template_boas_vindas: e.target.value }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Resposta automática</Label>
              <p className="text-xs text-muted-foreground">Responder novas mensagens em &lt;5min</p>
            </div>
            <Switch
              checked={form.secretaria_resposta_auto}
              onCheckedChange={(v) => setForm((p) => ({ ...p, secretaria_resposta_auto: v }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Horário comercial</Label>
              <p className="text-xs text-muted-foreground">Limitar respostas completas a horário útil</p>
            </div>
            <Switch
              checked={form.secretaria_horario_comercial}
              onCheckedChange={(v) => setForm((p) => ({ ...p, secretaria_horario_comercial: v }))}
            />
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
              {[2, 5, 10, 15, 20].map((day) => (
                <Badge
                  key={day}
                  variant="outline"
                  className={`cursor-pointer transition-colors ${
                    form.recuperacao_timing_dias.includes(day)
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                  onClick={() => toggleDay(day)}
                >
                  D{day}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Dias após inatividade para retomada</p>
          </div>
          <div className="space-y-2">
            <Label>Template retomada D2</Label>
            <Textarea
              rows={3}
              value={form.recuperacao_template_d2}
              onChange={(e) => setForm((p) => ({ ...p, recuperacao_template_d2: e.target.value }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Máximo de tentativas</Label>
              <p className="text-xs text-muted-foreground">Número máximo de retomadas por contato</p>
            </div>
            <Input
              className="w-20 text-center"
              type="number"
              min={1}
              max={10}
              value={form.recuperacao_max_tentativas}
              onChange={(e) => setForm((p) => ({ ...p, recuperacao_max_tentativas: parseInt(e.target.value) || 1 }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Opt-out automático</Label>
              <p className="text-xs text-muted-foreground">Detectar e respeitar pedidos de parada</p>
            </div>
            <Switch
              checked={form.recuperacao_opt_out_auto}
              onCheckedChange={(v) => setForm((p) => ({ ...p, recuperacao_opt_out_auto: v }))}
            />
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
            <Switch
              checked={form.lgpd_anonimizacao}
              onCheckedChange={(v) => setForm((p) => ({ ...p, lgpd_anonimizacao: v }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Consentimento explícito</Label>
              <p className="text-xs text-muted-foreground">Solicitar aceite antes de processar dados</p>
            </div>
            <Switch
              checked={form.lgpd_consentimento}
              onCheckedChange={(v) => setForm((p) => ({ ...p, lgpd_consentimento: v }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auditoria de logs</Label>
              <p className="text-xs text-muted-foreground">Registrar todas ações para compliance</p>
            </div>
            <Switch
              checked={form.lgpd_auditoria}
              onCheckedChange={(v) => setForm((p) => ({ ...p, lgpd_auditoria: v }))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          className="holly-gradient border-0 text-primary-foreground hover:opacity-90"
          onClick={handleSave}
          disabled={saveConfig.isPending}
        >
          {saveConfig.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Configurações
        </Button>
      </div>

      {/* Integração Chatwoot */}
      <Card className="holly-card-shadow border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-holly-success/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-holly-success" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">Integração Chatwoot</CardTitle>
              <CardDescription>Conecte ao Chatwoot para enviar/receber mensagens via WhatsApp</CardDescription>
            </div>
            <Switch
              checked={cwForm.enabled}
              onCheckedChange={(v) => setCwForm((p) => ({ ...p, enabled: v }))}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
              <Link className="h-3 w-3" />
              URL do Webhook (cole no Chatwoot)
            </Label>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-background px-2 py-1.5 rounded border border-border flex-1 overflow-hidden text-ellipsis">
                {webhookUrl}
              </code>
              <Button variant="outline" size="sm" onClick={copyWebhookUrl}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>URL base do Chatwoot</Label>
            <Input
              placeholder="https://app.chatwoot.com"
              value={cwForm.chatwoot_base_url}
              onChange={(e) => setCwForm((p) => ({ ...p, chatwoot_base_url: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>API Access Token</Label>
            <Input
              type="password"
              placeholder="Token de acesso da API"
              value={cwForm.chatwoot_api_token}
              onChange={(e) => setCwForm((p) => ({ ...p, chatwoot_api_token: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">Settings → Account Settings → API no Chatwoot</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Account ID</Label>
              <Input
                placeholder="Ex: 1"
                value={cwForm.chatwoot_account_id}
                onChange={(e) => setCwForm((p) => ({ ...p, chatwoot_account_id: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Inbox ID (WhatsApp)</Label>
              <Input
                placeholder="Ex: 3"
                value={cwForm.chatwoot_inbox_id}
                onChange={(e) => setCwForm((p) => ({ ...p, chatwoot_inbox_id: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Webhook Secret (opcional)</Label>
            <Input
              type="password"
              placeholder="Token para validar webhooks"
              value={cwForm.webhook_secret}
              onChange={(e) => setCwForm((p) => ({ ...p, webhook_secret: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">Configurável em Integrations → Webhooks no Chatwoot</p>
          </div>

          <div className="flex justify-end">
            <Button
              className="holly-gradient border-0 text-primary-foreground hover:opacity-90"
              onClick={handleSaveChatwoot}
              disabled={saveChatwoot.isPending}
            >
              {saveChatwoot.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Integração
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
