import { useState } from "react";
import { useResidents } from "@/hooks/useResidents";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Stethoscope, HeartPulse, Activity, Users } from "lucide-react";
import { PsychologyAnamnese } from "@/components/atendimento/PsychologyAnamnese";
import { PsychologyAssessment } from "@/components/atendimento/PsychologyAssessment";
import { PsychologyEvolutions } from "@/components/atendimento/PsychologyEvolutions";
import { PsychologyAttendances } from "@/components/atendimento/PsychologyAttendances";

const COMPETENCIAS = [
  { key: "psicologia", label: "Psicologia", icon: Brain, enabled: true },
  { key: "servico_social", label: "Serviço Social", icon: Users, enabled: false },
  { key: "enfermagem", label: "Enfermagem", icon: HeartPulse, enabled: false },
  { key: "medicina", label: "Medicina", icon: Stethoscope, enabled: false },
  { key: "fisioterapia", label: "Fisioterapia", icon: Activity, enabled: false },
];

export default function AtendimentoMultidisciplinar() {
  const { data: residents = [], isLoading } = useResidents();
  const [selectedResidentId, setSelectedResidentId] = useState<string>("");
  const [selectedCompetencia, setSelectedCompetencia] = useState("psicologia");

  const activeResidents = residents.filter((r) => r.status === "ativo");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-wide text-foreground">
          Atendimento Multidisciplinar
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Prontuário multidisciplinar do residente
        </p>
      </div>

      {/* Resident selector */}
      <div className="max-w-md">
        <Select value={selectedResidentId} onValueChange={setSelectedResidentId}>
          <SelectTrigger>
            <SelectValue placeholder={isLoading ? "Carregando..." : "Selecione um residente"} />
          </SelectTrigger>
          <SelectContent>
            {activeResidents.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name} {r.nickname ? `(${r.nickname})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedResidentId ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Selecione um residente para acessar o prontuário multidisciplinar.
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-6">
          {/* Competências sidebar */}
          <div className="w-48 space-y-1 shrink-0">
            {COMPETENCIAS.map((c) => (
              <button
                key={c.key}
                disabled={!c.enabled}
                onClick={() => setSelectedCompetencia(c.key)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  selectedCompetencia === c.key
                    ? "bg-primary text-primary-foreground font-semibold"
                    : c.enabled
                    ? "hover:bg-muted text-foreground"
                    : "opacity-40 cursor-not-allowed text-muted-foreground"
                }`}
              >
                <c.icon className="h-4 w-4" />
                {c.label}
              </button>
            ))}
          </div>

          {/* Content area */}
          <div className="flex-1 min-w-0">
            {selectedCompetencia === "psicologia" && (
              <Tabs defaultValue="anamnese">
                <TabsList className="mb-4">
                  <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
                  <TabsTrigger value="avaliacao">1ª Avaliação</TabsTrigger>
                  <TabsTrigger value="evolucoes">Evoluções</TabsTrigger>
                  <TabsTrigger value="atendimentos">Atendimentos</TabsTrigger>
                </TabsList>
                <TabsContent value="anamnese">
                  <PsychologyAnamnese residentId={selectedResidentId} />
                </TabsContent>
                <TabsContent value="avaliacao">
                  <PsychologyAssessment residentId={selectedResidentId} />
                </TabsContent>
                <TabsContent value="evolucoes">
                  <PsychologyEvolutions residentId={selectedResidentId} />
                </TabsContent>
                <TabsContent value="atendimentos">
                  <PsychologyAttendances residentId={selectedResidentId} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
