import { useState } from "react";
import { useResidents } from "@/hooks/useResidents";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Stethoscope, HeartPulse, Activity, Users, Apple } from "lucide-react";
import { PsychologyAnamnese } from "@/components/atendimento/PsychologyAnamnese";
import { PsychologyAssessment } from "@/components/atendimento/PsychologyAssessment";
import { PsychologyEvolutions } from "@/components/atendimento/PsychologyEvolutions";
import { PsychologyAttendances } from "@/components/atendimento/PsychologyAttendances";
import { NutritionAssessment } from "@/components/atendimento/NutritionAssessment";
import { NutritionEvolutions } from "@/components/atendimento/NutritionEvolutions";
import { NutritionAttendances } from "@/components/atendimento/NutritionAttendances";
import { useUserRole } from "@/hooks/useUserRole";

const ALL_COMPETENCIAS = [
  { key: "psicologia", label: "Psicologia", icon: Brain, enabled: true, module: "atend:psicologia" as const },
  { key: "nutricao", label: "Nutricionista", icon: Apple, enabled: true, module: "atend:nutricao" as const },
  { key: "servico_social", label: "Serviço Social", icon: Users, enabled: false, module: null },
  { key: "enfermagem", label: "Enfermagem", icon: HeartPulse, enabled: false, module: null },
  { key: "medicina", label: "Medicina", icon: Stethoscope, enabled: false, module: null },
  { key: "fisioterapia", label: "Fisioterapia", icon: Activity, enabled: false, module: null },
];

export default function AtendimentoMultidisciplinar() {
  const { data: residents = [], isLoading } = useResidents();
  const [selectedResidentId, setSelectedResidentId] = useState<string>("");
  const { canAccess } = useUserRole();

  const competencias = ALL_COMPETENCIAS.filter((c) => {
    if (!c.enabled) return false;
    if (!c.module) return true;
    return canAccess(c.module);
  });

  // Also show disabled ones for UI completeness
  const disabledCompetencias = ALL_COMPETENCIAS.filter((c) => !c.enabled);
  const visibleCompetencias = [...competencias, ...disabledCompetencias];

  const [selectedCompetencia, setSelectedCompetencia] = useState(
    competencias.length > 0 ? competencias[0].key : "psicologia"
  );

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
          <div className="w-48 space-y-1 shrink-0">
            {visibleCompetencias.map((c) => {
              const isEnabled = c.enabled && competencias.some((cc) => cc.key === c.key);
              return (
                <button
                  key={c.key}
                  disabled={!isEnabled}
                  onClick={() => setSelectedCompetencia(c.key)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors ${
                    selectedCompetencia === c.key
                      ? "bg-primary text-primary-foreground font-semibold"
                      : isEnabled
                      ? "hover:bg-muted text-foreground"
                      : "opacity-40 cursor-not-allowed text-muted-foreground"
                  }`}
                >
                  <c.icon className="h-4 w-4" />
                  {c.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 min-w-0">
            {selectedCompetencia === "psicologia" && canAccess("atend:psicologia") && (
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
            {selectedCompetencia === "nutricao" && canAccess("atend:nutricao") && (
              <Tabs defaultValue="avaliacao">
                <TabsList className="mb-4">
                  <TabsTrigger value="avaliacao">1ª Avaliação Nutricional</TabsTrigger>
                  <TabsTrigger value="evolucoes">Evolução Nutricional</TabsTrigger>
                  <TabsTrigger value="atendimentos">Atendimentos</TabsTrigger>
                </TabsList>
                <TabsContent value="avaliacao">
                  <NutritionAssessment residentId={selectedResidentId} />
                </TabsContent>
                <TabsContent value="evolucoes">
                  <NutritionEvolutions residentId={selectedResidentId} />
                </TabsContent>
                <TabsContent value="atendimentos">
                  <NutritionAttendances residentId={selectedResidentId} />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
