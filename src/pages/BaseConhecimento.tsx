import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";

export default function BaseConhecimento() {
  useEffect(() => { document.title = "Base de Conhecimento — Holly AI"; }, []);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight font-display">Base de Conhecimento</h2>
      </div>
      <Card className="holly-card-shadow border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            Treinamento da IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Faça upload de PDFs com teses jurídicas e procedimentos do escritório para treinar a Holly AI (RAG).</p>
        </CardContent>
      </Card>
    </div>
  );
}