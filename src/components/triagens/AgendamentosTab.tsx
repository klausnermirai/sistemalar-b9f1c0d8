import { useState } from "react";
import { useCandidates, useCreateCandidate, useUpdateCandidate } from "@/hooks/useCandidates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Phone, MapPin, Calendar, User } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Candidate = Tables<"candidates">;

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

export function AgendamentosTab() {
  const { data: candidates = [], isLoading } = useCandidates("agendamento");
  const createCandidate = useCreateCandidate();
  const updateCandidate = useUpdateCandidate();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveReason, setArchiveReason] = useState("");

  // New candidate form state
  const [newForm, setNewForm] = useState({
    elder_name: "",
    phone: "",
    contact_date: "",
    visit_address: "",
  });

  const filtered = candidates.filter((c) =>
    c.elder_name.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createCandidate.mutateAsync({
        elder_name: newForm.elder_name,
        phone: newForm.phone || null,
        contact_date: newForm.contact_date || null,
        visit_address: newForm.visit_address || null,
      });
      setShowNewModal(false);
      setNewForm({ elder_name: "", phone: "", contact_date: "", visit_address: "" });
      toast({ title: "Agendamento criado com sucesso!" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  }

  async function handleMoveToInterview() {
    if (!selectedCandidate) return;
    try {
      await updateCandidate.mutateAsync({ id: selectedCandidate.id, stage: "entrevista" });
      setSelectedCandidate(null);
      toast({ title: "Candidato movido para Entrevistas!" });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  }

  async function handleArchive() {
    if (!selectedCandidate || !archiveReason) return;
    try {
      await updateCandidate.mutateAsync({
        id: selectedCandidate.id,
        stage: "arquivado",
        archive_reason: archiveReason,
        archived_at: new Date().toISOString(),
      });
      setShowArchiveModal(false);
      setSelectedCandidate(null);
      setArchiveReason("");
      toast({ title: "Candidato arquivado." });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar candidato..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowNewModal(true)} className="font-bold uppercase text-xs tracking-wider">
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Nenhum agendamento encontrado.</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedCandidate(c)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{c.elder_name}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                      {c.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {c.phone}
                        </span>
                      )}
                      {c.visit_address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {c.visit_address}
                        </span>
                      )}
                      {c.contact_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {new Date(c.contact_date).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Badge className={priorityColors[c.priority]}>
                  {priorityLabels[c.priority]}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Candidate Modal */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-extrabold uppercase tracking-wide">Novo Agendamento</DialogTitle>
            <DialogDescription>Preencha os dados para agendar uma nova triagem.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label className="uppercase text-xs font-bold tracking-wider">Nome do Idoso *</Label>
              <Input
                value={newForm.elder_name}
                onChange={(e) => setNewForm({ ...newForm, elder_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase text-xs font-bold tracking-wider">Telefone</Label>
              <Input
                value={newForm.phone}
                onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase text-xs font-bold tracking-wider">Data do Contato</Label>
              <Input
                type="date"
                value={newForm.contact_date}
                onChange={(e) => setNewForm({ ...newForm, contact_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="uppercase text-xs font-bold tracking-wider">Endereço da Visita</Label>
              <Input
                value={newForm.visit_address}
                onChange={(e) => setNewForm({ ...newForm, visit_address: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="font-bold uppercase" disabled={createCandidate.isPending}>
                {createCandidate.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manage Candidate Modal */}
      <Dialog open={!!selectedCandidate && !showArchiveModal} onOpenChange={() => setSelectedCandidate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-extrabold uppercase tracking-wide">
              Gerenciar Etapa
            </DialogTitle>
            <DialogDescription>
              {selectedCandidate?.elder_name} — escolha uma ação
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              className="w-full font-bold uppercase"
              onClick={handleMoveToInterview}
              disabled={updateCandidate.isPending}
            >
              Evoluir para Entrevista
            </Button>
            <Button
              variant="destructive"
              className="w-full font-bold uppercase"
              onClick={() => setShowArchiveModal(true)}
            >
              Arquivar Candidato
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Archive Modal */}
      <Dialog open={showArchiveModal} onOpenChange={(open) => { if (!open) { setShowArchiveModal(false); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-extrabold uppercase tracking-wide">Arquivar Candidato</DialogTitle>
            <DialogDescription>Selecione o motivo do arquivamento.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={archiveReason} onValueChange={setArchiveReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inapto Clínico">Inapto Clínico</SelectItem>
                <SelectItem value="Desistência">Desistência</SelectItem>
                <SelectItem value="Falecimento">Falecimento</SelectItem>
                <SelectItem value="Mudança">Mudança</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowArchiveModal(false)}>Cancelar</Button>
              <Button variant="destructive" onClick={handleArchive} disabled={!archiveReason || updateCandidate.isPending}>
                Confirmar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
