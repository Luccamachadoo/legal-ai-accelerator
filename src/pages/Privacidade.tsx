import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Scale, Database, UserX, Eye, FileText, Lock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Privacidade() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl holly-gradient mb-4">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Política de Privacidade</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Em conformidade com a LGPD — Lei 13.709/2018
          </p>
        </div>

        <Card className="holly-card-shadow border-border/50">
          <CardContent className="pt-6 space-y-6 text-sm text-foreground/80 leading-relaxed">
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-foreground">1. Dados Coletados</h2>
              </div>
              <p>
                Coletamos os seguintes dados pessoais: nome completo, email, número de telefone/WhatsApp, número da OAB e foto de perfil.
                Também são coletadas informações de contatos de clientes inseridas pelo advogado, como nome, telefone, tipo de demanda e histórico de mensagens.
              </p>
            </section>

            <Separator />

            <section>
              <div className="flex items-center gap-2 mb-2">
                <Scale className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-foreground">2. Finalidade do Tratamento</h2>
              </div>
              <p>
                Os dados são utilizados para: (a) autenticação e acesso à plataforma; (b) gestão de leads e contatos de clientes; (c) análise e classificação automatizada de mensagens por IA;
                (d) geração de relatórios de desempenho; (e) envio de alertas sobre leads quentes.
              </p>
            </section>

            <Separator />

            <section>
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-foreground">3. Segurança dos Dados</h2>
              </div>
              <p>
                Utilizamos criptografia em trânsito (TLS/SSL) e em repouso. O acesso aos dados é controlado por políticas de segurança em nível de linha (RLS),
                garantindo que cada advogado acesse apenas seus próprios dados. Senhas são verificadas contra bases de vazamentos conhecidos (HIBP).
              </p>
            </section>

            <Separator />

            <section>
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-foreground">4. Compartilhamento</h2>
              </div>
              <p>
                Seus dados não são vendidos ou compartilhados com terceiros para fins de marketing.
                Utilizamos infraestrutura de nuvem segura para hospedagem e processamento de dados.
              </p>
            </section>

            <Separator />

            <section>
              <div className="flex items-center gap-2 mb-2">
                <UserX className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-foreground">5. Seus Direitos (LGPD Art. 18)</h2>
              </div>
              <p>Você tem direito a:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Confirmar a existência de tratamento de dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Solicitar a anonimização ou exclusão de dados desnecessários</li>
                <li>Solicitar a portabilidade dos dados</li>
                <li>Revogar o consentimento a qualquer momento</li>
                <li>Solicitar a eliminação de seus dados pessoais</li>
              </ul>
              <p className="mt-2">
                Para exercer qualquer um desses direitos, acesse <strong>Configurações → Meus Dados</strong> ou entre em contato conosco.
              </p>
            </section>

            <Separator />

            <section>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-foreground">6. Retenção de Dados</h2>
              </div>
              <p>
                Os dados são mantidos enquanto a conta estiver ativa. Após a exclusão da conta, os dados pessoais são removidos em até 30 dias,
                exceto quando houver obrigação legal de retenção.
              </p>
            </section>

            <Separator />

            <p className="text-xs text-muted-foreground text-center pt-2">
              Última atualização: Março de 2026
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
