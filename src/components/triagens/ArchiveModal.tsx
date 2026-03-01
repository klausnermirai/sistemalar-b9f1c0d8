import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const ARCHIVE_REASONS = [
  "Institucionalizado em outro local",
  "Falecimento",
  "Desistência do idoso",
  "Desistência familiar",
] as const;

interface ArchiveModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string, description: string) => void;
  isPending: boolean;
  candidateName?: string;
}

export function ArchiveModal({ open, onClose, onConfirm, isPending, candidateName }: ArchiveModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const handleConfirm = () => {
    if (!reason) return;
    const fullReason = description.trim() ? `${reason} — ${description.trim()}` : reason;
    onConfirm(fullReason, description);
    setReason("");
    setDescription("");
  };

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      setReason("");
      setDescription("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-extrabold uppercase tracking-wide">Arquivar Candidato</DialogTitle>
          <DialogDescription>
            {candidateName ? `Arquivar ${candidateName}` : "Selecione o motivo do arquivamento."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider">Motivo *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {ARCHIVE_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider">Descrição complementar (opcional)</Label>
            <Textarea
              placeholder="Breve descrição..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={!reason || isPending}>
            {isPending ? "Arquivando..." : "Confirmar Arquivamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
