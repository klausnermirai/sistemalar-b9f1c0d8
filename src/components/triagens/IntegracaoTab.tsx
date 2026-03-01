import { useState } from "react";
import { useCandidates, useUpdateCandidate } from "@/hooks/useCandidates";
import { useInterviewData } from "@/hooks/useInterviewData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, Printer, Home, Archive } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArchiveModal } from "./ArchiveModal";
import { toast } from "sonner";

export function IntegracaoTab() {
  const { data: candidates = [], isLoading } = useCandidates("integracao");
  const updateCandidate = useUpdateCandidate();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: interviewData } = useInterviewData(selectedId);
  const [integrationDate, setIntegrationDate] = useState("");
  const [contractStatus, setContractStatus] = useState("pendente");
  const [integrationReport, setIntegrationReport] = useState("");
  const [archiveOpen, setArchiveOpen] = useState(false);

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
      { id: selectedId, integration_date: integrationDate || null, contract_status: contractStatus, integration_report: integrationReport } as any,
      { onSuccess: () => toast.success("Dados salvos") }
    );
  };

  const handlePrintReport = () => {
    if (!selected) return;
    const c = selected as any;
    const id = (interviewData?.identification as Record<string, string>) || {};
    const lg = (interviewData?.legal_guardian as Record<string, string>) || {};
    const fs = (interviewData?.family_support as Record<string, string>) || {};
    const fd = (interviewData?.family_detail as any[]) || [];
    const ho = (interviewData?.housing as Record<string, string>) || {};
    const se = (interviewData?.socioeconomic as Record<string, string>) || {};
    const he = (interviewData?.health as Record<string, string>) || {};
    const dp = (interviewData?.dependency as Record<string, string>) || {};
    const ps = (interviewData?.psychosocial as Record<string, string>) || {};
    const admReason = interviewData?.admission_reason || "";
    const socOpinion = interviewData?.social_opinion || "";
    const priorityLabels: Record<string, string> = { padrao: "Padrão", social_urgente: "Social Urgente", dependencia_duvidosa: "Dependência Duvidosa" };
    const f = (v: string | null | undefined) => v || "—";
    const familyRows = fd.length > 0
      ? fd.map((m: any) => `<tr><td>${f(m.nome)}</td><td>${f(m.parentesco)}</td><td>${f(m.idade)}</td><td>${f(m.trabalho)}</td><td>${f(m.renda)}</td></tr>`).join("")
      : `<tr><td colspan="5" style="text-align:center;">Nenhum familiar cadastrado</td></tr>`;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Relatório Completo - ${selected.elder_name}</title>
      <style>
        body{font-family:sans-serif;padding:2rem;color:#333;max-width:800px;margin:0 auto;}
        h1{font-size:1.4rem;text-align:center;border-bottom:2px solid #333;padding-bottom:0.5rem;}
        h2{font-size:1rem;background:#f0f0f0;padding:0.4rem 0.6rem;margin:1.5rem 0 0.5rem;border-left:4px solid #333;}
        .field{margin:0.4rem 0;} .label{font-weight:bold;color:#555;display:inline;} .value{display:inline;margin-left:0.3rem;}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:0.3rem 1.5rem;}
        table{width:100%;border-collapse:collapse;margin:0.5rem 0;}
        th,td{border:1px solid #ccc;padding:0.3rem 0.5rem;text-align:left;font-size:0.85rem;}
        th{background:#f5f5f5;}
        .text-block{white-space:pre-wrap;background:#fafafa;padding:0.5rem;border:1px solid #eee;border-radius:4px;min-height:2rem;}
        @media print{body{padding:1rem;} h2{break-after:avoid;}}
      </style></head>
      <body>
        <h1>Relatório Completo de Triagem</h1>
        <h2>1. Dados do Candidato</h2>
        <div class="grid">
          <div class="field"><span class="label">Nome:</span> <span class="value">${f(selected.elder_name)}</span></div>
          <div class="field"><span class="label">Telefone:</span> <span class="value">${f(c.phone)}</span></div>
        </div>
        <h2>2. Primeiro Contato</h2>
        <div class="grid">
          <div class="field"><span class="label">Data do Contato:</span> <span class="value">${f(c.contact_date)}</span></div>
          <div class="field"><span class="label">Endereço de Visita:</span> <span class="value">${f(c.visit_address)}</span></div>
        </div>
        <h2>3. Ficha da Entrevista Social</h2>
        <h2 style="font-size:0.9rem;">3.1 Identificação do Idoso</h2>
        <div class="grid">
          <div class="field"><span class="label">Nome Completo:</span> <span class="value">${f(id.nome)}</span></div>
          <div class="field"><span class="label">Data Nascimento:</span> <span class="value">${f(id.nascimento)}</span></div>
          <div class="field"><span class="label">Sexo:</span> <span class="value">${f(id.sexo)}</span></div>
          <div class="field"><span class="label">Estado Civil:</span> <span class="value">${f(id.estado_civil)}</span></div>
          <div class="field"><span class="label">RG:</span> <span class="value">${f(id.rg)}</span></div>
          <div class="field"><span class="label">CPF:</span> <span class="value">${f(id.cpf)}</span></div>
          <div class="field"><span class="label">Telefone:</span> <span class="value">${f(id.telefone)}</span></div>
          <div class="field"><span class="label">Endereço:</span> <span class="value">${f(id.endereco)}</span></div>
        </div>
        <h2 style="font-size:0.9rem;">3.2 Responsável Legal / Familiar</h2>
        <div class="grid">
          <div class="field"><span class="label">Nome:</span> <span class="value">${f(lg.nome)}</span></div>
          <div class="field"><span class="label">Parentesco:</span> <span class="value">${f(lg.parentesco)}</span></div>
          <div class="field"><span class="label">Telefone:</span> <span class="value">${f(lg.telefone)}</span></div>
          <div class="field"><span class="label">Endereço:</span> <span class="value">${f(lg.endereco)}</span></div>
        </div>
        <h2 style="font-size:0.9rem;">3.3 Composição Familiar e Rede de Apoio</h2>
        <div class="grid">
          <div class="field"><span class="label">Com quem reside:</span> <span class="value">${f(fs.reside_com)}</span></div>
          <div class="field"><span class="label">Nº de filhos:</span> <span class="value">${f(fs.num_filhos)}</span></div>
          <div class="field"><span class="label">Cuidador principal:</span> <span class="value">${f(fs.cuidador)}</span></div>
          <div class="field"><span class="label">Rede de apoio:</span> <span class="value">${f(fs.rede_apoio)}</span></div>
        </div>
        <h2 style="font-size:0.9rem;">3.4 Composição Familiar Detalhada</h2>
        <table><thead><tr><th>Nome</th><th>Parentesco</th><th>Idade</th><th>Trabalho</th><th>Renda</th></tr></thead><tbody>${familyRows}</tbody></table>
        <h2 style="font-size:0.9rem;">3.5 Condições de Moradia</h2>
        <div class="grid">
          <div class="field"><span class="label">Tipo de moradia:</span> <span class="value">${f(ho.tipo)}</span></div>
          <div class="field"><span class="label">Condição do imóvel:</span> <span class="value">${f(ho.condicao)}</span></div>
          <div class="field"><span class="label">Saneamento:</span> <span class="value">${f(ho.saneamento)}</span></div>
          <div class="field"><span class="label">Acessibilidade:</span> <span class="value">${f(ho.acessibilidade)}</span></div>
        </div>
        <h2 style="font-size:0.9rem;">3.6 Situação Socioeconômica</h2>
        <div class="grid">
          <div class="field"><span class="label">Fonte de renda:</span> <span class="value">${f(se.fonte_renda)}</span></div>
          <div class="field"><span class="label">Valor da renda:</span> <span class="value">${f(se.valor_renda)}</span></div>
          <div class="field"><span class="label">Empréstimos:</span> <span class="value">${f(se.emprestimos)}</span></div>
          <div class="field"><span class="label">Condição da família:</span> <span class="value">${f(se.condicao_familia)}</span></div>
        </div>
        <h2 style="font-size:0.9rem;">3.7 Condições de Saúde</h2>
        <div class="grid">
          <div class="field"><span class="label">Diagnósticos:</span> <span class="value">${f(he.diagnosticos)}</span></div>
          <div class="field"><span class="label">Medicação:</span> <span class="value">${f(he.medicacao)}</span></div>
          <div class="field"><span class="label">Acompanhamento:</span> <span class="value">${f(he.acompanhamento)}</span></div>
          <div class="field"><span class="label">Cognitivo:</span> <span class="value">${f(he.cognitivo)}</span></div>
        </div>
        <h2 style="font-size:0.9rem;">3.8 Grau de Dependência</h2>
        <div class="grid">
          <div class="field"><span class="label">Higiene:</span> <span class="value">${f(dp.higiene)}</span></div>
          <div class="field"><span class="label">Alimentação:</span> <span class="value">${f(dp.alimentacao)}</span></div>
          <div class="field"><span class="label">Locomoção:</span> <span class="value">${f(dp.locomocao)}</span></div>
          <div class="field"><span class="label">Banheiro:</span> <span class="value">${f(dp.banheiro)}</span></div>
          <div class="field"><span class="label">Medicação:</span> <span class="value">${f(dp.medicacao)}</span></div>
        </div>
        <h2 style="font-size:0.9rem;">3.9 Aspectos Psicossociais</h2>
        <div class="grid">
          <div class="field"><span class="label">Conflitos familiares:</span> <span class="value">${f(ps.conflitos)}</span></div>
          <div class="field"><span class="label">Concordância do idoso:</span> <span class="value">${f(ps.concordancia_idoso)}</span></div>
          <div class="field"><span class="label">Concordância da família:</span> <span class="value">${f(ps.concordancia_familia)}</span></div>
        </div>
        <h2 style="font-size:0.9rem;">3.10 Motivo da Solicitação do Acolhimento</h2>
        <div class="text-block">${f(admReason)}</div>
        <h2 style="font-size:0.9rem;">3.11 Parecer Social</h2>
        <div class="text-block">${f(socOpinion)}</div>
        <h2>4. Fila de Espera</h2>
        <div class="field"><span class="label">Nível de Prioridade:</span> <span class="value">${priorityLabels[c.priority] || c.priority}</span></div>
        <h2>5. Parecer da Diretoria</h2>
        <div class="text-block">${f(c.board_opinion)}</div>
        <h2>6. Parecer Médico</h2>
        <div class="grid">
          <div class="field"><span class="label">Status:</span> <span class="value">${c.medical_status === "apto" ? "Apto" : c.medical_status === "inapto" ? "Inapto" : f(c.medical_status)}</span></div>
          <div class="field"><span class="label">Observações:</span> <span class="value">${f(c.medical_opinion)}</span></div>
        </div>
        <h2>7. Integração</h2>
        <div class="grid">
          <div class="field"><span class="label">Data da Integração:</span> <span class="value">${f(integrationDate)}</span></div>
          <div class="field"><span class="label">Status do Contrato:</span> <span class="value">${contractStatus === "assinado" ? "Assinado" : "Pendente"}</span></div>
        </div>
        <div class="field" style="margin-top:0.5rem;"><span class="label">Relatório/Observações:</span></div>
        <div class="text-block">${f(integrationReport)}</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleAcolher = () => {
    if (!selectedId || contractStatus !== "assinado") return;
    updateCandidate.mutate(
      { id: selectedId, stage: "acolhido" as any, integration_date: integrationDate || null, contract_status: contractStatus, integration_report: integrationReport, admission_date: new Date().toISOString().split("T")[0] } as any,
      { onSuccess: () => { toast.success("Candidato acolhido com sucesso!"); setSelectedId(null); } }
    );
  };

  const handleArchive = (reason: string) => {
    if (!selectedId) return;
    updateCandidate.mutate(
      { id: selectedId, stage: "arquivado" as any, archive_reason: reason, archived_at: new Date().toISOString() },
      { onSuccess: () => { toast.success("Candidato arquivado"); setArchiveOpen(false); setSelectedId(null); } }
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
                  <Badge className={cs === "assinado" ? "bg-secondary text-secondary-foreground" : "bg-accent text-accent-foreground"}>
                    {cs === "assinado" ? "Contrato Assinado" : "Contrato Pendente"}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedId && !archiveOpen} onOpenChange={(o) => !o && setSelectedId(null)}>
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
              <Textarea placeholder="Relatório da tarde de experiência..." value={integrationReport} onChange={(e) => setIntegrationReport(e.target.value)} rows={4} />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleSave} disabled={updateCandidate.isPending}>Salvar</Button>
            <Button variant="outline" onClick={handlePrintReport}><Printer className="h-4 w-4 mr-2" /> Gerar Relatório</Button>
            <Button variant="destructive" onClick={() => setArchiveOpen(true)}>
              <Archive className="h-4 w-4 mr-2" /> Arquivar
            </Button>
            <Button onClick={handleAcolher} disabled={contractStatus !== "assinado" || updateCandidate.isPending}>
              <Home className="h-4 w-4 mr-2" /> Acolher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ArchiveModal
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        onConfirm={handleArchive}
        isPending={updateCandidate.isPending}
        candidateName={selected?.elder_name}
      />
    </div>
  );
}
