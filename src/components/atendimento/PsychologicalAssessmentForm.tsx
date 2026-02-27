import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const EMOTIONAL_REACTIONS = ["Apatia", "Tristeza", "Agressividade", "Ansiedade", "Tranquilidade"];

interface FormData {
  id?: string;
  resident_id: string;
  date: string;
  institutionalization_awareness: string;
  initial_emotional_reaction: string[];
  recent_griefs_and_losses: string;
  traumas_and_emotional_triggers: string;
  orientation_level: string;
  mood_screening_gds: string;
  cognitive_screening_mmse: number | null;
  family_bond_quality: string;
  visit_expectations: string;
  initial_psychological_synthesis: string;
  pia_psychological_goals: string;
}

interface Props {
  residentId: string;
  existingData: any | null;
  isAnamnese?: boolean;
  onSave: (data: any) => Promise<void>;
  isSaving: boolean;
}

export function PsychologicalAssessmentForm({ residentId, existingData, isAnamnese, onSave, isSaving }: Props) {
  const [form, setForm] = useState<FormData>({
    resident_id: residentId,
    date: new Date().toISOString().split("T")[0],
    institutionalization_awareness: "",
    initial_emotional_reaction: [],
    recent_griefs_and_losses: "",
    traumas_and_emotional_triggers: "",
    orientation_level: "",
    mood_screening_gds: "",
    cognitive_screening_mmse: null,
    family_bond_quality: "",
    visit_expectations: "",
    initial_psychological_synthesis: "",
    pia_psychological_goals: "",
  });

  useEffect(() => {
    if (existingData) {
      setForm({
        ...existingData,
        initial_emotional_reaction: existingData.initial_emotional_reaction || [],
        resident_id: residentId,
      });
    }
  }, [existingData, residentId]);

  const handleReactionToggle = (reaction: string) => {
    setForm((prev) => ({
      ...prev,
      initial_emotional_reaction: prev.initial_emotional_reaction.includes(reaction)
        ? prev.initial_emotional_reaction.filter((r) => r !== reaction)
        : [...prev.initial_emotional_reaction, reaction],
    }));
  };

  const handleSubmit = async () => {
    try {
      await onSave(form);
      toast.success(isAnamnese ? "Anamnese salva com sucesso" : "Avaliação salva com sucesso");
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const hasTraumas = !!form.traumas_and_emotional_triggers?.trim();

  return (
    <div className="space-y-6">
      {/* Section A */}
      <Card>
        <CardHeader><CardTitle className="text-base">A — Histórico e Estado Emocional</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Consciência da Institucionalização</Label>
              <Select value={form.institutionalization_awareness} onValueChange={(v) => setForm({ ...form, institutionalization_awareness: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vontade_propria">Vontade própria</SelectItem>
                  <SelectItem value="persuadido">Persuadido pela família</SelectItem>
                  <SelectItem value="resistencia">Com resistência</SelectItem>
                  <SelectItem value="incapaz">Incapaz de opinar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reação Emocional Inicial</Label>
            <div className="flex flex-wrap gap-3">
              {EMOTIONAL_REACTIONS.map((r) => (
                <label key={r} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={form.initial_emotional_reaction.includes(r)} onCheckedChange={() => handleReactionToggle(r)} />
                  {r}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Lutos e Perdas Recentes</Label>
            <Textarea value={form.recent_griefs_and_losses} onChange={(e) => setForm({ ...form, recent_griefs_and_losses: e.target.value })} placeholder="Descreva lutos, perdas significativas..." />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Traumas e Gatilhos Emocionais
              {hasTraumas && <AlertTriangle className="h-4 w-4 text-destructive" />}
            </Label>
            <Textarea
              value={form.traumas_and_emotional_triggers}
              onChange={(e) => setForm({ ...form, traumas_and_emotional_triggers: e.target.value })}
              placeholder="Registre traumas identificados e possíveis gatilhos..."
              className={hasTraumas ? "border-destructive" : ""}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section B */}
      <Card>
        <CardHeader><CardTitle className="text-base">B — Rastreio Cognitivo e Humor</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Nível de Orientação</Label>
              <Select value={form.orientation_level} onValueChange={(v) => setForm({ ...form, orientation_level: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="orientado">Orientado</SelectItem>
                  <SelectItem value="parcialmente_orientado">Parcialmente orientado</SelectItem>
                  <SelectItem value="desorientado">Desorientado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rastreio de Humor (GDS)</Label>
              <Select value={form.mood_screening_gds} onValueChange={(v) => setForm({ ...form, mood_screening_gds: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sem_depressao">Sem depressão</SelectItem>
                  <SelectItem value="depressao_leve">Depressão leve</SelectItem>
                  <SelectItem value="depressao_moderada">Depressão moderada</SelectItem>
                  <SelectItem value="depressao_grave">Depressão grave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rastreio Cognitivo (Mini-Mental)</Label>
              <Input
                type="number"
                min={0}
                max={30}
                value={form.cognitive_screening_mmse ?? ""}
                onChange={(e) => setForm({ ...form, cognitive_screening_mmse: e.target.value ? Number(e.target.value) : null })}
                placeholder="0-30"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section C */}
      <Card>
        <CardHeader><CardTitle className="text-base">C — Rede de Apoio e Vínculo</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Qualidade do Vínculo Familiar</Label>
              <Select value={form.family_bond_quality} onValueChange={(v) => setForm({ ...form, family_bond_quality: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="forte">Forte</SelectItem>
                  <SelectItem value="moderado">Moderado</SelectItem>
                  <SelectItem value="fraco">Fraco</SelectItem>
                  <SelectItem value="rompido">Rompido</SelectItem>
                  <SelectItem value="sem_familia">Sem família conhecida</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Expectativa de Visitas</Label>
            <Textarea value={form.visit_expectations} onChange={(e) => setForm({ ...form, visit_expectations: e.target.value })} placeholder="O que o residente espera em relação às visitas..." />
          </div>
        </CardContent>
      </Card>

      {/* Section D */}
      <Card>
        <CardHeader><CardTitle className="text-base">D — Conclusão e PIA</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Síntese Psicológica Inicial</Label>
            <Textarea value={form.initial_psychological_synthesis} onChange={(e) => setForm({ ...form, initial_psychological_synthesis: e.target.value })} placeholder="Síntese da avaliação psicológica..." rows={4} />
          </div>
          <div className="space-y-2">
            <Label>Metas Psicológicas para o PIA</Label>
            <Textarea value={form.pia_psychological_goals} onChange={(e) => setForm({ ...form, pia_psychological_goals: e.target.value })} placeholder="Metas que alimentarão o PIA..." rows={4} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
