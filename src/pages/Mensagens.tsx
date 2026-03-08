import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  MessageSquare,
  ArrowLeft,
  Send,
  Inbox,
  User,
  Loader2,
} from "lucide-react";
import { useContatos } from "@/hooks/useData";
import { useMensagens } from "@/hooks/useMensagens";
import { useSendChatwootMessage, useChatwootConfig } from "@/hooks/useChatwoot";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import { demandLabels } from "@/lib/constants";

export default function Mensagens() {
  useEffect(() => { document.title = "Mensagens — Holly AI"; }, []);
  const [selectedContatoId, setSelectedContatoId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [msgInput, setMsgInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: contatos, isLoading: contatosLoading } = useContatos();
  const { data: mensagens, isLoading: msgsLoading } = useMensagens(selectedContatoId);
  const sendMessage = useSendChatwootMessage();
  const { data: chatwootConfig } = useChatwootConfig();
  const isChatwootEnabled = chatwootConfig?.enabled ?? false;

  const filtered = (contatos ?? []).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const selectedContato = (contatos ?? []).find((c) => c.id === selectedContatoId);

  const maskPhone = (phone: string) =>
    phone.length >= 8
      ? phone.slice(0, 4) + "****" + phone.slice(-2)
      : phone;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Mensagens</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Histórico de conversas por contato
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[calc(100vh-220px)]">
        {/* Contacts List */}
        <Card className="holly-card-shadow border-border/50 lg:col-span-1">
          <CardContent className="p-0">
            <div className="p-3 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar contato..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            </div>
            <ScrollArea className="h-[calc(100vh-340px)]">
              {contatosLoading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                  Carregando...
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm gap-2">
                  <Inbox className="h-8 w-8" />
                  Nenhum contato encontrado
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {filtered.map((contato) => (
                    <button
                      key={contato.id}
                      onClick={() => setSelectedContatoId(contato.id)}
                      className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${
                        selectedContatoId === contato.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {contato.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{contato.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {demandLabels[contato.demand_type ?? ""] ?? "—"}
                          </p>
                        </div>
                        {contato.last_msg_at && (
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {formatDistanceToNow(new Date(contato.last_msg_at), {
                              addSuffix: false,
                              locale: ptBR,
                            })}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages Panel */}
        <Card className="holly-card-shadow border-border/50 lg:col-span-2">
          <CardContent className="p-0 flex flex-col h-full">
            <AnimatePresence mode="wait">
              {!selectedContatoId ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3 min-h-[calc(100vh-340px)]"
                >
                  <MessageSquare className="h-12 w-12 opacity-30" />
                  <p className="text-sm">Selecione um contato para ver as mensagens</p>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedContatoId}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="flex flex-col h-full min-h-[calc(100vh-340px)]"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-border/50 flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden h-8 w-8"
                      onClick={() => setSelectedContatoId(null)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {(selectedContato?.name ?? "??")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{selectedContato?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {maskPhone(selectedContato?.phone ?? "")} •{" "}
                        {demandLabels[selectedContato?.demand_type ?? ""] ?? "—"}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {Math.round((selectedContato?.score_hot ?? 0) * 100)}% score
                    </Badge>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {msgsLoading ? (
                      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                        Carregando mensagens...
                      </div>
                    ) : (mensagens ?? []).length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm gap-2">
                        <Inbox className="h-8 w-8" />
                        Nenhuma mensagem registrada
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {(mensagens ?? []).map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.direction === "out" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                msg.direction === "out"
                                  ? "bg-primary text-primary-foreground rounded-br-md"
                                  : "bg-muted rounded-bl-md"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                              <div className={`flex items-center gap-2 mt-1 ${
                                msg.direction === "out" ? "justify-end" : "justify-start"
                              }`}>
                                <span className={`text-[10px] ${
                                  msg.direction === "out" ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}>
                                  {format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}
                                </span>
                                {msg.ai_class && (
                                  <Badge
                                    variant="outline"
                                    className={`text-[9px] px-1.5 py-0 h-4 ${
                                      msg.direction === "out"
                                        ? "border-primary-foreground/30 text-primary-foreground/70"
                                        : "border-border"
                                    }`}
                                  >
                                    {msg.ai_class}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  {/* Send input */}
                  <div className="p-3 border-t border-border/50">
                    {isChatwootEnabled ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!msgInput.trim() || !selectedContatoId) return;
                          sendMessage.mutate(
                            { contato_id: selectedContatoId, content: msgInput.trim() },
                            { onSuccess: () => setMsgInput("") }
                          );
                        }}
                        className="flex items-center gap-2"
                      >
                        <Input
                          placeholder="Digite sua mensagem..."
                          value={msgInput}
                          onChange={(e) => setMsgInput(e.target.value)}
                          className="flex-1 h-9 text-sm"
                          disabled={sendMessage.isPending}
                        />
                        <Button
                          type="submit"
                          size="icon"
                          className="holly-gradient border-0 text-primary-foreground h-9 w-9 shrink-0"
                          disabled={sendMessage.isPending || !msgInput.trim()}
                        >
                          {sendMessage.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </form>
                    ) : (
                      <div className="text-center py-1">
                        <p className="text-xs text-muted-foreground">
                          Ative a integração Chatwoot em{" "}
                          <a href="/configuracoes" className="text-primary underline underline-offset-2">
                            Configurações
                          </a>{" "}
                          para enviar mensagens
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
