import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileSignature, Plus, Trash2, Eye, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Contratos() {
  useEffect(() => { document.title = "Contratos — Holly AI"; }, []);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [viewContrato, setViewContrato] = useState<any>(null);
  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [contatoId, setContatoId] = useState("");

  const { data: contratos, isLoading } = useQuery({
    queryKey: ["contratos", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select("*, contatos(name, phone)")
        .order("created_at", { ascending: false });
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
      const { error } = await supabase.from("contratos").insert({
        advogado_id: user!.id,
        contato_id: contatoId,
        titulo,
        conteudo: conteudo || null,
        status: "gerado",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      toast.success("Contrato criado com sucesso!");
      setOpen(false);
      setTitulo("");
      setConteudo("");
      setContatoId("");
    },
    onError: () => toast.error("Erro ao criar contrato"),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("contratos").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      toast.success("Status atualizado!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contratos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      toast.success("Contrato removido!");
    },
  });

  const statusColor = (s: string | null) => {
    switch (s) {
      case "gerado": return "default";
      case "enviado": return "secondary";
      case "assinado": return "outline";
      default: return "default";
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight font-display">Contratos</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Novo Contrato</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Novo Contrato</DialogTitle></DialogHeader>
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
                <Label>Título</Label>
                <Input placeholder="Contrato de Honorários" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              </div>
              <div>
                <Label>Conteúdo</Label>
                <Textarea placeholder="Texto do contrato..." rows={6} value={conteudo} onChange={(e) => setConteudo(e.target.value)} />
              </div>
              <Button className="w-full" onClick={() => createMutation.mutate()} disabled={!contatoId || !titulo || createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Criar Contrato"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* View dialog */}
      <Dialog open={!!viewContrato} onOpenChange={() => setViewContrato(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewContrato?.titulo}</DialogTitle></DialogHeader>
          <div className="whitespace-pre-wrap text-sm text-foreground/80 mt-2">
            {viewContrato?.conteudo || "Sem conteúdo de texto."}
          </div>
          {viewContrato?.file_url && (
            <a href={viewContrato.file_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="mt-4"><Download className="h-4 w-4 mr-2" />Baixar Arquivo</Button>
            </a>
          )}
        </DialogContent>
      </Dialog>

      <Card className="holly-card-shadow border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-primary" />
            Documentos Gerados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : !contratos?.length ? (
            <p className="text-muted-foreground">Nenhum contrato encontrado. Crie o primeiro!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contratos.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.titulo}</TableCell>
                    <TableCell>{c.contatos?.name || "—"}</TableCell>
                    <TableCell>{format(new Date(c.created_at), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell><Badge variant={statusColor(c.status)}>{c.status ?? "gerado"}</Badge></TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewContrato(c)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Select onValueChange={(v) => updateStatusMutation.mutate({ id: c.id, status: v })}>
                        <SelectTrigger className="w-[120px] h-8 text-xs inline-flex">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gerado">Gerado</SelectItem>
                          <SelectItem value="enviado">Enviado</SelectItem>
                          <SelectItem value="assinado">Assinado</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteMutation.mutate(c.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
