import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton";
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
  Menu,
  X,
  CalendarCheck,
  RefreshCw,
  UserCheck,
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
  const goSignup = () => navigate("/agendar");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "Holly AI — Protocolo de Dupla Atuação para WhatsApp Jurídico";
  }, []);

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
            <a href="#protocolo" className="hover:text-foreground transition-colors">O Protocolo</a>
            <a href="#como-funciona" className="hover:text-foreground transition-colors">Como Funciona</a>
            <a href="#resultados" className="hover:text-foreground transition-colors">Resultados</a>
            <a href="#servicos" className="hover:text-foreground transition-colors">Serviços</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
              Área do Cliente
            </Button>
            <Button size="sm" onClick={goSignup}>
              Agendar conversa
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background/95 backdrop-blur-md"
          >
            <div className="flex flex-col px-6 py-4 gap-3">
              {[
                { href: "#protocolo", label: "O Protocolo" },
                { href: "#como-funciona", label: "Como Funciona" },
                { href: "#resultados", label: "Resultados" },
                { href: "#servicos", label: "Serviços" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <Separator />
              <div className="flex gap-3 pt-1">
                <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate("/login")}>
                  Área do Cliente
                </Button>
                <Button size="sm" className="flex-1" onClick={goSignup}>
                  Agendar conversa
                </Button>
              </div>
            </div>
          </motion.div>
        )}
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
              Protocolo de Dupla Atuação HOLLY™
            </motion.span>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mx-auto max-w-4xl text-4xl font-bold leading-tight font-display md:text-6xl md:leading-[1.1]"
            >
              Seus leads esfriam no WhatsApp.{" "}
              <span className="text-primary">Nós recuperamos eles.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed md:text-xl"
            >
              Implementamos e operamos um protocolo que organiza o atendimento no WhatsApp jurídico
              e recupera contatos que esfriaram — em 30 dias, com critério claro de resultado.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" className="text-base px-8 h-12" onClick={goSignup}>
                Quero saber mais
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-sm text-muted-foreground">Implementação em 7 dias • Resultado em 30 dias</p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={4}
              className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Operação completa no seu WhatsApp
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Sem instalar nada no celular
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" /> LGPD compliant
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── O Protocolo ─── */}
      <section id="protocolo" className="py-24 bg-card">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold font-display md:text-4xl">
              O que a Holly faz pelo seu escritório
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Não vendemos software. Entregamos a operação completa — a Holly entra no seu WhatsApp e assume o fluxo.
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
                title: "Organiza o atendimento",
                desc: "Responde e faz triagem de novos contatos no WhatsApp com o Agente Secretária, 24 horas por dia.",
              },
              {
                icon: RefreshCw,
                title: "Recupera contatos esfriados",
                desc: "Identifica quando um contato esfria e retoma a conversa automaticamente com o Agente de Recuperação.",
              },
              {
                icon: Bell,
                title: "Alerta quando o interesse volta",
                desc: "Você recebe alertas em tempo real quando um lead reativado demonstra novo interesse.",
              },
              {
                icon: BarChart3,
                title: "Registra tudo que acontece",
                desc: "Cada contato tem histórico completo: score de temperatura, status, demanda e linha do tempo.",
              },
              {
                icon: Shield,
                title: "LGPD e OAB compliant",
                desc: "Dados criptografados, consentimento explícito e operação em total conformidade com a legislação.",
              },
              {
                icon: Clock,
                title: "Controle total do processo",
                desc: "Saiba exatamente onde o atendimento trava. WhatsApp menos caótico, leads nunca mais ficam soltos.",
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
              Como funciona na prática
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
                icon: CalendarCheck,
                title: "Implementação em 7 dias",
                desc: "Conectamos a Holly ao seu WhatsApp, configuramos os agentes e calibramos o protocolo para o seu perfil de atendimento.",
              },
              {
                step: "02",
                icon: Bot,
                title: "Operação por 30 dias",
                desc: "A Holly organiza novos contatos, identifica quem esfriou e retoma conversas abandonadas — tudo automaticamente.",
              },
              {
                step: "03",
                icon: UserCheck,
                title: "Resultado ou não continua",
                desc: "Se ao final dos 30 dias o protocolo não gerar conversas reais reativadas, a operação não continua. Simples assim.",
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

      {/* ─── O que o cliente vê ─── */}
      <section className="py-24 bg-card">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold font-display md:text-4xl">
              O que você vai ver acontecer
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto"
          >
            {[
              "Conversas que tinham morrido voltam a acontecer",
              "WhatsApp fica menos caótico e mais organizado",
              "Leads não ficam mais soltos sem acompanhamento",
              "Clareza de onde exatamente o atendimento trava",
              "Sensação concreta de controle sobre o funil",
              "Dados reais para tomar decisões — nada de métrica vazia",
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <p className="text-foreground leading-relaxed">{item}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Depoimentos / Resultados ─── */}
      <section id="resultados" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold font-display md:text-4xl">
              Resultados reais de quem já usa
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
                  "Em 30 dias, a Holly reativou 14 contatos que estavam parados há mais de um ano. Fechei 5 casos novos sem precisar fazer nada.",
              },
              {
                name: "Dr. Carlos Mendes",
                role: "Sócio · Mendes & Associados · MG",
                quote:
                  "Parece que contratei uma secretária que nunca esquece de ninguém. Minha taxa de conversão subiu 35% e o WhatsApp parou de ser um caos.",
              },
              {
                name: "Dra. Patrícia Lima",
                role: "Advogada Autônoma · RJ",
                quote:
                  "Antes eu perdia horas tentando lembrar quem tinha falado comigo. Agora a Holly cuida do fluxo e eu só atuo nos contatos quentes.",
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

      {/* ─── Serviços ─── */}
      <section id="servicos" className="py-24 bg-card">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold font-display md:text-4xl">
              Dois formatos, um resultado
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Escolha o formato que faz sentido para o seu momento. Sem fidelidade, sem surpresas.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto"
          >
            {/* Serviço 1: Implementação 30 dias */}
            <motion.div variants={fadeUp} custom={0}>
              <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="pt-8 pb-6 flex flex-col h-full">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary w-fit mb-4">
                    Ideal para começar
                  </span>
                  <h3 className="text-xl font-bold font-display">Implementação 30 dias</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Protocolo de Dupla Atuação HOLLY™ — implementação em 7 dias, operação por 30 dias.
                  </p>
                  <ul className="space-y-3 my-6 flex-1">
                    {[
                      "Agente Secretária (triagem e resposta 24h)",
                      "Agente de Recuperação (retomada de contatos esfriados)",
                      "Alertas quando o interesse volta",
                      "Dashboard com funil completo",
                      "Relatório de resultado ao final",
                      "Se não gerar reativações, não continua",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" onClick={goSignup}>
                    Quero implementar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Serviço 2: Operação Contínua */}
            <motion.div variants={fadeUp} custom={1}>
              <Card className="h-full border-primary shadow-lg ring-1 ring-primary/20 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Mais completo
                </span>
                <CardContent className="pt-8 pb-6 flex flex-col h-full">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary w-fit mb-4">
                    Para quem já validou
                  </span>
                  <h3 className="text-xl font-bold font-display">Operação Contínua</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manutenção mensal do Protocolo HOLLY™ — a Holly roda permanentemente no seu escritório.
                  </p>
                  <ul className="space-y-3 my-6 flex-1">
                    {[
                      "Tudo da Implementação 30 dias",
                      "Operação mensal contínua e ininterrupta",
                      "Calibração e otimização dos agentes",
                      "Relatórios semanais de performance",
                      "Suporte prioritário dedicado",
                      "Expansão para múltiplos números",
                    ].map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" onClick={goSignup}>
                    Agendar conversa
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Diferencial ─── */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold font-display md:text-4xl">
              Por que a Holly é diferente
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="grid gap-4 md:grid-cols-2"
          >
            {[
              { label: "Agência de marketing", problem: "Gera mais leads, mas não resolve o vazamento no WhatsApp." },
              { label: "Software / SaaS", problem: "Entrega a ferramenta, mas não opera. Você precisa fazer tudo." },
              { label: "Consultoria", problem: "Fala o que fazer, mas não executa." },
              { label: "Secretária humana", problem: "Cara, inconsistente e sem método replicável." },
            ].map((item, i) => (
              <motion.div key={item.label} variants={fadeUp} custom={i}>
                <Card className="border-border/50">
                  <CardContent className="pt-5 pb-4">
                    <p className="font-semibold text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.problem}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mt-8 text-center"
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-6">
                <p className="text-lg font-semibold text-foreground">
                  A Holly faz algo diferente: <span className="text-primary">entra no WhatsApp, assume a operação e responde pelo fluxo.</span>
                </p>
              </CardContent>
            </Card>
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
              answer="Não. A Holly funciona via WhatsApp Web. Basta autorizar o acesso e pronto — os agentes começam a operar automaticamente."
            />
            <FAQItem
              question="A Holly envia mensagens automáticas para meus contatos?"
              answer="O Agente Secretária responde e faz triagem de novos contatos. O Agente de Recuperação retoma conversas esfriadas com mensagens naturais e personalizadas. Você mantém o controle total."
            />
            <FAQItem
              question="O que acontece se não funcionar em 30 dias?"
              answer="Se o Protocolo não gerar conversas reais reativadas ao final dos 30 dias, a operação não continua. Simples assim. Sem discussão sobre 'resultado'."
            />
            <FAQItem
              question="A Holly está em conformidade com a LGPD e a OAB?"
              answer="Sim. Dados criptografados, consentimento explícito, processamento em servidores seguros e total conformidade com a LGPD e as normas da OAB. Você mantém controle total sobre seus dados."
            />
            <FAQItem
              question="Qual a diferença entre a Holly e um software de CRM?"
              answer="Software te entrega a ferramenta e você opera. A Holly entrega a operação pronta — entra no seu WhatsApp, assume o fluxo e recupera contatos que esfriaram. É serviço, não software."
            />
            <FAQItem
              question="Como funciona a transição para Operação Contínua?"
              answer="Ao final dos 30 dias de implementação, você decide se quer manter o Protocolo rodando de forma contínua. Sem pitch, sem pressão. O resultado fala por si."
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
              Seus leads estão esfriando agora.
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Implementamos o Protocolo de Dupla Atuação HOLLY™ para organizar o atendimento no WhatsApp jurídico
              e recuperar contatos que esfriaram, em 30 dias com critério claro de continuidade.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="mt-8">
              <Button size="lg" className="text-base px-10 h-12" onClick={goSignup}>
                Agendar uma conversa
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
            <a href="/privacidade" className="hover:text-foreground transition-colors">Privacidade</a>
            <a href="#" className="hover:text-foreground transition-colors">Contato</a>
          </div>
        </div>
      </footer>

      <WhatsAppFloatingButton phoneNumber="5579991272203" />
    </div>
  );
}
