import { useState } from "react";
import { useCandidates, useUpdateCandidate } from "@/hooks/useCandidates";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, User, Archive, ArrowRight, ThumbsUp, ThumbsDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ParecerMedicoTab() {
  const { data: candidates = [], isLoading } = useCandidates("avaliacao_medica");
  const updateCandidate = useUpdateCandidate();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [medicalStatus, setMedicalStatus] = useState<string>("");
  const [medicalOpinion, setMedicalOpinion] = useState("");

  const filtered = candidates.filter((c) =>
    c.elder_name.toLowerCase().includes(search.toLowerCase())
  );

  const selected = candidates.find((c) => c.id === selectedId);

  const openCandidate = (id: string) => {
    const c = candidates.find((x) => x.id === id) as any;
    setSelectedId(id);
    setMedicalStatus(c?.medical_status || "");
    setMedicalOpinion(c?.medical_opinion || "");
  };

  const handleSave = () => {
    if (!selectedId) return;
    updateCandidate.mutate(
      { id: selectedId, medical_status: medicalStatus, medical_opinion: medicalOpinion } as any,
      { onSuccess: () => toast.success("Parecer salvo") }
    );
  };

  const handleSendToIntegracao = () => {
    if (!selectedId || medicalStatus !== "favoravel") return;
    updateCandidate.mutate(
      { id: selectedId, stage: "integracao" as any, medical_status: medicalStatus, medical_opinion: medicalOpinion } as any,
      {
        onSuccess: () => {
          toast.success("Encaminhado para Integração");
          setSelectedId(null);
        },
      }
    );
  };

  const handleArchiveInapto = () => {
    if (!selectedId) return;
    updateCandidate.mutate(
      {
        id: selectedId,
        stage: "arquivado" as any,
        medical_status: "desfavoravel",
        medical_opinion: medicalOpinion,
        archive_reason: "Inapto Clínico",
        archived_at: new Date().toISOString(),
      } as any,
      {
        onSuccess: () => {
          toast.success("Candidato arquivado como Inapto Clínico");
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
        <div className="text-center py-8 text-muted-foreground">Nenhum candidato aguardando parecer médico.</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => {
            const ms = (c as any).medical_status;
            return (
              <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openCandidate(c.id)}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-bold text-foreground">{c.elder_name}</p>
                  </div>
                  {ms && (
                    <Badge className={ms === "favoravel" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {ms === "favoravel" ? "Apto" : "Inapto"}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.elder_name}</DialogTitle>
            <DialogDescription>Avaliação clínica do candidato</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Parecer Médico</Label>
              <div className="flex gap-2">
                <Button
                  variant={medicalStatus === "favoravel" ? "default" : "outline"}
                  onClick={() => setMedicalStatus("favoravel")}
                  className="flex-1"
                >
                  <ThumbsUp className="h-4 w-4 mr-2" /> Apto
                </Button>
                <Button
                  variant={medicalStatus === "desfavoravel" ? "destructive" : "outline"}
                  onClick={() => setMedicalStatus("desfavoravel")}
                  className="flex-1"
                >
                  <ThumbsDown className="h-4 w-4 mr-2" /> Inapto
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações Médicas</Label>
              <Textarea
                placeholder="Observações da avaliação clínica..."
                value={medicalOpinion}
                onChange={(e) => setMedicalOpinion(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleSave} disabled={updateCandidate.isPending}>
              Salvar
            </Button>
            {medicalStatus === "desfavoravel" && (
              <Button variant="destructive" onClick={handleArchiveInapto} disabled={updateCandidate.isPending}>
                <Archive className="h-4 w-4 mr-2" /> Arquivar (Inapto Clínico)
              </Button>
            )}
            {medicalStatus === "favoravel" && (
              <Button onClick={handleSendToIntegracao} disabled={updateCandidate.isPending}>
                <ArrowRight className="h-4 w-4 mr-2" /> Seguir para Integração
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
