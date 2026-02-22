import { useState } from "react";
import { useCandidates, useUpdateCandidate } from "@/hooks/useCandidates";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, Archive, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function DiretoriaTab() {
  const { data: candidates = [], isLoading } = useCandidates("decisao_diretoria");
  const updateCandidate = useUpdateCandidate();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [boardOpinion, setBoardOpinion] = useState("");
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveReason, setArchiveReason] = useState("");

  const filtered = candidates.filter((c) =>
    c.elder_name.toLowerCase().includes(search.toLowerCase())
  );

  const selected = candidates.find((c) => c.id === selectedId);

  const openCandidate = (id: string) => {
    const c = candidates.find((x) => x.id === id);
    setSelectedId(id);
    setBoardOpinion((c as any)?.board_opinion || "");
  };

  const handleSave = () => {
    if (!selectedId) return;
    updateCandidate.mutate(
      { id: selectedId, board_opinion: boardOpinion } as any,
      { onSuccess: () => toast.success("Parecer salvo") }
    );
  };

  const handleSendToMedico = () => {
    if (!selectedId || !boardOpinion.trim()) {
      toast.error("Preencha o parecer da diretoria antes de prosseguir");
      return;
    }
    updateCandidate.mutate(
      { id: selectedId, stage: "avaliacao_medica" as any, board_opinion: boardOpinion } as any,
      {
        onSuccess: () => {
          toast.success("Encaminhado para Parecer Médico");
          setSelectedId(null);
        },
      }
    );
  };

  const handleArchive = () => {
    if (!selectedId || !archiveReason.trim()) return;
    updateCandidate.mutate(
      {
        id: selectedId,
        stage: "arquivado" as any,
        archive_reason: archiveReason,
        archived_at: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          toast.success("Candidato arquivado");
          setArchiveOpen(false);
          setArchiveReason("");
          setSelectedId(null);
        },
      }
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
        <div className="text-center py-8 text-muted-foreground">Nenhum candidato aguardando parecer da diretoria.</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openCandidate(c.id)}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-bold text-foreground">{c.elder_name}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedId && !archiveOpen} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.elder_name}</DialogTitle>
            <DialogDescription>Registre o parecer oficial da diretoria / ata de reunião</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Parecer da Diretoria *</Label>
            <Textarea
              placeholder="Registre a decisão oficial / ata de reunião..."
              value={boardOpinion}
              onChange={(e) => setBoardOpinion(e.target.value)}
              rows={5}
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleSave} disabled={updateCandidate.isPending}>
              Salvar
            </Button>
            <Button variant="destructive" onClick={() => setArchiveOpen(true)}>
              <Archive className="h-4 w-4 mr-2" /> Arquivar
            </Button>
            <Button onClick={handleSendToMedico} disabled={!boardOpinion.trim() || updateCandidate.isPending}>
              <ArrowRight className="h-4 w-4 mr-2" /> Encaminhar para Parecer Médico
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Arquivar Candidato</DialogTitle>
            <DialogDescription>Informe o motivo do arquivamento</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Motivo do arquivamento..." value={archiveReason} onChange={(e) => setArchiveReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setArchiveOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleArchive} disabled={!archiveReason.trim() || updateCandidate.isPending}>
              Confirmar Arquivamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
