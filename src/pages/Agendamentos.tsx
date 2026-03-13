import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Plus, Trash2, ExternalLink, Clock, Search } from "lucide-react";
import { TableSkeletonRows } from "@/components/TableSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Agendamentos() {
  useEffect(() => { document.title = "Agendamentos — Holly AI"; }, []);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [dataHora, setDataHora] = useState("");
  const [contatoId, setContatoId] = useState("");
  const [linkReuniao, setLinkReuniao] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  const { data: agendamentos, isLoading } = useQuery({
    queryKey: ["agendamentos", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agendamentos")
        .select("*, contatos(name, phone)")
        .order("data_hora", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: contatos } = useQuery({
    queryKey: ["contatos-list", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("contatos").select("id, name, phone");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("agendamentos").insert({
        advogado_id: user!.id,
        contato_id: contatoId,
        data_hora: new Date(dataHora).toISOString(),
        link_reuniao: linkReuniao || null,
        status: "agendado",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos"] });
      toast.success("Agendamento criado com sucesso!");
      setOpen(false);
      setDataHora("");
      setContatoId("");
      setLinkReuniao("");
    },
    onError: () => toast.error("Erro ao criar agendamento"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("agendamentos").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos"] });
      toast.success("Status atualizado!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agendamentos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos"] });
      toast.success("Agendamento removido!");
    },
  });

  const statusColor = (s: string | null) => {
    switch (s) {
      case "agendado": return "default";
      case "confirmado": return "secondary";
      case "realizado": return "outline";
      case "cancelado": return "destructive";
      default: return "default";
    }
  };

  const filteredAgendamentos = useMemo(() => {
    if (!agendamentos) return [];
    return agendamentos.filter((a: any) => {
      const matchesSearch = !searchTerm || 
        (a.contatos?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "todos" || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [agendamentos, searchTerm, statusFilter]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight font-display">Agendamentos</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo Agendamento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Contato</Label>
                <Select value={contatoId} onValueChange={setContatoId}>
                  <SelectTrigger><SelectValue placeholder="Selecione o contato" /></SelectTrigger>
                  <SelectContent>
                    {contatos?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name || c.phone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data e Hora</Label>
                <Input type="datetime-local" value={dataHora} onChange={(e) => setDataHora(e.target.value)} />
              </div>
              <div>
                <Label>Link da Reunião (opcional)</Label>
                <Input placeholder="https://meet.google.com/..." value={linkReuniao} onChange={(e) => setLinkReuniao(e.target.value)} />
              </div>
              <Button className="w-full" onClick={() => createMutation.mutate()} disabled={!contatoId || !dataHora || createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Criar Agendamento"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome do contato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="agendado">Agendado</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="realizado">Realizado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="holly-card-shadow border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Próximas Consultas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contato</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableSkeletonRows rows={5} columns={5} />
            </Table>
          ) : !filteredAgendamentos.length ? (
            <p className="text-muted-foreground">
              {agendamentos?.length ? "Nenhum agendamento encontrado com os filtros aplicados." : "Nenhum agendamento encontrado. Crie o primeiro!"}
            </p>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contato</TableHead>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAgendamentos.map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.contatos?.name || "—"}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            {format(new Date(a.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </TableCell>
                        <TableCell><Badge variant={statusColor(a.status)}>{a.status ?? "agendado"}</Badge></TableCell>
                        <TableCell>
                          {a.link_reuniao ? (
                            <a href={a.link_reuniao} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                              <ExternalLink className="h-3.5 w-3.5" /> Abrir
                            </a>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Select onValueChange={(v) => updateStatusMutation.mutate({ id: a.id, status: v })}>
                            <SelectTrigger className="w-[130px] h-8 text-xs inline-flex">
                              <SelectValue placeholder="Alterar status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="agendado">Agendado</SelectItem>
                              <SelectItem value="confirmado">Confirmado</SelectItem>
                              <SelectItem value="realizado">Realizado</SelectItem>
                              <SelectItem value="cancelado">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir agendamento?</AlertDialogTitle>
                                <AlertDialogDescription>Esta ação não pode ser desfeita. O agendamento será removido permanentemente.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMutation.mutate(a.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {filteredAgendamentos.map((a: any) => (
                  <div key={a.id} className="rounded-lg border border-border/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{a.contatos?.name || "—"}</span>
                      <Badge variant={statusColor(a.status)}>{a.status ?? "agendado"}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {format(new Date(a.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                    {a.link_reuniao && (
                      <a href={a.link_reuniao} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm">
                        <ExternalLink className="h-3.5 w-3.5" /> Link da reunião
                      </a>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <Select onValueChange={(v) => updateStatusMutation.mutate({ id: a.id, status: v })}>
                        <SelectTrigger className="h-8 text-xs flex-1">
                          <SelectValue placeholder="Alterar status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agendado">Agendado</SelectItem>
                          <SelectItem value="confirmado">Confirmado</SelectItem>
                          <SelectItem value="realizado">Realizado</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir agendamento?</AlertDialogTitle>
                            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(a.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
