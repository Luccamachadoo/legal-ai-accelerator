import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, type Easing } from "framer-motion";
import {
  Bot,
  MessageSquare,
  TrendingUp,
  Bell,
  BarChart3,
  Shield,
  Zap,
  Clock,
  ChevronDown,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as Easing },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left font-medium text-foreground hover:text-primary transition-colors"
      >
        {question}
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="pb-5 text-muted-foreground leading-relaxed"
        >
          {answer}
        </motion.div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const goSignup = () => navigate("/signup");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-display tracking-tight">Holly AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#beneficios" className="hover:text-foreground transition-colors">Benefícios</a>
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como Funciona</a>
            <a href="#depoimentos" className="hover:text-foreground transition-colors">Depoimentos</a>
            <a href="#precos" className="hover:text-foreground transition-colors">Preços</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              Entrar
            </Button>
            <Button size="sm" onClick={goSignup}>
              Começar grátis
            </Button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative py-24 md:py-36">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6"
            >
              <Zap className="h-3.5 w-3.5" />
              Protocolo de Dupla Ação para Advogados
            </motion.span>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mx-auto max-w-3xl text-4xl font-bold leading-tight font-display md:text-6xl md:leading-[1.1]"
            >
              Reative leads esquecidos.{" "}
              <span className="text-primary">Converta mais clientes.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed md:text-xl"
            >
              Holly AI monitora seus contatos do WhatsApp, identifica demandas previdenciárias e
              dispara alertas inteligentes — para que você nunca mais perca um caso.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" className="text-base px-8 h-12" onClick={goSignup}>
                Iniciar teste grátis de 30 dias
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-sm text-muted-foreground">Sem cartão de crédito • Cancele quando quiser</p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={4}
              className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" /> +2.400 advogados ativos
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" /> 30% mais conversões
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" /> LGPD compliant
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Benefícios ─── */}
      <section id="beneficios" className="py-24 bg-card">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold font-display md:text-4xl">
              Por que advogados escolhem a Holly AI?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Automatize a prospecção, reative leads frios e concentre-se no que importa: fechar casos.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {[
              {
                icon: MessageSquare,
                title: "Monitoramento WhatsApp",
                desc: "Conecte seu WhatsApp e a Holly lê cada mensagem para identificar sinais de demanda previdenciária.",
              },
              {
                icon: TrendingUp,
                title: "Score de Temperatura",
                desc: "Cada contato recebe um score de 0 a 100 baseado em urgência, intenção e contexto da conversa.",
              },
              {
                icon: Bell,
                title: "Alertas Inteligentes",
                desc: "Receba notificações quando um lead esfriado demonstra novo interesse ou precisa de follow-up.",
              },
              {
                icon: BarChart3,
                title: "Dashboard Analítico",
                desc: "Visualize seu funil completo: novos leads, quentes, reativações e taxa de conversão em tempo real.",
              },
              {
                icon: Shield,
                title: "LGPD Compliant",
                desc: "Dados criptografados, processamento seguro e total conformidade com a Lei Geral de Proteção de Dados.",
              },
              {
                icon: Clock,
                title: "Economia de Tempo",
                desc: "Reduza em até 70% o tempo gasto triando mensagens. A IA faz a curadoria para você.",
              },
            ].map((item, i) => (
              <motion.div key={item.title} variants={fadeUp} custom={i}>
                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Como Funciona ─── */}
      <section id="como-funciona" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold font-display md:text-4xl">
              Como funciona em 3 passos
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid gap-10 md:grid-cols-3"
          >
            {[
              {
                step: "01",
                icon: Phone,
                title: "Conecte seu WhatsApp",
                desc: "Escaneie o QR Code e vincule seu número. A Holly começa a monitorar em segundos.",
              },
              {
                step: "02",
                icon: Bot,
                title: "IA classifica automaticamente",
                desc: "Cada mensagem é analisada por IA para detectar demandas: aposentadoria, BPC/LOAS, revisão e mais.",
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Receba alertas e converta",
                desc: "Leads quentes sobem no funil. Você recebe alertas e age no momento certo para fechar o caso.",
              },
            ].map((item, i) => (
              <motion.div key={item.step} variants={fadeUp} custom={i} className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <span className="text-xs font-bold tracking-widest text-primary uppercase">
                  Passo {item.step}
                </span>
                <h3 className="mt-2 text-xl font-semibold font-display">{item.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Depoimentos ─── */}
      <section id="depoimentos" className="py-24 bg-card">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold font-display md:text-4xl">
              O que nossos clientes dizem
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid gap-6 md:grid-cols-3"
          >
            {[
              {
                name: "Dra. Ana Ferreira",
                role: "Advogada Previdenciária · SP",
                quote:
                  "Em 2 meses reativei 14 contatos que estavam parados há mais de um ano. A Holly identificou que voltaram a demonstrar interesse e eu fechei 5 casos novos.",
              },
              {
                name: "Dr. Carlos Mendes",
                role: "Sócio · Mendes & Associados · MG",
                quote:
                  "O score de temperatura mudou completamente minha rotina. Agora sei exatamente quem priorizar. Minha taxa de conversão subiu 35%.",
              },
              {
                name: "Dra. Patrícia Lima",
                role: "Advogada Autônoma · RJ",
                quote:
                  "Antes eu perdia horas lendo mensagens. Hoje a Holly faz a triagem e eu só atuo nos leads quentes. É como ter uma assistente que nunca dorme.",
              },
            ].map((item, i) => (
              <motion.div key={item.name} variants={fadeUp} custom={i}>
                <Card className="h-full border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-foreground leading-relaxed italic">"{item.quote}"</p>
                    <Separator className="my-4" />
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Preços ─── */}
      <section id="precos" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold font-display md:text-4xl">
              Planos simples e transparentes
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-muted-foreground text-lg">
              Comece com 30 dias grátis. Sem cartão de crédito.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto"
          >
            {[
              {
                name: "Starter",
                price: "R$ 97",
                desc: "Ideal para advogados autônomos",
                features: [
                  "Até 200 contatos",
                  "Monitoramento WhatsApp",
                  "Score de temperatura",
                  "Alertas por email",
                  "Dashboard básico",
                ],
                highlight: false,
              },
              {
                name: "Profissional",
                price: "R$ 197",
                desc: "Para escritórios em crescimento",
                features: [
                  "Até 1.000 contatos",
                  "Tudo do Starter",
                  "Classificação de demandas",
                  "Relatórios avançados",
                  "Suporte prioritário",
                ],
                highlight: true,
              },
              {
                name: "Escritório",
                price: "R$ 397",
                desc: "Para equipes e escritórios maiores",
                features: [
                  "Contatos ilimitados",
                  "Tudo do Profissional",
                  "Multi-advogados",
                  "API de integração",
                  "Gerente de conta dedicado",
                ],
                highlight: false,
              },
            ].map((plan, i) => (
              <motion.div key={plan.name} variants={fadeUp} custom={i}>
                <Card
                  className={`h-full relative ${
                    plan.highlight
                      ? "border-primary shadow-lg ring-1 ring-primary/20"
                      : "border-border/50"
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                      Mais popular
                    </span>
                  )}
                  <CardContent className="pt-8 pb-6 flex flex-col h-full">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.desc}</p>
                    <div className="mt-4 mb-6">
                      <span className="text-4xl font-bold font-display">{plan.price}</span>
                      <span className="text-muted-foreground">/mês</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={plan.highlight ? "default" : "outline"}
                      onClick={goSignup}
                    >
                      Começar grátis
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 bg-card">
        <div className="mx-auto max-w-3xl px-6">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-3xl font-bold font-display md:text-4xl text-center mb-12"
          >
            Perguntas frequentes
          </motion.h2>

          <div>
            <FAQItem
              question="Preciso instalar algo no celular?"
              answer="Não. A Holly funciona via WhatsApp Web. Basta escanear o QR Code no nosso painel e pronto — a IA começa a monitorar automaticamente."
            />
            <FAQItem
              question="Meus clientes vão saber que uso a Holly?"
              answer="Não. A Holly apenas lê as mensagens para análise. Ela não envia mensagens automáticas nem interage com seus contatos. Tudo acontece nos bastidores."
            />
            <FAQItem
              question="O teste de 30 dias é realmente gratuito?"
              answer="Sim! Você tem acesso ao plano Profissional completo por 30 dias, sem precisar cadastrar cartão de crédito. Ao final do período, escolha o plano ideal."
            />
            <FAQItem
              question="A Holly está em conformidade com a LGPD?"
              answer="Sim. Todos os dados são criptografados, processados em servidores no Brasil e tratados de acordo com a Lei Geral de Proteção de Dados. Você mantém total controle sobre seus dados."
            />
            <FAQItem
              question="Posso cancelar a qualquer momento?"
              answer="Sim. Não há fidelidade ou multa. Cancele quando quiser diretamente pelo painel, sem burocracia."
            />
          </div>
        </div>
      </section>

      {/* ─── CTA Final ─── */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold font-display md:text-4xl">
              Pronto para nunca mais perder um caso?
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Junte-se a mais de 2.400 advogados que já usam a Holly AI para reativar leads e aumentar conversões.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="mt-8">
              <Button size="lg" className="text-base px-10 h-12" onClick={goSignup}>
                Iniciar teste grátis de 30 dias
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border py-10 bg-card">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold font-display">Holly AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Holly AI. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Termos</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
            <a href="#" className="hover:text-foreground transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
