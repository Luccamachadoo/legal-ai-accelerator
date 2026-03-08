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
import { Search, Filter, Download } from "lucide-react";
import { useState } from "react";

type ContatoStatus = "novo" | "quente" | "esfriado" | "reativado" | "fechado";

interface Contato {
  id: string;
  name: string;
  phone: string;
  demand: string;
  status: ContatoStatus;
  score: number;
  lastMsg: string;
}

const mockContatos: Contato[] = [
  { id: "1", name: "Maria Santos", phone: "+55 79 9****-1234", demand: "Aposentadoria", status: "quente", score: 0.92, lastMsg: "Há 2 min" },
  { id: "2", name: "João Costa", phone: "+55 79 9****-5678", demand: "INSS", status: "quente", score: 0.87, lastMsg: "Há 15 min" },
  { id: "3", name: "Ana Oliveira", phone: "+55 79 9****-9012", demand: "BPC/LOAS", status: "novo", score: 0.65, lastMsg: "Há 1h" },
  { id: "4", name: "Carlos Lima", phone: "+55 79 9****-3456", demand: "Revisão", status: "esfriado", score: 0.45, lastMsg: "Há 3 dias" },
  { id: "5", name: "Fernanda Alves", phone: "+55 79 9****-7890", demand: "Aposentadoria", status: "reativado", score: 0.78, lastMsg: "Há 30 min" },
  { id: "6", name: "Roberto Souza", phone: "+55 79 9****-2345", demand: "INSS", status: "fechado", score: 0.95, lastMsg: "Há 5 dias" },
  { id: "7", name: "Lucia Pereira", phone: "+55 79 9****-6789", demand: "BPC/LOAS", status: "esfriado", score: 0.32, lastMsg: "Há 7 dias" },
  { id: "8", name: "Pedro Mendes", phone: "+55 79 9****-0123", demand: "Aposentadoria", status: "novo", score: 0.7, lastMsg: "Há 45 min" },
];

const statusConfig: Record<ContatoStatus, { label: string; className: string }> = {
  novo: { label: "Novo", className: "bg-holly-info/10 text-holly-info border-holly-info/30" },
  quente: { label: "Quente", className: "bg-primary/10 text-primary border-primary/30" },
  esfriado: { label: "Esfriado", className: "bg-muted text-muted-foreground border-border" },
  reativado: { label: "Reativado", className: "bg-holly-success/10 text-holly-success border-holly-success/30" },
  fechado: { label: "Fechado", className: "bg-holly-navy/10 text-foreground border-border" },
};

export default function Contatos() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const filtered = mockContatos.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
                  <TableCell className="font-medium">{contato.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{contato.phone}</TableCell>
                  <TableCell>{contato.demand}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusConfig[contato.status].className}>
                      {statusConfig[contato.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`font-semibold text-sm ${
                        contato.score >= 0.8
                          ? "text-primary"
                          : contato.score >= 0.5
                          ? "text-holly-warning"
                          : "text-muted-foreground"
                      }`}
                    >
                      {Math.round(contato.score * 100)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {contato.lastMsg}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}
