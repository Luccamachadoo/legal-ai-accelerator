import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export default function Agendamentos() {
  useEffect(() => { document.title = "Agendamentos — Holly AI"; }, []);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight font-display">Agendamentos</h2>
      </div>
      <Card className="holly-card-shadow border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Próximas Consultas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aqui você gerencia as consultas agendadas automaticamente pela inteligência artificial.</p>
        </CardContent>
      </Card>
    </div>
  );
}