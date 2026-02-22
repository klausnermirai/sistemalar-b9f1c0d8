import { useCandidateCounts } from "@/hooks/useCandidates";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, MessageSquare, Clock, Home, Archive, Briefcase, Stethoscope, Handshake } from "lucide-react";

const stages = [
  { key: "agendamento", label: "Agendamentos", icon: CalendarDays },
  { key: "entrevista", label: "Entrevistas", icon: MessageSquare },
  { key: "lista_espera", label: "Fila de Espera", icon: Clock },
  { key: "decisao_diretoria", label: "Diretoria", icon: Briefcase },
  { key: "avaliacao_medica", label: "Parecer Médico", icon: Stethoscope },
  { key: "integracao", label: "Integração", icon: Handshake },
  { key: "acolhido", label: "Acolhidos", icon: Home },
  { key: "arquivado", label: "Arquivados", icon: Archive },
] as const;

export function StatusCards() {
  const { data: counts } = useCandidateCounts();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
      {stages.map((s) => (
        <Card key={s.key} className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">
              {counts?.[s.key] ?? 0}
            </p>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {s.label}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
