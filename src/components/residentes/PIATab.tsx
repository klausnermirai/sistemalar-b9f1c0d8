import { useState } from "react";
import { usePIA, usePIAGoals, usePIARevisions, useCreatePIA, useUpdatePIA, useCreatePIAGoal, useUpdatePIAGoal, useDeletePIAGoal, useCreatePIARevision, PIAGoal } from "@/hooks/usePIA";
import { usePsychologyAnamnesis } from "@/hooks/usePsychologyAnamnesis";
import { useNutritionAssessment } from "@/hooks/useNutritionAssessments";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Plus, FileText, Trash2, Save, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Props { residentId: string | null; residentName?: string; }

const statusLabels: Record<string, string> = { ativo: "Ativo", em_revisao: "Em Revisão", encerrado: "Encerrado" };
const goalStatusLabels: Record<string, string> = { em_andamento: "Em Andamento", atingida: "Atingida", nao_atingida: "Não Atingida" };

export function PIATab({ residentId, residentName }: Props) {
  const { data: pia, isLoading } = usePIA(residentId || undefined);
  const { data: goals = [] } = usePIAGoals(pia?.id);
  const { data: revisions = [] } = usePIARevisions(pia?.id);
  const { data: psyAnamnesis } = usePsychologyAnamnesis(residentId || undefined);
  const { data: nutAssessment } = useNutritionAssessment(residentId || undefined);
  const { profile } = useProfile();
  const latestNut = nutAssessment;

  const createPIA = useCreatePIA();
  const updatePIA = useUpdatePIA();
  const createGoal = useCreatePIAGoal();
  const updateGoal = useUpdatePIAGoal();
  const deleteGoal = useDeletePIAGoal();
  const createRevision = useCreatePIARevision();

  const [editFields, setEditFields] = useState<Record<string, any>>({});
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ competency: "psicologia", goal_text: "", review_deadline: "", observations: "" });
  const [revOpen, setRevOpen] = useState(false);
  const [revDesc, setRevDesc] = useState("");

  if (!residentId) return <p className="text-muted-foreground">Salve o residente antes de acessar o PIA.</p>;
  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;

  if (!pia) {
    return (
      <div className="flex flex-col items-center py-12 gap-4">
        <p className="text-muted-foreground">Nenhum PIA encontrado para este residente.</p>
        <Button onClick={() => createPIA.mutate(residentId, { onSuccess: () => toast.success("PIA criado!") })} disabled={createPIA.isPending} className="gap-2">
          <Plus className="h-4 w-4" /> Criar PIA
        </Button>
      </div>
    );
  }

  const handleSave = () => {
    if (Object.keys(editFields).length === 0) return;
    updatePIA.mutate({ id: pia.id, ...editFields }, {
      onSuccess: () => { toast.success("PIA salvo!"); setEditFields({}); },
      onError: () => toast.error("Erro ao salvar"),
    });
  };

  const handleAddGoal = () => {
    createGoal.mutate({ pia_id: pia.id, ...newGoal, status: "em_andamento" } as any, {
      onSuccess: () => { toast.success("Meta adicionada!"); setNewGoalOpen(false); setNewGoal({ competency: "psicologia", goal_text: "", review_deadline: "", observations: "" }); },
    });
  };

  const handleAddRevision = () => {
    createRevision.mutate({ pia_id: pia.id, revised_by: profile?.full_name || "Não identificado", changes_description: revDesc }, {
      onSuccess: () => { toast.success("Revisão registrada!"); setRevOpen(false); setRevDesc(""); },
    });
  };

  const handlePDF = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const goalsHtml = goals.map((g) => `<tr><td>${g.competency}</td><td>${g.goal_text}</td><td>${goalStatusLabels[g.status] || g.status}</td><td>${g.review_deadline || "—"}</td><td>${g.observations || "—"}</td></tr>`).join("");
    const revisionsHtml = revisions.map((r) => `<p><strong>${r.date}</strong> por ${r.revised_by}: ${r.changes_description}</p>`).join("");
    win.document.write(`<html><head><title>PIA - ${residentName}</title><style>body{font-family:sans-serif;padding:24px;max-width:800px;margin:0 auto;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ddd;padding:8px;text-align:left;}th{background:#f5f5f5;}</style></head><body>
      <h1>PIA — ${residentName}</h1><p>Status: ${statusLabels[pia.status]}</p><p>Criado: ${format(new Date(pia.created_at), "dd/MM/yyyy")}</p>
      <h2>Diagnóstico Multidisciplinar</h2>
      <p><strong>Psicologia:</strong> ${psyAnamnesis?.initial_psychological_synthesis || "Sem dados"}</p>
      <p><strong>Nutrição:</strong> ${(latestNut as any)?.nutritional_diagnosis || "Sem dados"}</p>
      <p><strong>Síntese da Equipe:</strong> ${pia.team_synthesis || "—"}</p>
      <h2>Metas</h2><table><tr><th>Competência</th><th>Meta</th><th>Status</th><th>Prazo</th><th>Obs</th></tr>${goalsHtml}</table>
      <h2>Intervenções</h2>
      <p><strong>Psicologia:</strong> ${pia.interventions_psychology || "—"}</p>
      <p><strong>Nutrição:</strong> ${pia.interventions_nutrition || "—"}</p>
      <p><strong>Outros:</strong> ${pia.interventions_other || "—"}</p>
      <h2>Revisões</h2>${revisionsHtml || "<p>Nenhuma revisão.</p>"}
    </body></html>`);
    win.document.close();
    win.print();
  };

  const getField = (key: string) => editFields[key] !== undefined ? editFields[key] : (pia as any)[key] || "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant={pia.status === "ativo" ? "default" : "secondary"}>{statusLabels[pia.status]}</Badge>
          <span className="text-xs text-muted-foreground">Criado em {format(new Date(pia.created_at), "dd/MM/yyyy")}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePDF} className="gap-2"><FileText className="h-4 w-4" /> PDF</Button>
          <Button size="sm" onClick={handleSave} disabled={updatePIA.isPending || Object.keys(editFields).length === 0} className="gap-2"><Save className="h-4 w-4" /> Salvar</Button>
        </div>
      </div>

      {/* A) Status */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-wider">Identificação</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1">
            <Label className="text-xs font-bold uppercase tracking-wider">Status</Label>
            <Select value={getField("status")} onValueChange={(v) => setEditFields((p) => ({ ...p, status: v }))}>
              <SelectTrigger className="w-48 rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="em_revisao">Em Revisão</SelectItem>
                <SelectItem value="encerrado">Encerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* B) Diagnostico */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-wider">Diagnóstico Multidisciplinar</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Psicologia (auto)</p>
            <p className="text-sm">{psyAnamnesis?.initial_psychological_synthesis || <span className="text-muted-foreground italic">Sem dados registrados</span>}</p>
            {psyAnamnesis?.pia_psychological_goals && <p className="text-sm"><strong>Metas:</strong> {psyAnamnesis.pia_psychological_goals}</p>}
          </div>
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nutrição (auto)</p>
            <p className="text-sm">{(latestNut as any)?.nutritional_diagnosis || <span className="text-muted-foreground italic">Sem dados registrados</span>}</p>
            {(latestNut as any)?.pia_nutritional_goals && <p className="text-sm"><strong>Metas:</strong> {(latestNut as any).pia_nutritional_goals}</p>}
          </div>
          <Separator />
          <div className="space-y-1">
            <Label className="text-xs font-bold uppercase tracking-wider">Síntese Geral da Equipe</Label>
            <Textarea value={getField("team_synthesis")} onChange={(e) => setEditFields((p) => ({ ...p, team_synthesis: e.target.value }))} rows={4} className="rounded-lg" />
          </div>
        </CardContent>
      </Card>

      {/* C) Metas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold uppercase tracking-wider">Metas por Competência</CardTitle>
          <Dialog open={newGoalOpen} onOpenChange={setNewGoalOpen}>
            <DialogTrigger asChild><Button size="sm" variant="outline" className="gap-1"><Plus className="h-4 w-4" /> Meta</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova Meta</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label className="text-xs font-bold uppercase">Competência</Label>
                  <Select value={newGoal.competency} onValueChange={(v) => setNewGoal((p) => ({ ...p, competency: v }))}>
                    <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="psicologia">Psicologia</SelectItem><SelectItem value="nutricao">Nutrição</SelectItem><SelectItem value="outros">Outros</SelectItem></SelectContent>
                  </Select></div>
                <div><Label className="text-xs font-bold uppercase">Meta</Label><Textarea value={newGoal.goal_text} onChange={(e) => setNewGoal((p) => ({ ...p, goal_text: e.target.value }))} className="rounded-lg" /></div>
                <div><Label className="text-xs font-bold uppercase">Prazo Revisão</Label><Input type="date" value={newGoal.review_deadline} onChange={(e) => setNewGoal((p) => ({ ...p, review_deadline: e.target.value }))} className="rounded-lg" /></div>
                <div><Label className="text-xs font-bold uppercase">Observações</Label><Textarea value={newGoal.observations} onChange={(e) => setNewGoal((p) => ({ ...p, observations: e.target.value }))} className="rounded-lg" /></div>
                <Button onClick={handleAddGoal} disabled={createGoal.isPending} className="w-full">Adicionar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {goals.length === 0 ? <p className="text-muted-foreground text-sm">Nenhuma meta registrada.</p> : (
            <div className="space-y-2">
              {goals.map((g) => (
                <div key={g.id} className="flex items-start gap-3 rounded-lg border p-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2"><Badge variant="outline">{g.competency}</Badge><Badge variant={g.status === "atingida" ? "default" : "secondary"}>{goalStatusLabels[g.status]}</Badge></div>
                    <p className="text-sm">{g.goal_text}</p>
                    {g.review_deadline && <p className="text-xs text-muted-foreground">Prazo: {g.review_deadline}</p>}
                    {g.observations && <p className="text-xs text-muted-foreground">{g.observations}</p>}
                  </div>
                  <Select defaultValue={g.status} onValueChange={(v) => updateGoal.mutate({ id: g.id, status: v })}>
                    <SelectTrigger className="w-36 h-8 text-xs rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="em_andamento">Em Andamento</SelectItem><SelectItem value="atingida">Atingida</SelectItem><SelectItem value="nao_atingida">Não Atingida</SelectItem></SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" onClick={() => deleteGoal.mutate(g.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* D) Intervencoes */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-wider">Plano de Intervenções</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1"><Label className="text-xs font-bold uppercase">Psicologia</Label><Textarea value={getField("interventions_psychology")} onChange={(e) => setEditFields((p) => ({ ...p, interventions_psychology: e.target.value }))} className="rounded-lg" /></div>
          <div className="space-y-1"><Label className="text-xs font-bold uppercase">Nutrição</Label><Textarea value={getField("interventions_nutrition")} onChange={(e) => setEditFields((p) => ({ ...p, interventions_nutrition: e.target.value }))} className="rounded-lg" /></div>
          <div className="space-y-1"><Label className="text-xs font-bold uppercase">Outros</Label><Textarea value={getField("interventions_other")} onChange={(e) => setEditFields((p) => ({ ...p, interventions_other: e.target.value }))} className="rounded-lg" /></div>
        </CardContent>
      </Card>

      {/* E) Revisoes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold uppercase tracking-wider">Revisões</CardTitle>
          <Dialog open={revOpen} onOpenChange={setRevOpen}>
            <DialogTrigger asChild><Button size="sm" variant="outline" className="gap-1"><RefreshCw className="h-4 w-4" /> Nova Revisão</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova Revisão do PIA</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Responsável: {profile?.full_name || "—"}</p>
                <div><Label className="text-xs font-bold uppercase">Descrição das Mudanças</Label><Textarea value={revDesc} onChange={(e) => setRevDesc(e.target.value)} rows={4} className="rounded-lg" /></div>
                <Button onClick={handleAddRevision} disabled={createRevision.isPending || !revDesc} className="w-full">Registrar Revisão</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {revisions.length === 0 ? <p className="text-muted-foreground text-sm">Nenhuma revisão registrada.</p> : (
            <div className="space-y-2">
              {revisions.map((r) => (
                <div key={r.id} className="rounded-lg border p-3 space-y-1">
                  <div className="flex items-center gap-2"><span className="text-sm font-semibold">{r.date}</span><span className="text-xs text-muted-foreground">por {r.revised_by}</span></div>
                  <p className="text-sm">{r.changes_description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
