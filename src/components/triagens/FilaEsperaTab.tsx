import { useState } from "react";
import { useCandidates, useUpdateCandidate } from "@/hooks/useCandidates";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, Archive, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArchiveModal } from "./ArchiveModal";
import { toast } from "sonner";

const priorityLabels: Record<string, string> = {
  padrao: "Padrão",
  social_urgente: "Social Urgente",
  dependencia_duvidosa: "Dependência Duvidosa",
};

const priorityColors: Record<string, string> = {
  padrao: "bg-secondary text-secondary-foreground",
  social_urgente: "bg-accent text-accent-foreground",
  dependencia_duvidosa: "bg-warning text-warning-foreground",
};

export function FilaEsperaTab() {
  const { data: candidates = [], isLoading } = useCandidates("lista_espera");
  const updateCandidate = useUpdateCandidate();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);

  const filtered = candidates.filter((c) =>
    c.elder_name.toLowerCase().includes(search.toLowerCase())
  );

  const selected = candidates.find((c) => c.id === selectedId);

  const handlePriorityChange = (priority: string) => {
    if (!selectedId) return;
    updateCandidate.mutate(
      { id: selectedId, priority: priority as any },
      { onSuccess: () => toast.success("Prioridade atualizada") }
    );
  };

  const handleSendToDiretoria = () => {
    if (!selectedId) return;
    updateCandidate.mutate(
      { id: selectedId, stage: "decisao_diretoria" as any },
      { onSuccess: () => { toast.success("Enviado para Parecer da Diretoria"); setSelectedId(null); } }
    );
  };

  const handleArchive = (reason: string) => {
    if (!selectedId) return;
    updateCandidate.mutate(
      { id: selectedId, stage: "arquivado" as any, archive_reason: reason, archived_at: new Date().toISOString() },
      { onSuccess: () => { toast.success("Candidato arquivado"); setArchiveOpen(false); setSelectedId(null); } }
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar candidato..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Nenhum candidato na fila de espera.</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedId(c.id)}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-bold text-foreground">{c.elder_name}</p>
                </div>
                <Badge className={priorityColors[c.priority]}>{priorityLabels[c.priority]}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedId && !archiveOpen} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.elder_name}</DialogTitle>
            <DialogDescription>Gerencie o candidato na fila de espera</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={selected?.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="padrao">Padrão</SelectItem>
                  <SelectItem value="social_urgente">Social Urgente</SelectItem>
                  <SelectItem value="dependencia_duvidosa">Dependência Duvidosa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="destructive" onClick={() => setArchiveOpen(true)}>
              <Archive className="h-4 w-4 mr-2" /> Arquivar
            </Button>
            <Button onClick={handleSendToDiretoria} disabled={updateCandidate.isPending}>
              <ArrowRight className="h-4 w-4 mr-2" /> Enviar para Diretoria
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ArchiveModal
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        onConfirm={handleArchive}
        isPending={updateCandidate.isPending}
        candidateName={selected?.elder_name}
      />
    </div>
  );
}
