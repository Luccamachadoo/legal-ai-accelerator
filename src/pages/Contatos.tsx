import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Download, Inbox } from "lucide-react";
import { useState } from "react";
import { useContatos } from "@/hooks/useData";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";

type ContatoStatus = Database["public"]["Enums"]["contato_status"];

const statusConfig: Record<ContatoStatus, { label: string; className: string }> = {
  novo: { label: "Novo", className: "bg-holly-info/10 text-holly-info border-holly-info/30" },
  quente: { label: "Quente", className: "bg-primary/10 text-primary border-primary/30" },
  esfriado: { label: "Esfriado", className: "bg-muted text-muted-foreground border-border" },
  reativado: { label: "Reativado", className: "bg-holly-success/10 text-holly-success border-holly-success/30" },
  fechado: { label: "Fechado", className: "bg-holly-navy/10 text-foreground border-border" },
};

const demandLabels: Record<string, string> = {
  aposentadoria: "Aposentadoria",
  inss: "INSS",
  bpc_loas: "BPC/LOAS",
  revisao: "Revisão",
  outros: "Outros",
};

export default function Contatos() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const { data: contatos, isLoading } = useContatos(statusFilter);

  const filtered = (contatos ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const maskPhone = (phone: string) => {
    if (phone.length > 8) {
      return phone.slice(0, -4).replace(/.(?=.{4})/g, (m, i) => (i > phone.length - 9 ? "*" : m)) + phone.slice(-4);
    }
    return phone;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Contatos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gerencie todos os contatos do funil WhatsApp
        </p>
      </div>

      <Card className="holly-card-shadow border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold">
              {filtered.length} contatos
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar contato..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-3.5 w-3.5 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="quente">Quente</SelectItem>
                  <SelectItem value="esfriado">Esfriado</SelectItem>
                  <SelectItem value="reativado">Reativado</SelectItem>
                  <SelectItem value="fechado">Fechado</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              Carregando...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm gap-2">
              <Inbox className="h-8 w-8" />
              {contatos?.length === 0 ? "Nenhum contato ainda" : "Nenhum resultado encontrado"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Demanda</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Última Msg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((contato) => (
                  <TableRow key={contato.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{contato.name || "Sem nome"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{maskPhone(contato.phone)}</TableCell>
                    <TableCell>{demandLabels[contato.demand_type ?? ""] ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusConfig[contato.status].className}>
                        {statusConfig[contato.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-semibold text-sm ${
                          contato.score_hot >= 0.8
                            ? "text-primary"
                            : contato.score_hot >= 0.5
                            ? "text-holly-warning"
                            : "text-muted-foreground"
                        }`}
                      >
                        {Math.round(contato.score_hot * 100)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {contato.last_msg_at
                        ? formatDistanceToNow(new Date(contato.last_msg_at), { addSuffix: true, locale: ptBR })
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
