import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, FileText } from "lucide-react";
import { Resident } from "@/hooks/useResidents";
import { format } from "date-fns";

interface ResidentListProps {
  residents: Resident[];
  isLoading: boolean;
  onSelect: (resident: Resident) => void;
  onNew: () => void;
}

export function ResidentList({ residents, isLoading, onSelect, onNew }: ResidentListProps) {
  const [search, setSearch] = useState("");

  const filtered = residents.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.cpf && r.cpf.includes(q)) ||
      (r.nickname && r.nickname.toLowerCase().includes(q))
    );
  });

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
              <TableHead className="w-[80px]" />
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
              filtered.map((r) => (
                <TableRow key={r.id} className="cursor-pointer" onClick={() => onSelect(r)}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.nickname || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{r.cpf || "—"}</TableCell>
                  <TableCell>{r.room || "—"}</TableCell>
                  <TableCell>
                    {r.admission_date ? format(new Date(r.admission_date), "dd/MM/yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.status === "ativo" ? "default" : "secondary"}>
                      {r.status === "ativo" ? "Ativo" : r.status === "desacolhido" ? "Desacolhido" : r.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onSelect(r); }}>
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
