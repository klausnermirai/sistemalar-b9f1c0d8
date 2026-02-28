import { useState, useMemo } from "react";
import { useNutritionEvolutions, useCreateNutritionEvolution } from "@/hooks/useNutritionEvolutions";
import { useNutritionAssessment } from "@/hooks/useNutritionAssessments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props {
  residentId: string;
}

export function NutritionEvolutions({ residentId }: Props) {
  const { data: evolutions = [], isLoading } = useNutritionEvolutions(residentId);
  const { data: assessment } = useNutritionAssessment(residentId);
  const create = useCreateNutritionEvolution();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    current_weight: null as number | null,
    food_acceptance: "",
    consistency_change: false,
    consistency_change_justification: "",
    pia_goal_status: "",
    new_conduct: "",
  });

  // Calculate weight variation
  const weightVariation = useMemo(() => {
    if (!form.current_weight) return null;
    // Get previous weight: last evolution or initial assessment
    let prevWeight: number | null = null;
    if (evolutions.length > 0 && evolutions[0].current_weight) {
      prevWeight = evolutions[0].current_weight;
    } else if (assessment?.weight_kg) {
      prevWeight = assessment.weight_kg;
    }
    if (!prevWeight) return null;
    return +((form.current_weight - prevWeight) / prevWeight * 100).toFixed(1);
  }, [form.current_weight, evolutions, assessment]);

  const weightAlert = weightVariation != null && weightVariation < -5;

  const handleSubmit = async () => {
    try {
      await create.mutateAsync({
        ...form,
        resident_id: residentId,
        weight_variation_percent: weightVariation,
        weight_alert: weightAlert,
      });
      toast.success("Evolução nutricional registrada");
      setShowForm(false);
      setForm({
        date: new Date().toISOString().split("T")[0],
        current_weight: null,
        food_acceptance: "",
        consistency_change: false,
        consistency_change_justification: "",
        pia_goal_status: "",
        new_conduct: "",
      });
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  if (isLoading) return <div className="p-4 text-muted-foreground text-sm">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Evoluções Nutricionais</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Nova Evolução
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Registrar Evolução</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Peso Atual (kg)</Label>
                <Input type="number" step="0.1" value={form.current_weight ?? ""} onChange={(e) => setForm({ ...form, current_weight: e.target.value ? parseFloat(e.target.value) : null })} />
              </div>
              <div className="space-y-2">
                <Label>Variação de Peso</Label>
                <div className="flex items-center gap-2 h-10">
                  <span className={`text-lg font-bold ${weightAlert ? "text-destructive" : ""}`}>
                    {weightVariation != null ? `${weightVariation > 0 ? "+" : ""}${weightVariation}%` : "—"}
                  </span>
                  {weightAlert && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Perda &gt; 5%
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Aceitação Alimentar</Label>
              <Select value={form.food_acceptance} onValueChange={(v) => setForm({ ...form, food_acceptance: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="excelente">Excelente</SelectItem>
                  <SelectItem value="boa">Boa</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="ruim">Ruim</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox checked={form.consistency_change} onCheckedChange={(c) => setForm({ ...form, consistency_change: !!c })} />
                <Label className="text-sm">Houve mudança de consistência/via?</Label>
              </div>
              {form.consistency_change && (
                <Textarea value={form.consistency_change_justification} onChange={(e) => setForm({ ...form, consistency_change_justification: e.target.value })} placeholder="Justificativa da mudança..." />
              )}
            </div>

            <div className="space-y-2">
              <Label>Status da Meta do PIA</Label>
              <Select value={form.pia_goal_status} onValueChange={(v) => setForm({ ...form, pia_goal_status: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="atingida">Atingida</SelectItem>
                  <SelectItem value="em_andamento">Em andamento</SelectItem>
                  <SelectItem value="nao_atingida">Não atingida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nova Conduta / Ajuste de Plano</Label>
              <Textarea value={form.new_conduct} onChange={(e) => setForm({ ...form, new_conduct: e.target.value })} placeholder="Conduta proposta..." />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={create.isPending}>
                <Save className="h-4 w-4 mr-1" /> {create.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {evolutions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhuma evolução registrada</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Variação</TableHead>
                  <TableHead>Aceitação</TableHead>
                  <TableHead>Meta PIA</TableHead>
                  <TableHead>Conduta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evolutions.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{format(new Date(e.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{e.current_weight ? `${e.current_weight} kg` : "—"}</TableCell>
                    <TableCell>
                      <span className={e.weight_alert ? "text-destructive font-bold" : ""}>
                        {e.weight_variation_percent != null ? `${e.weight_variation_percent > 0 ? "+" : ""}${e.weight_variation_percent}%` : "—"}
                      </span>
                      {e.weight_alert && <Badge variant="destructive" className="ml-1 text-xs">Alerta</Badge>}
                    </TableCell>
                    <TableCell>{e.food_acceptance || "—"}</TableCell>
                    <TableCell>{e.pia_goal_status || "—"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{e.new_conduct || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
