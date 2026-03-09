import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSignature } from "lucide-react";

export default function Contratos() {
  useEffect(() => { document.title = "Contratos — Holly AI"; }, []);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight font-display">Contratos</h2>
      </div>
      <Card className="holly-card-shadow border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-primary" />
            Documentos Gerados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Visualize e baixe os contratos de honorários e procurações gerados automaticamente para os leads quentes.</p>
        </CardContent>
      </Card>
    </div>
  );
}