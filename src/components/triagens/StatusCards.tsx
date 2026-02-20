import { useCandidateCounts } from "@/hooks/useCandidates";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, MessageSquare, Clock, Home, Archive } from "lucide-react";

const stages = [
  { key: "agendamento", label: "Agendamentos", icon: CalendarDays, enabled: true },
  { key: "entrevista", label: "Entrevistas", icon: MessageSquare, enabled: true },
  { key: "lista_espera", label: "Lista de Espera", icon: Clock, enabled: false },
  { key: "acolhido", label: "Acolhidos", icon: Home, enabled: false },
  { key: "arquivado", label: "Arquivados", icon: Archive, enabled: false },
] as const;

export function StatusCards() {
  const { data: counts } = useCandidateCounts();

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stages.map((s) => (
        <Card
          key={s.key}
          className={`transition-shadow ${s.enabled ? "shadow-sm hover:shadow-md" : "opacity-50"}`}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              s.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">
                {counts?.[s.key] ?? 0}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
