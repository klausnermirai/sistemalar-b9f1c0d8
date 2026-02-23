import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { useResidentRelatives, useCreateRelative, useDeleteRelative } from "@/hooks/useResidentRelatives";
import { useResidentVisits, useCreateVisit, useDeleteVisit } from "@/hooks/useResidentVisits";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props {
  residentId: string | null;
}

export function FamiliaresVisitantesTab({ residentId }: Props) {
  const { data: relatives = [], isLoading: loadingRel } = useResidentRelatives(residentId);
  const { data: visits = [], isLoading: loadingVis } = useResidentVisits(residentId);
  const createRelative = useCreateRelative();
  const deleteRelative = useDeleteRelative();
  const createVisit = useCreateVisit();
  const deleteVisit = useDeleteVisit();

  const [relForm, setRelForm] = useState({ name: "", kinship: "", phone: "", observation: "", is_responsible: false });
  const [visForm, setVisForm] = useState({ visitor_name: "", visitor_doc: "", date: new Date().toISOString().split("T")[0], time_in: "", time_out: "", observation: "" });

  if (!residentId) {
    return <p className="text-muted-foreground text-sm py-8 text-center">Salve o residente primeiro para gerenciar familiares e visitas.</p>;
  }

  const handleAddRelative = () => {
    if (!relForm.name) { toast.error("Informe o nome do familiar"); return; }
    createRelative.mutate({ ...relForm, resident_id: residentId }, {
      onSuccess: () => { setRelForm({ name: "", kinship: "", phone: "", observation: "", is_responsible: false }); toast.success("Familiar adicionado"); },
      onError: () => toast.error("Erro ao adicionar familiar"),
    });
  };

  const handleAddVisit = () => {
    if (!visForm.visitor_name) { toast.error("Informe o nome do visitante"); return; }
    createVisit.mutate({ ...visForm, resident_id: residentId }, {
      onSuccess: () => { setVisForm({ visitor_name: "", visitor_doc: "", date: new Date().toISOString().split("T")[0], time_in: "", time_out: "", observation: "" }); toast.success("Visita registrada"); },
      onError: () => toast.error("Erro ao registrar visita"),
    });
  };

  return (
    <div className="space-y-6">
      {/* Familiares */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">Familiares / Contatos</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
          <Input placeholder="Nome" value={relForm.name} onChange={(e) => setRelForm({ ...relForm, name: e.target.value })} />
          <Input placeholder="Parentesco" value={relForm.kinship} onChange={(e) => setRelForm({ ...relForm, kinship: e.target.value })} />
          <Input placeholder="Telefone" value={relForm.phone} onChange={(e) => setRelForm({ ...relForm, phone: e.target.value })} />
          <Input placeholder="Observação" value={relForm.observation} onChange={(e) => setRelForm({ ...relForm, observation: e.target.value })} />
          <div className="flex items-center gap-2">
            <Checkbox checked={relForm.is_responsible} onCheckedChange={(c) => setRelForm({ ...relForm, is_responsible: !!c })} />
            <Label className="text-xs">Responsável</Label>
            <Button size="sm" onClick={handleAddRelative} disabled={createRelative.isPending} className="ml-auto">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Parentesco</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingRel ? (
                <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : relatives.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground">Nenhum familiar cadastrado</TableCell></TableRow>
              ) : (
                relatives.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.kinship}</TableCell>
                    <TableCell>{r.phone}</TableCell>
                    <TableCell>{r.is_responsible ? "Sim" : "Não"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteRelative.mutate({ id: r.id, residentId: residentId! })}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Separator />

      {/* Visitas */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">Controle de Visitas / Portaria</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-3">
          <Input placeholder="Nome do Visitante" value={visForm.visitor_name} onChange={(e) => setVisForm({ ...visForm, visitor_name: e.target.value })} />
          <Input placeholder="Documento" value={visForm.visitor_doc} onChange={(e) => setVisForm({ ...visForm, visitor_doc: e.target.value })} />
          <Input type="date" value={visForm.date} onChange={(e) => setVisForm({ ...visForm, date: e.target.value })} />
          <Input type="time" placeholder="Entrada" value={visForm.time_in} onChange={(e) => setVisForm({ ...visForm, time_in: e.target.value })} />
          <Input type="time" placeholder="Saída" value={visForm.time_out} onChange={(e) => setVisForm({ ...visForm, time_out: e.target.value })} />
          <Button size="sm" onClick={handleAddVisit} disabled={createVisit.isPending} className="gap-2">
            <Plus className="h-4 w-4" /> Registrar
          </Button>
        </div>
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Visitante</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Saída</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingVis ? (
                <TableRow><TableCell colSpan={6} className="text-center py-4 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : visits.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-4 text-muted-foreground">Nenhuma visita registrada</TableCell></TableRow>
              ) : (
                visits.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{format(new Date(v.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell>{v.visitor_name}</TableCell>
                    <TableCell>{v.visitor_doc}</TableCell>
                    <TableCell>{v.time_in || "—"}</TableCell>
                    <TableCell>{v.time_out || "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteVisit.mutate({ id: v.id, residentId: residentId! })}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
