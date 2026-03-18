import { useState } from "react";
import { useOTEvolutions, useCreateOTEvolution } from "@/hooks/useOTEvolutions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props {
  residentId: string;
}

export function OTEvolutions({ residentId }: Props) {
  const { data: evolutions = [], isLoading } = useOTEvolutions(residentId);
  const create = useCreateOTEvolution();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    functional_status: "",
    adl_progress: "",
    pia_goal_status: "",
    new_conduct: "",
  });

  const handleSubmit = async () => {
    try {
      await create.mutateAsync({ ...form, resident_id: residentId });
      toast.success("Evolução de TO registrada");
      setShowForm(false);
      setForm({ date: new Date().toISOString().split("T")[0], functional_status: "", adl_progress: "", pia_goal_status: "", new_conduct: "" });
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  if (isLoading) return <div className="p-4 text-muted-foreground text-sm">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Evoluções de Terapia Ocupacional</h3>
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
                <Label>Status Funcional</Label>
                <Select value={form.functional_status} onValueChange={(v) => setForm({ ...form, functional_status: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="melhorou">Melhorou</SelectItem>
                    <SelectItem value="estavel">Estável</SelectItem>
                    <SelectItem value="piorou">Piorou</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Progresso em AVDs</Label>
              <Textarea value={form.adl_progress} onChange={(e) => setForm({ ...form, adl_progress: e.target.value })} placeholder="Descreva o progresso nas atividades de vida diária..." rows={3} />
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
              <Textarea value={form.new_conduct} onChange={(e) => setForm({ ...form, new_conduct: e.target.value })} placeholder="Conduta proposta..." rows={3} />
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
                  <TableHead>Status Funcional</TableHead>
                  <TableHead>Progresso AVDs</TableHead>
                  <TableHead>Meta PIA</TableHead>
                  <TableHead>Conduta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evolutions.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{format(new Date(e.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{e.functional_status || "—"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{e.adl_progress || "—"}</TableCell>
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
