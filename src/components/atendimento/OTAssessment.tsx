import { useState, useEffect } from "react";
import { useOTAssessment, useUpsertOTAssessment, OTAssessment as OTAType } from "@/hooks/useOTAssessments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { toast } from "sonner";

interface Props {
  residentId: string;
}

export function OTAssessment({ residentId }: Props) {
  const { data: existing, isLoading } = useOTAssessment(residentId);
  const upsert = useUpsertOTAssessment();

  const [form, setForm] = useState<Partial<OTAType>>({
    date: new Date().toISOString().split("T")[0],
    functional_independence_level: null,
    adl_evaluation: null,
    cognitive_motor_screening: null,
    leisure_interests: null,
    environmental_adaptation_needs: null,
    pia_ot_goals: null,
    initial_ot_synthesis: null,
  });

  useEffect(() => {
    if (existing) setForm(existing);
  }, [existing]);

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({ ...form, resident_id: residentId } as any);
      toast.success("Avaliação de TO salva");
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  if (isLoading) return <div className="p-4 text-muted-foreground text-sm">Carregando...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">A) Avaliação Funcional</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data da Avaliação</Label>
              <Input type="date" value={form.date || ""} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Nível de Independência Funcional</Label>
              <Select value={form.functional_independence_level || ""} onValueChange={(v) => setForm({ ...form, functional_independence_level: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="independente">Independente</SelectItem>
                  <SelectItem value="supervisao">Necessita supervisão</SelectItem>
                  <SelectItem value="assistencia_minima">Assistência mínima</SelectItem>
                  <SelectItem value="assistencia_moderada">Assistência moderada</SelectItem>
                  <SelectItem value="dependente">Dependente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Avaliação de AVDs (Atividades de Vida Diária)</Label>
            <Textarea
              value={form.adl_evaluation || ""}
              onChange={(e) => setForm({ ...form, adl_evaluation: e.target.value })}
              placeholder="Descreva a capacidade do residente em AVDs básicas e instrumentais (alimentação, higiene, vestuário, mobilidade, etc.)..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">B) Rastreio Cognitivo-Motor</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Rastreio Cognitivo e Motor</Label>
            <Textarea
              value={form.cognitive_motor_screening || ""}
              onChange={(e) => setForm({ ...form, cognitive_motor_screening: e.target.value })}
              placeholder="Observações sobre cognição, coordenação motora, praxias, equilíbrio..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">C) Interesses e Adaptações</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Interesses de Lazer / Atividades Significativas</Label>
            <Textarea
              value={form.leisure_interests || ""}
              onChange={(e) => setForm({ ...form, leisure_interests: e.target.value })}
              placeholder="Atividades que o residente gosta ou gostaria de realizar..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Necessidades de Adaptação Ambiental</Label>
            <Textarea
              value={form.environmental_adaptation_needs || ""}
              onChange={(e) => setForm({ ...form, environmental_adaptation_needs: e.target.value })}
              placeholder="Adaptações necessárias no ambiente institucional (barras, rampas, utensílios adaptados, etc.)..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">D) Conclusão para o PIA</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Síntese Inicial de Terapia Ocupacional</Label>
            <Textarea
              value={form.initial_ot_synthesis || ""}
              onChange={(e) => setForm({ ...form, initial_ot_synthesis: e.target.value })}
              placeholder="Conclusão da avaliação inicial..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Metas para o PIA (Terapia Ocupacional)</Label>
            <Textarea
              value={form.pia_ot_goals || ""}
              onChange={(e) => setForm({ ...form, pia_ot_goals: e.target.value })}
              placeholder="Metas terapêuticas ocupacionais..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={upsert.isPending}>
          <Save className="h-4 w-4 mr-1" /> {upsert.isPending ? "Salvando..." : "Salvar Avaliação"}
        </Button>
      </div>
    </div>
  );
}
