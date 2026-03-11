import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BrainCircuit, Upload, Trash2, FileText, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BaseConhecimento() {
  useEffect(() => { document.title = "Base de Conhecimento — Holly AI"; }, []);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: documents, isLoading } = useQuery({
    queryKey: ["kb_documents", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kb_documents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const uploadAndCreate = async () => {
    if (!file || !titulo) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user!.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("knowledge_base")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("knowledge_base")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("kb_documents").insert({
        advogado_id: user!.id,
        titulo,
        file_url: urlData.publicUrl,
      });
      if (insertError) throw insertError;

      queryClient.invalidateQueries({ queryKey: ["kb_documents"] });
      toast.success("Documento adicionado à base de conhecimento!");
      setOpen(false);
      setTitulo("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      toast.error("Erro ao fazer upload do documento");
    } finally {
      setUploading(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (doc: { id: string; file_url: string | null }) => {
      // Try to remove file from storage
      if (doc.file_url) {
        const path = doc.file_url.split("/knowledge_base/")[1];
        if (path) {
          await supabase.storage.from("knowledge_base").remove([path]);
        }
      }
      const { error } = await supabase.from("kb_documents").delete().eq("id", doc.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kb_documents"] });
      toast.success("Documento removido!");
    },
    onError: () => toast.error("Erro ao remover documento"),
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight font-display">Base de Conhecimento</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Upload className="h-4 w-4 mr-2" />Upload de Documento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Adicionar Documento</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Título do Documento</Label>
                <Input placeholder="Ex: Tese de Aposentadoria Especial" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              </div>
              <div>
                <Label>Arquivo (PDF)</Label>
                <Input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>
              <Button className="w-full" onClick={uploadAndCreate} disabled={!titulo || !file || uploading}>
                {uploading ? "Enviando..." : "Enviar Documento"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="holly-card-shadow border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            Documentos para Treinamento da IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : !documents?.length ? (
            <p className="text-muted-foreground">Nenhum documento na base. Faça upload do primeiro PDF!</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Data de Upload</TableHead>
                  <TableHead>Arquivo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      {doc.titulo}
                    </TableCell>
                    <TableCell>{format(new Date(doc.created_at), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell>
                      {doc.file_url ? (
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                          <ExternalLink className="h-3.5 w-3.5" /> Ver
                        </a>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
                            <AlertDialogDescription>Esta ação não pode ser desfeita. O documento será removido permanentemente.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate({ id: doc.id, file_url: doc.file_url })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
