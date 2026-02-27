import { useState } from "react";
import { usePsychologyEvolutions, useCreatePsychologyEvolution, PsychologyEvolution } from "@/hooks/usePsychologyEvolutions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const SOCIALIZATION_OPTIONS = [
  "Participação em atividades coletivas",
  "Interação com colegas",
  "Isolamento social",
  "Conflitos interpessoais",
  "Vínculo com equipe",
];

interface Props {
  residentId: string;
}

export function PsychologyEvolutions({ residentId }: Props) {
  const { data: evolutions = [], isLoading } = usePsychologyEvolutions(residentId);
  const create = useCreatePsychologyEvolution();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    institutional_adaptation_status: "",
    mood_behavior_evolution: "",
    current_socialization_quality: [] as string[],
    pia_goal_status: "",
    new_conduct: "",
  });

  const handleSocToggle = (opt: string) => {
    setForm((prev) => ({
      ...prev,
      current_socialization_quality: prev.current_socialization_quality.includes(opt)
        ? prev.current_socialization_quality.filter((o) => o !== opt)
        : [...prev.current_socialization_quality, opt],
    }));
  };

  const handleSubmit = async () => {
    try {
      await create.mutateAsync({ ...form, resident_id: residentId });
      toast.success("Evolução registrada");
      setShowForm(false);
      setForm({
        date: new Date().toISOString().split("T")[0],
        institutional_adaptation_status: "",
        mood_behavior_evolution: "",
        current_socialization_quality: [],
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
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Evoluções Psicológicas</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Nova Evolução
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Registrar Evolução</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Status de Adaptação Institucional</Label>
                <Select value={form.institutional_adaptation_status} onValueChange={(v) => setForm({ ...form, institutional_adaptation_status: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adaptado">Adaptado</SelectItem>
                    <SelectItem value="em_adaptacao">Em adaptação</SelectItem>
                    <SelectItem value="dificuldade">Com dificuldade</SelectItem>
                    <SelectItem value="resistente">Resistente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Evolução de Humor e Comportamento</Label>
              <Textarea value={form.mood_behavior_evolution} onChange={(e) => setForm({ ...form, mood_behavior_evolution: e.target.value })} placeholder="Descreva a evolução..." />
            </div>

            <div className="space-y-2">
              <Label>Qualidade da Socialização</Label>
              <div className="flex flex-wrap gap-3">
                {SOCIALIZATION_OPTIONS.map((o) => (
                  <label key={o} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={form.current_socialization_quality.includes(o)} onCheckedChange={() => handleSocToggle(o)} />
                    {o}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status da Meta do PIA</Label>
              <Select value={form.pia_goal_status} onValueChange={(v) => setForm({ ...form, pia_goal_status: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="em_andamento">Em andamento</SelectItem>
                  <SelectItem value="atingida">Atingida</SelectItem>
                  <SelectItem value="parcialmente_atingida">Parcialmente atingida</SelectItem>
                  <SelectItem value="nao_atingida">Não atingida</SelectItem>
                  <SelectItem value="revisada">Revisada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nova Conduta</Label>
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
                  <TableHead>Adaptação</TableHead>
                  <TableHead>Meta PIA</TableHead>
                  <TableHead>Conduta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evolutions.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{format(new Date(e.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{e.institutional_adaptation_status || "—"}</TableCell>
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
