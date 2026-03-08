import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Download, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useContatos } from "@/hooks/useData";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { demandLabels, statusConfig, PAGE_SIZE } from "@/lib/constants";
import { toast } from "sonner";

export default function Contatos() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [page, setPage] = useState(0);
  const { data: contatos, isLoading } = useContatos(statusFilter);

  const filtered = (contatos ?? []).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Reset page when filter/search changes
  const handleSearch = (v: string) => { setSearch(v); setPage(0); };
  const handleFilter = (v: string) => { setStatusFilter(v); setPage(0); };

  const maskPhone = (phone: string) => {
    if (phone.length > 8) {
      return phone.slice(0, 4) + "****" + phone.slice(-2);
    }
    return phone;
  };

  const exportCSV = () => {
    if (filtered.length === 0) {
      toast.error("Nenhum contato para exportar.");
      return;
    }
    const headers = ["Nome", "Telefone", "Demanda", "Status", "Score", "Última Mensagem"];
    const rows = filtered.map((c) => [
      c.name || "Sem nome",
      c.phone,
      demandLabels[c.demand_type ?? ""] ?? "—",
      statusConfig[c.status].label,
      `${Math.round(c.score_hot * 100)}%`,
      c.last_msg_at ? new Date(c.last_msg_at).toLocaleDateString("pt-BR") : "—",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contatos_holly_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado!");
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
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={handleFilter}>
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
              <Button variant="outline" size="icon" onClick={exportCSV} title="Exportar CSV">
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
            <>
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
                  {paginated.map((contato) => (
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    Mostrando {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground px-2">
                      {page + 1} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
