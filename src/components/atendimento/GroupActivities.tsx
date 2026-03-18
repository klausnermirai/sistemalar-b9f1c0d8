import { useState } from "react";
import { useGroupActivities, useCreateGroupActivity } from "@/hooks/useGroupActivities";
import { useResidents } from "@/hooks/useResidents";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const COMPETENCY_LABELS: Record<string, string> = {
  psicologia: "Psicologia",
  nutricao: "Nutrição",
  terapia_ocupacional: "Terapia Ocupacional",
  multidisciplinar: "Multidisciplinar",
};

export function GroupActivities() {
  const { data: activities = [], isLoading } = useGroupActivities();
  const { data: residents = [] } = useResidents();
  const create = useCreateGroupActivity();
  const { profile } = useProfile();
  const [showForm, setShowForm] = useState(false);

  const activeResidents = residents.filter((r) => r.status === "ativo");

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    time_start: "",
    time_end: "",
    competency: "",
    activity_title: "",
    activity_description: "",
    objectives: "",
    observations: "",
    mural_notes: "",
    signature: profile?.full_name || "",
  });

  const [selectedResidents, setSelectedResidents] = useState<string[]>([]);

  const toggleResident = (id: string) => {
    setSelectedResidents((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedResidents.length === activeResidents.length) {
      setSelectedResidents([]);
    } else {
      setSelectedResidents(activeResidents.map((r) => r.id));
    }
  };

  const handleSubmit = async () => {
    if (!form.activity_title) {
      toast.error("Informe o título da atividade");
      return;
    }
    try {
      await create.mutateAsync({
        activity: {
          ...form,
          signature: profile?.full_name || "Profissional",
        },
        participantIds: selectedResidents,
      });
      toast.success("Atividade em grupo registrada");
      setShowForm(false);
      setForm({
        date: new Date().toISOString().split("T")[0],
        time_start: "",
        time_end: "",
        competency: "",
        activity_title: "",
        activity_description: "",
        objectives: "",
        observations: "",
        mural_notes: "",
        signature: profile?.full_name || "",
      });
      setSelectedResidents([]);
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  if (isLoading) return <div className="p-4 text-muted-foreground text-sm">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Atividades em Grupo</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Nova Atividade
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Registrar Atividade em Grupo</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Hora Início</Label>
                <Input type="time" value={form.time_start} onChange={(e) => setForm({ ...form, time_start: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Hora Fim</Label>
                <Input type="time" value={form.time_end} onChange={(e) => setForm({ ...form, time_end: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Competência</Label>
                <Select value={form.competency} onValueChange={(v) => setForm({ ...form, competency: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="psicologia">Psicologia</SelectItem>
                    <SelectItem value="nutricao">Nutrição</SelectItem>
                    <SelectItem value="terapia_ocupacional">Terapia Ocupacional</SelectItem>
                    <SelectItem value="multidisciplinar">Multidisciplinar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Título da Atividade</Label>
              <Input value={form.activity_title} onChange={(e) => setForm({ ...form, activity_title: e.target.value })} placeholder="Ex: Roda de conversa, Oficina de memória..." />
            </div>

            <div className="space-y-2">
              <Label>Descrição da Atividade</Label>
              <Textarea value={form.activity_description} onChange={(e) => setForm({ ...form, activity_description: e.target.value })} placeholder="Descreva a atividade realizada..." rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Objetivos</Label>
              <Textarea value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} placeholder="Objetivos terapêuticos da atividade..." rows={2} />
            </div>

            {/* Participant Selection */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <UsersRound className="h-4 w-4" /> Participantes ({selectedResidents.length})
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={selectAll}>
                    {selectedResidents.length === activeResidents.length ? "Desmarcar todos" : "Selecionar todos"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {activeResidents.map((r) => (
                    <label key={r.id} className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-muted cursor-pointer">
                      <Checkbox
                        checked={selectedResidents.includes(r.id)}
                        onCheckedChange={() => toggleResident(r.id)}
                      />
                      {r.nickname || r.name}
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} placeholder="Observações gerais..." rows={2} />
            </div>

            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-4 space-y-2">
                <Label className="text-blue-700 font-semibold text-xs uppercase tracking-wider">📋 Compartilhar no Mural (visível para equipe)</Label>
                <Textarea value={form.mural_notes} onChange={(e) => setForm({ ...form, mural_notes: e.target.value })} placeholder="Observações para compartilhar com a equipe..." rows={2} />
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label>Assinatura</Label>
              <Input value={profile?.full_name || "Profissional"} disabled className="bg-muted" />
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

      {activities.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhuma atividade em grupo registrada</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Competência</TableHead>
                  <TableHead>Atividade</TableHead>
                  <TableHead>Objetivos</TableHead>
                  <TableHead>Assinatura</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{format(new Date(a.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {a.time_start && a.time_end ? `${a.time_start} – ${a.time_end}` : a.time_start || "—"}
                    </TableCell>
                    <TableCell>
                      {a.competency && COMPETENCY_LABELS[a.competency] ? (
                        <Badge variant="outline" className="text-xs">{COMPETENCY_LABELS[a.competency]}</Badge>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="font-medium">{a.activity_title || "—"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{a.objectives || "—"}</TableCell>
                    <TableCell>{a.signature || "—"}</TableCell>
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
