import { useState } from "react";
import { useCandidates, useUpdateCandidate } from "@/hooks/useCandidates";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, Printer, Home } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export function IntegracaoTab() {
  const { data: candidates = [], isLoading } = useCandidates("integracao");
  const updateCandidate = useUpdateCandidate();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [integrationDate, setIntegrationDate] = useState("");
  const [contractStatus, setContractStatus] = useState("pendente");
  const [integrationReport, setIntegrationReport] = useState("");

  const filtered = candidates.filter((c) =>
    c.elder_name.toLowerCase().includes(search.toLowerCase())
  );

  const selected = candidates.find((c) => c.id === selectedId);

  const openCandidate = (id: string) => {
    const c = candidates.find((x) => x.id === id) as any;
    setSelectedId(id);
    setIntegrationDate(c?.integration_date || "");
    setContractStatus(c?.contract_status || "pendente");
    setIntegrationReport(c?.integration_report || "");
  };

  const handleSave = () => {
    if (!selectedId) return;
    updateCandidate.mutate(
      {
        id: selectedId,
        integration_date: integrationDate || null,
        contract_status: contractStatus,
        integration_report: integrationReport,
      } as any,
      { onSuccess: () => toast.success("Dados salvos") }
    );
  };

  const handlePrintReport = () => {
    if (!selected) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Relatório - ${selected.elder_name}</title>
      <style>body{font-family:sans-serif;padding:2rem;} h1{font-size:1.5rem;} .field{margin:1rem 0;} .label{font-weight:bold;color:#555;} .value{margin-top:0.25rem;}</style></head>
      <body>
        <h1>Relatório de Integração</h1>
        <div class="field"><div class="label">Candidato</div><div class="value">${selected.elder_name}</div></div>
        <div class="field"><div class="label">Data de Integração</div><div class="value">${integrationDate || "Não definida"}</div></div>
        <div class="field"><div class="label">Status do Contrato</div><div class="value">${contractStatus === "assinado" ? "Assinado" : "Pendente"}</div></div>
        <div class="field"><div class="label">Relatório</div><div class="value">${integrationReport || "—"}</div></div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleAcolher = () => {
    if (!selectedId || contractStatus !== "assinado") return;
    updateCandidate.mutate(
      {
        id: selectedId,
        stage: "acolhido" as any,
        integration_date: integrationDate || null,
        contract_status: contractStatus,
        integration_report: integrationReport,
        admission_date: new Date().toISOString().split("T")[0],
      } as any,
      {
        onSuccess: () => {
          toast.success("Candidato acolhido com sucesso!");
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
        <div className="text-center py-8 text-muted-foreground">Nenhum candidato em integração.</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => {
            const cs = (c as any).contract_status;
            return (
              <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openCandidate(c.id)}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <p className="font-bold text-foreground">{c.elder_name}</p>
                  </div>
                  <Badge className={cs === "assinado" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                    {cs === "assinado" ? "Contrato Assinado" : "Contrato Pendente"}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedId} onOpenChange={(o) => !o && setSelectedId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.elder_name}</DialogTitle>
            <DialogDescription>Gerencie a integração do candidato</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Data da Integração</Label>
              <Input type="date" value={integrationDate} onChange={(e) => setIntegrationDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Status do Contrato</Label>
              <Select value={contractStatus} onValueChange={setContractStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="assinado">Assinado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Relatório da Integração</Label>
              <Textarea
                placeholder="Relatório da tarde de experiência..."
                value={integrationReport}
                onChange={(e) => setIntegrationReport(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleSave} disabled={updateCandidate.isPending}>
              Salvar
            </Button>
            <Button variant="outline" onClick={handlePrintReport}>
              <Printer className="h-4 w-4 mr-2" /> Gerar Relatório
            </Button>
            <Button onClick={handleAcolher} disabled={contractStatus !== "assinado" || updateCandidate.isPending}>
              <Home className="h-4 w-4 mr-2" /> Acolher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
