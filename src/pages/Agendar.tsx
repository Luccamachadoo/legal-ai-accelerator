import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, ArrowLeft, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const CALENDLY_URL = "https://calendly.com/lvinicius212/30min";

export default function Agendar() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Agendar Conversa — Holly AI";

    // Load Calendly widget script
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/landing")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-display tracking-tight">Holly AI</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/landing")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Voltar
          </Button>
        </div>
      </nav>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <CalendarCheck className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-display md:text-4xl">
            Agende uma conversa
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-xl mx-auto">
            Escolha o melhor horário para conhecer o Protocolo de Dupla Atuação HOLLY™
            e entender como podemos organizar seu WhatsApp jurídico.
          </p>
        </motion.div>

        {/* Calendly Embed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-xl border border-border overflow-hidden bg-card"
        >
          <div
            className="calendly-inline-widget"
            data-url={`${CALENDLY_URL}?hide_gdpr_banner=1&background_color=0a0a0a&text_color=fafafa&primary_color=6d28d9`}
            style={{ minWidth: "320px", height: "700px" }}
          />
        </motion.div>
      </div>
    </div>
  );
}
