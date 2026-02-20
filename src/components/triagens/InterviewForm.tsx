import { useState, useEffect } from "react";
import { Tables } from "@/integrations/supabase/types";
import { useInterviewData, useUpsertInterviewData } from "@/hooks/useInterviewData";
import { useUpdateCandidate } from "@/hooks/useCandidates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Printer, Plus, Trash2 } from "lucide-react";

type Candidate = Tables<"candidates">;

interface Props {
  candidate: Candidate;
  onBack: () => void;
}

interface FamilyMember {
  nome: string;
  parentesco: string;
  idade: string;
  trabalho: string;
  renda: string;
}

export function InterviewForm({ candidate, onBack }: Props) {
  const { data: existing, isLoading } = useInterviewData(candidate.id);
  const upsert = useUpsertInterviewData();
  const updateCandidate = useUpdateCandidate();
  const { toast } = useToast();

  // Section states
  const [identification, setIdentification] = useState<Record<string, string>>({});
  const [legalGuardian, setLegalGuardian] = useState<Record<string, string>>({});
  const [familySupport, setFamilySupport] = useState<Record<string, string>>({});
  const [familyDetail, setFamilyDetail] = useState<FamilyMember[]>([]);
  const [housing, setHousing] = useState<Record<string, string>>({});
  const [socioeconomic, setSocioeconomic] = useState<Record<string, string>>({});
  const [health, setHealth] = useState<Record<string, string>>({});
  const [dependency, setDependency] = useState<Record<string, string>>({});
  const [psychosocial, setPsychosocial] = useState<Record<string, string>>({});
  const [admissionReason, setAdmissionReason] = useState("");
  const [socialOpinion, setSocialOpinion] = useState("");
  const [priority, setPriority] = useState(candidate.priority);

  useEffect(() => {
    if (existing) {
      setIdentification((existing.identification as Record<string, string>) || {});
      setLegalGuardian((existing.legal_guardian as Record<string, string>) || {});
      setFamilySupport((existing.family_support as Record<string, string>) || {});
      setFamilyDetail((existing.family_detail as unknown as FamilyMember[]) || []);
      setHousing((existing.housing as Record<string, string>) || {});
      setSocioeconomic((existing.socioeconomic as Record<string, string>) || {});
      setHealth((existing.health as Record<string, string>) || {});
      setDependency((existing.dependency as Record<string, string>) || {});
      setPsychosocial((existing.psychosocial as Record<string, string>) || {});
      setAdmissionReason(existing.admission_reason || "");
      setSocialOpinion(existing.social_opinion || "");
    }
  }, [existing]);

  async function handleSave() {
    try {
      await upsert.mutateAsync({
        candidate_id: candidate.id,
        identification: identification as any,
        legal_guardian: legalGuardian as any,
        family_support: familySupport as any,
        family_detail: familyDetail as any,
        housing: housing as any,
        socioeconomic: socioeconomic as any,
        health: health as any,
        dependency: dependency as any,
        psychosocial: psychosocial as any,
        admission_reason: admissionReason,
        social_opinion: socialOpinion,
      });

      if (priority !== candidate.priority) {
        await updateCandidate.mutateAsync({ id: candidate.id, priority });
      }

      toast({ title: "Ficha salva com sucesso!" });
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    }
  }

  function handlePrint() {
    window.print();
  }

  function addFamilyMember() {
    setFamilyDetail([...familyDetail, { nome: "", parentesco: "", idade: "", trabalho: "", renda: "" }]);
  }

  function updateFamilyMember(index: number, field: keyof FamilyMember, value: string) {
    const updated = [...familyDetail];
    updated[index] = { ...updated[index], [field]: value };
    setFamilyDetail(updated);
  }

  function removeFamilyMember(index: number) {
    setFamilyDetail(familyDetail.filter((_, i) => i !== index));
  }

  const fieldSetter = (setter: React.Dispatch<React.SetStateAction<Record<string, string>>>) =>
    (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setter((prev) => ({ ...prev, [key]: e.target.value }));

  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground">Carregando ficha...</div>;
  }

  const SectionTitle = ({ number, title }: { number: number; title: string }) => (
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-extrabold uppercase tracking-wider text-primary">
        {number}. {title}
      </CardTitle>
    </CardHeader>
  );

  const Field = ({
    label,
    value,
    onChange,
    type = "text",
    className = "",
  }: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    className?: string;
  }) => (
    <div className={`space-y-1 ${className}`}>
      <Label className="text-xs font-bold uppercase tracking-wider">{label}</Label>
      <Input type={type} value={value || ""} onChange={onChange} />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background py-3 border-b -mx-6 px-6 -mt-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-lg font-extrabold uppercase tracking-wide">{candidate.elder_name}</h2>
            <p className="text-xs text-muted-foreground">Ficha de Entrevista Social</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} className="font-bold uppercase text-xs">
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
          <Button onClick={handleSave} disabled={upsert.isPending} className="font-bold uppercase text-xs">
            <Save className="mr-2 h-4 w-4" /> {upsert.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Priority */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="text-xs font-bold uppercase tracking-wider whitespace-nowrap">Prioridade</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
              <SelectTrigger className="w-60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="padrao">Padrão</SelectItem>
                <SelectItem value="social_urgente">Social Urgente</SelectItem>
                <SelectItem value="dependencia_duvidosa">Dependência Duvidosa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 1. Identificação */}
      <Card>
        <SectionTitle number={1} title="Identificação do Idoso" />
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Nome Completo" value={identification.nome} onChange={fieldSetter(setIdentification)("nome")} className="md:col-span-2 lg:col-span-3" />
          <Field label="Data de Nascimento" value={identification.nascimento} onChange={fieldSetter(setIdentification)("nascimento")} type="date" />
          <Field label="Sexo" value={identification.sexo} onChange={fieldSetter(setIdentification)("sexo")} />
          <Field label="Estado Civil" value={identification.estado_civil} onChange={fieldSetter(setIdentification)("estado_civil")} />
          <Field label="RG" value={identification.rg} onChange={fieldSetter(setIdentification)("rg")} />
          <Field label="CPF" value={identification.cpf} onChange={fieldSetter(setIdentification)("cpf")} />
          <Field label="Telefone" value={identification.telefone} onChange={fieldSetter(setIdentification)("telefone")} />
          <Field label="Endereço" value={identification.endereco} onChange={fieldSetter(setIdentification)("endereco")} className="md:col-span-2 lg:col-span-3" />
        </CardContent>
      </Card>

      {/* 2. Responsável Legal */}
      <Card>
        <SectionTitle number={2} title="Responsável Legal / Familiar" />
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nome" value={legalGuardian.nome} onChange={fieldSetter(setLegalGuardian)("nome")} />
          <Field label="Parentesco" value={legalGuardian.parentesco} onChange={fieldSetter(setLegalGuardian)("parentesco")} />
          <Field label="Telefone" value={legalGuardian.telefone} onChange={fieldSetter(setLegalGuardian)("telefone")} />
          <Field label="Endereço" value={legalGuardian.endereco} onChange={fieldSetter(setLegalGuardian)("endereco")} />
        </CardContent>
      </Card>

      {/* 3. Composição Familiar */}
      <Card>
        <SectionTitle number={3} title="Composição Familiar e Rede de Apoio" />
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Com quem reside" value={familySupport.reside_com} onChange={fieldSetter(setFamilySupport)("reside_com")} />
          <Field label="Número de filhos" value={familySupport.num_filhos} onChange={fieldSetter(setFamilySupport)("num_filhos")} />
          <Field label="Cuidador principal" value={familySupport.cuidador} onChange={fieldSetter(setFamilySupport)("cuidador")} />
          <Field label="Rede de apoio" value={familySupport.rede_apoio} onChange={fieldSetter(setFamilySupport)("rede_apoio")} />
        </CardContent>
      </Card>

      {/* 4. Composição Familiar Detalhada */}
      <Card>
        <SectionTitle number={4} title="Composição Familiar Detalhada" />
        <CardContent className="space-y-3">
          {familyDetail.map((m, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end">
              <Field label="Nome" value={m.nome} onChange={(e) => updateFamilyMember(i, "nome", e.target.value)} />
              <Field label="Parentesco" value={m.parentesco} onChange={(e) => updateFamilyMember(i, "parentesco", e.target.value)} />
              <Field label="Idade" value={m.idade} onChange={(e) => updateFamilyMember(i, "idade", e.target.value)} />
              <Field label="Trabalho" value={m.trabalho} onChange={(e) => updateFamilyMember(i, "trabalho", e.target.value)} />
              <Field label="Renda" value={m.renda} onChange={(e) => updateFamilyMember(i, "renda", e.target.value)} />
              <Button variant="ghost" size="icon" onClick={() => removeFamilyMember(i)} className="mb-0.5">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addFamilyMember} className="font-bold uppercase text-xs">
            <Plus className="mr-2 h-3 w-3" /> Adicionar Familiar
          </Button>
        </CardContent>
      </Card>

      {/* 5. Condições de Moradia */}
      <Card>
        <SectionTitle number={5} title="Condições de Moradia" />
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Tipo de moradia" value={housing.tipo} onChange={fieldSetter(setHousing)("tipo")} />
          <Field label="Condição do imóvel" value={housing.condicao} onChange={fieldSetter(setHousing)("condicao")} />
          <Field label="Saneamento básico" value={housing.saneamento} onChange={fieldSetter(setHousing)("saneamento")} />
          <Field label="Acessibilidade" value={housing.acessibilidade} onChange={fieldSetter(setHousing)("acessibilidade")} />
        </CardContent>
      </Card>

      {/* 6. Situação Socioeconômica */}
      <Card>
        <SectionTitle number={6} title="Situação Socioeconômica" />
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Fonte de renda" value={socioeconomic.fonte_renda} onChange={fieldSetter(setSocioeconomic)("fonte_renda")} />
          <Field label="Valor da renda" value={socioeconomic.valor_renda} onChange={fieldSetter(setSocioeconomic)("valor_renda")} />
          <Field label="Empréstimos" value={socioeconomic.emprestimos} onChange={fieldSetter(setSocioeconomic)("emprestimos")} />
          <Field label="Condição da família" value={socioeconomic.condicao_familia} onChange={fieldSetter(setSocioeconomic)("condicao_familia")} />
        </CardContent>
      </Card>

      {/* 7. Condições de Saúde */}
      <Card>
        <SectionTitle number={7} title="Condições de Saúde" />
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Diagnósticos" value={health.diagnosticos} onChange={fieldSetter(setHealth)("diagnosticos")} className="md:col-span-2" />
          <Field label="Medicação em uso" value={health.medicacao} onChange={fieldSetter(setHealth)("medicacao")} className="md:col-span-2" />
          <Field label="Acompanhamento médico" value={health.acompanhamento} onChange={fieldSetter(setHealth)("acompanhamento")} />
          <Field label="Comprometimento cognitivo" value={health.cognitivo} onChange={fieldSetter(setHealth)("cognitivo")} />
        </CardContent>
      </Card>

      {/* 8. Grau de Dependência */}
      <Card>
        <SectionTitle number={8} title="Grau de Dependência" />
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Higiene pessoal" value={dependency.higiene} onChange={fieldSetter(setDependency)("higiene")} />
          <Field label="Alimentação" value={dependency.alimentacao} onChange={fieldSetter(setDependency)("alimentacao")} />
          <Field label="Locomoção" value={dependency.locomocao} onChange={fieldSetter(setDependency)("locomocao")} />
          <Field label="Uso do banheiro" value={dependency.banheiro} onChange={fieldSetter(setDependency)("banheiro")} />
          <Field label="Medicação" value={dependency.medicacao} onChange={fieldSetter(setDependency)("medicacao")} />
        </CardContent>
      </Card>

      {/* 9. Aspectos Psicossociais */}
      <Card>
        <SectionTitle number={9} title="Aspectos Psicossociais" />
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Conflitos familiares" value={psychosocial.conflitos} onChange={fieldSetter(setPsychosocial)("conflitos")} />
          <Field label="Concordância do idoso" value={psychosocial.concordancia_idoso} onChange={fieldSetter(setPsychosocial)("concordancia_idoso")} />
          <Field label="Concordância da família" value={psychosocial.concordancia_familia} onChange={fieldSetter(setPsychosocial)("concordancia_familia")} />
        </CardContent>
      </Card>

      {/* 10. Motivo da Solicitação */}
      <Card>
        <SectionTitle number={10} title="Motivo da Solicitação do Acolhimento" />
        <CardContent>
          <Textarea
            value={admissionReason}
            onChange={(e) => setAdmissionReason(e.target.value)}
            placeholder="Descreva o motivo da solicitação..."
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>

      {/* 11. Parecer Social */}
      <Card>
        <SectionTitle number={11} title="Parecer Social" />
        <CardContent>
          <Textarea
            value={socialOpinion}
            onChange={(e) => setSocialOpinion(e.target.value)}
            placeholder="Parecer do assistente social..."
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>

      {/* Bottom save button */}
      <div className="flex justify-end gap-2 pb-6">
        <Button variant="outline" onClick={onBack} className="font-bold uppercase text-xs">
          Voltar
        </Button>
        <Button onClick={handleSave} disabled={upsert.isPending} className="font-bold uppercase text-xs">
          <Save className="mr-2 h-4 w-4" /> {upsert.isPending ? "Salvando..." : "Salvar Ficha"}
        </Button>
      </div>
    </div>
  );
}
