import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Send, User, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Quantos leads quentes tenho esta semana?",
  "Quem são os contatos com maior chance de conversão?",
  "Resuma a atividade dos últimos 7 dias",
  "Quais contatos estão esfriando e precisam de atenção?",
  "Qual minha taxa de conversão atual?",
];

export default function Assistente() {
  useEffect(() => { document.title = "Holly AI — Assistente"; }, []);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ message: text.trim() }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro");

      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      toast.error("Erro: " + (err as Error).message);
      setMessages(prev => [...prev, { role: "assistant", content: "Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[calc(100vh-4rem)]"
    >
      <div className="mb-4">
        <h1 className="text-2xl font-display font-bold tracking-tight">Holly Assistente</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Pergunte sobre seus dados, leads e métricas em tempo real
        </p>
      </div>

      <Card className="flex-1 flex flex-col holly-card-shadow border-border/50 overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="h-16 w-16 rounded-2xl holly-gradient flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary-foreground" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold font-display">Olá! Sou a Holly 👋</h3>
                <p className="text-muted-foreground text-sm mt-1 max-w-md">
                  Posso analisar seus dados e ajudar com insights sobre seus leads, métricas e estratégias.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="px-3 py-2 text-xs rounded-lg border border-border/50 bg-muted/50 hover:bg-primary/10 hover:border-primary/30 transition-colors text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="h-8 w-8 rounded-lg holly-gradient flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/70 text-foreground"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === "user" && (
                <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-1">
                  <User className="h-4 w-4 text-secondary-foreground" />
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="h-8 w-8 rounded-lg holly-gradient flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="bg-muted/70 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analisando seus dados...
              </div>
            </motion.div>
          )}
        </div>

        <CardContent className="border-t border-border/50 p-3">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte algo sobre seus dados..."
              className="resize-none min-h-[44px] max-h-32 text-sm"
              rows={1}
            />
            <Button
              size="icon"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="shrink-0 holly-gradient"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}