import { useState } from "react";
import { useMultidisciplinaryRecord, TimelineEntry } from "@/hooks/useMultidisciplinaryRecord";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, Eye, Lock, Calendar, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props { residentId: string | null; residentName?: string; }

const competencyColors: Record<string, string> = {
  psicologia: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  nutricao: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

const competencyLabels: Record<string, string> = { psicologia: "Psicologia", nutricao: "Nutrição" };

export function ProntuarioTab({ residentId, residentName }: Props) {
  const { data: entries = [], isLoading } = useMultidisciplinaryRecord(residentId || undefined);
  const [filterComp, setFilterComp] = useState<string>("all");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [onlyMural, setOnlyMural] = useState(false);
  const [selected, setSelected] = useState<TimelineEntry | null>(null);

  const filtered = entries.filter((e) => {
    if (filterComp !== "all" && e.competency !== filterComp) return false;
    if (filterFrom && e.date < filterFrom) return false;
    if (filterTo && e.date > filterTo + "T23:59:59") return false;
    if (onlyMural && !e.hasMuralContent) return false;
    return true;
  });

  const handlePDF = () => {
    const printContent = filtered.map((e) => {
      const dateStr = formatDate(e.date);
      const content = e.hasPrivateContent ? "[Conteúdo restrito]" : e.summary;
      return `<div style="margin-bottom:16px;padding:12px;border:1px solid #ddd;border-radius:8px;">
        <div style="display:flex;gap:8px;margin-bottom:4px;">
          <strong>${dateStr}</strong>
          <span style="background:#eee;padding:2px 8px;border-radius:4px;font-size:12px;">${competencyLabels[e.competency]}</span>
          <span>${e.type}</span>
        </div>
        <p style="margin:4px 0;">${content}</p>
      </div>`;
    }).join("");

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`<html><head><title>Prontuário - ${residentName || ""}</title>
        <style>body{font-family:sans-serif;padding:24px;max-width:800px;margin:0 auto;}h1{font-size:18px;}</style></head>
        <body><h1>Prontuário Multidisciplinar — ${residentName || ""}</h1><p>Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm")}</p>${printContent}</body></html>`);
      win.document.close();
      win.print();
    }
  };

  if (!residentId) return <p className="text-muted-foreground">Salve o residente antes de acessar o prontuário.</p>;
  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/50 p-4">
        <Filter className="h-4 w-4 text-muted-foreground mt-5" />
        <div className="space-y-1">
          <Label className="text-xs font-bold uppercase tracking-wider">Competência</Label>
          <Select value={filterComp} onValueChange={setFilterComp}>
            <SelectTrigger className="w-40 h-9 rounded-lg"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="psicologia">Psicologia</SelectItem>
              <SelectItem value="nutricao">Nutrição</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-bold uppercase tracking-wider">De</Label>
          <Input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="w-36 h-9 rounded-lg" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-bold uppercase tracking-wider">Até</Label>
          <Input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="w-36 h-9 rounded-lg" />
        </div>
        <div className="flex items-center gap-2 pt-5">
          <Checkbox id="mural" checked={onlyMural} onCheckedChange={(v) => setOnlyMural(!!v)} />
          <Label htmlFor="mural" className="text-xs">Somente mural</Label>
        </div>
        <Button variant="outline" size="sm" className="gap-2 ml-auto" onClick={handlePDF}>
          <FileText className="h-4 w-4" /> Gerar PDF
        </Button>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">Nenhum registro encontrado.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors">
              <Calendar className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-semibold">{formatDate(entry.date)}</span>
                  <Badge variant="outline" className={competencyColors[entry.competency]}>{competencyLabels[entry.competency]}</Badge>
                  <span className="text-xs text-muted-foreground">{entry.type}</span>
                  {entry.hasPrivateContent && <Lock className="h-3 w-3 text-amber-500" />}
                </div>
                <p className="text-sm text-muted-foreground truncate">{entry.hasPrivateContent ? "Conteúdo restrito" : entry.summary}</p>
              </div>
              <Button variant="ghost" size="sm" className="shrink-0 gap-1" onClick={() => setSelected(entry)}>
                <Eye className="h-4 w-4" /> Ver
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.type} — {selected && competencyLabels[selected.competency]}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <p><strong>Data:</strong> {formatDate(selected.date)}</p>
              {selected.professional && <p><strong>Profissional:</strong> {selected.professional}</p>}
              {selected.hasPrivateContent ? (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 p-4">
                  <p className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2"><Lock className="h-4 w-4" /> Conteúdo restrito</p>
                  <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">Este registro contém notas sigilosas da Psicologia.</p>
                </div>
              ) : null}
              {Object.entries(selected.fullData).filter(([k]) => !["id", "resident_id", "created_at", "updated_at", "created_by", "private_notes"].includes(k)).map(([k, v]) => {
                if (!v || (typeof v === "object" && (!Array.isArray(v) || v.length === 0))) return null;
                return <p key={k}><strong>{formatKey(k)}:</strong> {typeof v === "object" ? JSON.stringify(v) : String(v)}</p>;
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatDate(d: string) {
  try { return format(new Date(d), "dd/MM/yyyy HH:mm", { locale: ptBR }); } catch { return d; }
}

function formatKey(k: string) {
  return k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
