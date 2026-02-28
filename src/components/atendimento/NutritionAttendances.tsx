import { useState } from "react";
import { useNutritionAttendances, useCreateNutritionAttendance } from "@/hooks/useNutritionAttendances";
import { useProfile } from "@/hooks/useProfile";
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

export function NutritionAttendances({ residentId }: Props) {
  const { data: attendances = [], isLoading } = useNutritionAttendances(residentId);
  const create = useCreateNutritionAttendance();
  const { profile } = useProfile();
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    date_time: new Date().toISOString().slice(0, 16),
    visit_reason: "",
    attendance_notes: "",
    mural_notes: "",
    signature: profile?.full_name || "",
  });

  const handleSubmit = async () => {
    try {
      await create.mutateAsync({
        ...form,
        resident_id: residentId,
        signature: profile?.full_name || "Profissional",
      });
      toast.success("Atendimento registrado");
      setShowForm(false);
      setForm({
        date_time: new Date().toISOString().slice(0, 16),
        visit_reason: "",
        attendance_notes: "",
        mural_notes: "",
        signature: profile?.full_name || "",
      });
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  if (isLoading) return <div className="p-4 text-muted-foreground text-sm">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Atendimentos</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Novo Atendimento
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Registrar Atendimento</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data/Hora</Label>
                <Input type="datetime-local" value={form.date_time} onChange={(e) => setForm({ ...form, date_time: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Motivo do Registro</Label>
                <Select value={form.visit_reason} onValueChange={(v) => setForm({ ...form, visit_reason: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visita_rotina">Visita de rotina</SelectItem>
                    <SelectItem value="queixa_residente">Queixa do residente</SelectItem>
                    <SelectItem value="solicitacao_enfermagem">Solicitação da enfermagem</SelectItem>
                    <SelectItem value="recusa_alimentar">Recusa alimentar pontual</SelectItem>
                    <SelectItem value="alteracao_intestinal">Alteração intestinal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Anotação / Conduta do Dia</Label>
              <Textarea value={form.attendance_notes} onChange={(e) => setForm({ ...form, attendance_notes: e.target.value })} placeholder="Registro profissional do atendimento..." rows={4} />
            </div>

            {/* Mural */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-4 space-y-2">
                <Label className="text-blue-700 font-semibold text-xs uppercase tracking-wider">📋 Compartilhar no Mural (visível para equipe)</Label>
                <Textarea value={form.mural_notes} onChange={(e) => setForm({ ...form, mural_notes: e.target.value })} placeholder="Observações para compartilhar com a equipe..." rows={3} />
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

      {attendances.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum atendimento registrado</p>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Anotação</TableHead>
                  <TableHead>Mural</TableHead>
                  <TableHead>Assinatura</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendances.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="whitespace-nowrap">{format(new Date(a.date_time), "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell>{a.visit_reason || "—"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{a.attendance_notes || "—"}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{a.mural_notes || "—"}</TableCell>
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
