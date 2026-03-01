import { useState } from "react";
import { useCandidates } from "@/hooks/useCandidates";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, User, Archive } from "lucide-react";

export function ArquivadosTab() {
  const { data: candidates = [], isLoading } = useCandidates("arquivado");
  const [search, setSearch] = useState("");

  const filtered = candidates.filter((c) =>
    c.elder_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar arquivado..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Nenhum candidato arquivado.</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <Archive className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{c.elder_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.archive_reason || "Sem motivo registrado"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {c.archived_at ? new Date(c.archived_at).toLocaleDateString("pt-BR") : "—"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
