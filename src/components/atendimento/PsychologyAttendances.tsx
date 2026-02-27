import { useState } from "react";
import { usePsychologyAttendances, useCreatePsychologyAttendance } from "@/hooks/usePsychologyAttendances";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Save, Lock, Eye } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props {
  residentId: string;
}

export function PsychologyAttendances({ residentId }: Props) {
  const { data: attendances = [], isLoading } = usePsychologyAttendances(residentId);
  const create = useCreatePsychologyAttendance();
  const { profile } = useProfile();
  const [showForm, setShowForm] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [privateUnlocked, setPrivateUnlocked] = useState(false);
  const [viewingPrivate, setViewingPrivate] = useState<string | null>(null);
  const [viewPasswordDialog, setViewPasswordDialog] = useState(false);
  const [viewPassword, setViewPassword] = useState("");
  const [pendingViewId, setPendingViewId] = useState<string | null>(null);

  const [form, setForm] = useState({
    date_time: new Date().toISOString().slice(0, 16),
    intervention_type: "",
    attendance_evolution: "",
    mural_notes: "",
    private_notes: "",
    needs_team_report: false,
    signature: profile?.full_name || "",
  });

  const handlePrivateAccess = () => {
    setPasswordDialog(true);
  };

  const confirmPrivateAccess = () => {
    if (password === "psi2024") {
      setPrivateUnlocked(true);
      setShowPrivate(true);
      setPasswordDialog(false);
      setPassword("");
    } else {
      toast.error("Senha incorreta");
    }
  };

  const handleViewPrivateNote = (id: string) => {
    setPendingViewId(id);
    setViewPasswordDialog(true);
  };

  const confirmViewPrivate = () => {
    if (viewPassword === "psi2024") {
      setViewingPrivate(pendingViewId);
      setViewPasswordDialog(false);
      setViewPassword("");
    } else {
      toast.error("Senha incorreta");
    }
  };

  const handleSubmit = async () => {
    try {
      await create.mutateAsync({
        ...form,
        resident_id: residentId,
        signature: profile?.full_name || "Profissional",
      });
      toast.success("Atendimento registrado");
      setShowForm(false);
      setShowPrivate(false);
      setPrivateUnlocked(false);
      setForm({
        date_time: new Date().toISOString().slice(0, 16),
        intervention_type: "",
        attendance_evolution: "",
        mural_notes: "",
        private_notes: "",
        needs_team_report: false,
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
                <Label>Tipo de Intervenção</Label>
                <Select value={form.intervention_type} onValueChange={(v) => setForm({ ...form, intervention_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acolhimento_individual">Acolhimento individual</SelectItem>
                    <SelectItem value="observacao">Observação</SelectItem>
                    <SelectItem value="crise">Crise</SelectItem>
                    <SelectItem value="mediacao">Mediação</SelectItem>
                    <SelectItem value="orientacao_familiar">Orientação familiar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Prontuário */}
            <div className="space-y-2">
              <Label>Anotação do Prontuário</Label>
              <Textarea value={form.attendance_evolution} onChange={(e) => setForm({ ...form, attendance_evolution: e.target.value })} placeholder="Registro profissional do atendimento..." rows={4} />
            </div>

            {/* Mural */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-4 space-y-2">
                <Label className="text-blue-700 font-semibold text-xs uppercase tracking-wider">📋 Compartilhar no Mural (visível para equipe)</Label>
                <Textarea value={form.mural_notes} onChange={(e) => setForm({ ...form, mural_notes: e.target.value })} placeholder="Observações para compartilhar com a equipe..." rows={3} />
              </CardContent>
            </Card>

            {/* Sigiloso */}
            <Card className="border-destructive/30 bg-destructive/5">
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-destructive font-semibold text-xs uppercase tracking-wider flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Anotação Sigilosa (somente Psicologia)
                  </Label>
                  {!privateUnlocked && (
                    <Button variant="outline" size="sm" onClick={handlePrivateAccess}>
                      <Lock className="h-3 w-3 mr-1" /> Desbloquear
                    </Button>
                  )}
                </div>
                {privateUnlocked ? (
                  <Textarea value={form.private_notes} onChange={(e) => setForm({ ...form, private_notes: e.target.value })} placeholder="Registro sigiloso protegido..." rows={3} />
                ) : (
                  <p className="text-xs text-muted-foreground">Clique em "Desbloquear" para acessar a área sigilosa.</p>
                )}
              </CardContent>
            </Card>

            <div className="flex items-center gap-2">
              <Checkbox checked={form.needs_team_report} onCheckedChange={(c) => setForm({ ...form, needs_team_report: !!c })} />
              <Label className="text-sm">Precisa de repasse à equipe</Label>
            </div>

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
                  <TableHead>Tipo</TableHead>
                  <TableHead>Evolução</TableHead>
                  <TableHead>Mural</TableHead>
                  <TableHead>Sigiloso</TableHead>
                  <TableHead>Repasse</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendances.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="whitespace-nowrap">{format(new Date(a.date_time), "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell>{a.intervention_type || "—"}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{a.attendance_evolution || "—"}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{a.mural_notes || "—"}</TableCell>
                    <TableCell>
                      {a.private_notes ? (
                        viewingPrivate === a.id ? (
                          <span className="text-xs">{a.private_notes}</span>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => handleViewPrivateNote(a.id)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                        )
                      ) : "—"}
                    </TableCell>
                    <TableCell>{a.needs_team_report ? "Sim" : "Não"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Password dialog for new record */}
      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Acesso Sigiloso</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Digite a senha da psicologia</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && confirmPrivateAccess()} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialog(false)}>Cancelar</Button>
            <Button onClick={confirmPrivateAccess}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password dialog for viewing */}
      <Dialog open={viewPasswordDialog} onOpenChange={setViewPasswordDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Visualizar Nota Sigilosa</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label>Digite a senha da psicologia</Label>
            <Input type="password" value={viewPassword} onChange={(e) => setViewPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && confirmViewPrivate()} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewPasswordDialog(false)}>Cancelar</Button>
            <Button onClick={confirmViewPrivate}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
