import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const MOTIVOS = [
  { value: "desacolhimento", label: "Desacolhimento" },
  { value: "falecimento", label: "Falecimento" },
  { value: "transferencia", label: "Transferência para outra instituição" },
  { value: "outros", label: "Outros" },
];

interface ResidentArchiveModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { reason: string; date: string; description: string }) => void;
  isPending: boolean;
  residentName: string;
}

export function ResidentArchiveModal({
  open,
  onClose,
  onConfirm,
  isPending,
  residentName,
}: ResidentArchiveModalProps) {
  const [reason, setReason] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [description, setDescription] = useState("");

  const handleConfirm = () => {
    if (!reason || !date) return;
    onConfirm({ reason, date, description });
    setReason("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setDescription("");
  };

  const handleClose = () => {
    setReason("");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Arquivar Residente</DialogTitle>
          <DialogDescription>
            Confirme o arquivamento de <strong>{residentName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Motivo *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {MOTIVOS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Data de saída *</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Descrição complementar</Label>
            <Textarea
              placeholder="Observações adicionais..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason || !date || isPending}
          >
            {isPending ? "Arquivando..." : "Confirmar Arquivamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
