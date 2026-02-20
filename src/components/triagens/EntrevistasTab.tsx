import { useState } from "react";
import { useCandidates } from "@/hooks/useCandidates";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, FileText } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { InterviewForm } from "./InterviewForm";

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

export function EntrevistasTab() {
  const { data: candidates = [], isLoading } = useCandidates("entrevista");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = candidates.filter((c) =>
    c.elder_name.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedId) {
    const candidate = candidates.find((c) => c.id === selectedId);
    if (candidate) {
      return <InterviewForm candidate={candidate} onBack={() => setSelectedId(null)} />;
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar candidato..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Nenhum candidato em entrevista.</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedId(c.id)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{c.elder_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Clique para preencher a ficha de entrevista
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={priorityColors[c.priority]}>
                    {priorityLabels[c.priority]}
                  </Badge>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
