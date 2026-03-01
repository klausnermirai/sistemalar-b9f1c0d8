import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, FileText, Archive } from "lucide-react";
import { Resident, useArchiveResident } from "@/hooks/useResidents";
import { ResidentArchiveModal } from "@/components/residentes/ResidentArchiveModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "sonner";

interface ResidentListProps {
  residents: Resident[];
  isLoading: boolean;
  onSelect: (resident: Resident) => void;
  onNew: () => void;
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  ativo: { label: "Ativo", variant: "default" },
  desacolhido: { label: "Desacolhido", variant: "secondary" },
  falecido: { label: "Falecido", variant: "destructive" },
};

export function ResidentList({ residents, isLoading, onSelect, onNew }: ResidentListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ativo");
  const [archiveTarget, setArchiveTarget] = useState<Resident | null>(null);
  const archiveMutation = useArchiveResident();

  const filtered = residents.filter((r) => {
    if (statusFilter !== "todos" && r.status !== statusFilter) return false;
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.cpf && r.cpf.includes(q)) ||
      (r.nickname && r.nickname.toLowerCase().includes(q))
    );
  });

  const handleArchiveConfirm = (data: { reason: string; date: string; description: string }) => {
    if (!archiveTarget) return;
    const status = data.reason === "falecimento" ? "falecido" : "desacolhido";
    const reasonLabel = data.reason === "desacolhimento" ? "Desacolhimento"
      : data.reason === "falecimento" ? "Falecimento"
      : data.reason === "transferencia" ? "Transferência"
      : "Outros";
    const discharge_reason = data.description ? `${reasonLabel} — ${data.description}` : reasonLabel;

    archiveMutation.mutate(
      { id: archiveTarget.id, status, discharge_date: data.date, discharge_reason },
      {
        onSuccess: () => {
          toast.success("Residente arquivado com sucesso");
          setArchiveTarget(null);
        },
        onError: () => toast.error("Erro ao arquivar residente"),
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, apelido ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ativo">Ativos</SelectItem>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="desacolhido">Desacolhidos</SelectItem>
            <SelectItem value="falecido">Falecidos</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={onNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Cadastrar Idoso
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Apelido</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Quarto</TableHead>
              <TableHead>Admissão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {search ? "Nenhum residente encontrado" : "Nenhum residente cadastrado"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => {
                const st = STATUS_MAP[r.status] || { label: r.status, variant: "secondary" as const };
                return (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => onSelect(r)}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.nickname || "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{r.cpf || "—"}</TableCell>
                    <TableCell>{r.room || "—"}</TableCell>
                    <TableCell>
                      {r.admission_date ? format(new Date(r.admission_date), "dd/MM/yyyy") : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onSelect(r); }}>
                          <FileText className="h-4 w-4" />
                        </Button>
                        {r.status === "ativo" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); setArchiveTarget(r); }}
                            title="Arquivar residente"
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {archiveTarget && (
        <ResidentArchiveModal
          open={!!archiveTarget}
          onClose={() => setArchiveTarget(null)}
          onConfirm={handleArchiveConfirm}
          isPending={archiveMutation.isPending}
          residentName={archiveTarget.name}
        />
      )}
    </div>
  );
}
