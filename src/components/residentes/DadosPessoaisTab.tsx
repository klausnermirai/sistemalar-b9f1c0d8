import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Resident } from "@/hooks/useResidents";

interface DadosPessoaisTabProps {
  data: Partial<Resident>;
  onChange: (data: Partial<Resident>) => void;
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export function DadosPessoaisTab({ data, onChange }: DadosPessoaisTabProps) {
  const set = (field: string, value: string) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-6">
      {/* Informações Pessoais */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">Informações Pessoais</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Nome Completo" className="md:col-span-2">
            <Input value={data.name || ""} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Apelido">
            <Input value={data.nickname || ""} onChange={(e) => set("nickname", e.target.value)} />
          </Field>
          <Field label="Sexo">
            <Select value={data.gender || ""} onValueChange={(v) => set("gender", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Feminino">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Data de Nascimento">
            <Input type="date" value={data.birth_date || ""} onChange={(e) => set("birth_date", e.target.value)} />
          </Field>
          <Field label="Nacionalidade">
            <Input value={data.nationality || "Brasileira"} onChange={(e) => set("nationality", e.target.value)} />
          </Field>
          <Field label="Naturalidade">
            <Input value={data.naturalness || ""} onChange={(e) => set("naturalness", e.target.value)} />
          </Field>
          <Field label="Estado Civil">
            <Select value={data.marital_status || ""} onValueChange={(v) => set("marital_status", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
                <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
                <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                <SelectItem value="União Estável">União Estável</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Escolaridade">
            <Input value={data.education || ""} onChange={(e) => set("education", e.target.value)} />
          </Field>
          <Field label="Profissão">
            <Input value={data.profession || ""} onChange={(e) => set("profession", e.target.value)} />
          </Field>
          <Field label="Nome do Pai">
            <Input value={data.father_name || ""} onChange={(e) => set("father_name", e.target.value)} />
          </Field>
          <Field label="Nome da Mãe">
            <Input value={data.mother_name || ""} onChange={(e) => set("mother_name", e.target.value)} />
          </Field>
          <Field label="Cônjuge">
            <Input value={data.spouse || ""} onChange={(e) => set("spouse", e.target.value)} />
          </Field>
          <Field label="Religião">
            <Input value={data.religion || ""} onChange={(e) => set("religion", e.target.value)} />
          </Field>
          <Field label="Hospitais de Referência" className="md:col-span-2">
            <Input value={data.preferred_hospitals || ""} onChange={(e) => set("preferred_hospitals", e.target.value)} />
          </Field>
          <Field label="Atividades Favoritas" className="md:col-span-3">
            <Input value={data.favorite_activities || ""} onChange={(e) => set("favorite_activities", e.target.value)} />
          </Field>
        </div>
      </div>

      <Separator />

      {/* Documentos */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">Documentos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="CPF">
            <Input value={data.cpf || ""} onChange={(e) => set("cpf", e.target.value)} />
          </Field>
          <Field label="RG">
            <Input value={data.rg || ""} onChange={(e) => set("rg", e.target.value)} />
          </Field>
          <Field label="Órgão Expedidor">
            <Input value={data.issuing_body || ""} onChange={(e) => set("issuing_body", e.target.value)} />
          </Field>
          <Field label="Título de Eleitor">
            <Input value={data.voter_title || ""} onChange={(e) => set("voter_title", e.target.value)} />
          </Field>
          <Field label="Seção Eleitoral">
            <Input value={data.voter_section || ""} onChange={(e) => set("voter_section", e.target.value)} />
          </Field>
          <Field label="Zona Eleitoral">
            <Input value={data.voter_zone || ""} onChange={(e) => set("voter_zone", e.target.value)} />
          </Field>
          <Field label="Tipo de Certidão">
            <Select value={data.cert_type || ""} onValueChange={(v) => set("cert_type", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Nascimento">Nascimento</SelectItem>
                <SelectItem value="Casamento">Casamento</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Nº Certidão">
            <Input value={data.cert_number || ""} onChange={(e) => set("cert_number", e.target.value)} />
          </Field>
          <Field label="Folha">
            <Input value={data.cert_page || ""} onChange={(e) => set("cert_page", e.target.value)} />
          </Field>
          <Field label="Livro">
            <Input value={data.cert_book || ""} onChange={(e) => set("cert_book", e.target.value)} />
          </Field>
          <Field label="Cidade de Emissão">
            <Input value={data.cert_city || ""} onChange={(e) => set("cert_city", e.target.value)} />
          </Field>
          <Field label="Estado de Emissão">
            <Input value={data.cert_state || ""} onChange={(e) => set("cert_state", e.target.value)} />
          </Field>
          <Field label="Data de Emissão">
            <Input type="date" value={data.cert_date || ""} onChange={(e) => set("cert_date", e.target.value)} />
          </Field>
        </div>
      </div>

      <Separator />

      {/* Cartões / INSS */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">Cartões e Benefícios</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Cartão SUS">
            <Input value={data.sus_card || ""} onChange={(e) => set("sus_card", e.target.value)} />
          </Field>
          <Field label="Cartão SAMS">
            <Input value={data.sams_card || ""} onChange={(e) => set("sams_card", e.target.value)} />
          </Field>
          <Field label="Cadastro Único">
            <Input value={data.cad_unico || ""} onChange={(e) => set("cad_unico", e.target.value)} />
          </Field>
          <Field label="Nº Benefício INSS">
            <Input value={data.inss_number || ""} onChange={(e) => set("inss_number", e.target.value)} />
          </Field>
          <Field label="Situação INSS">
            <Input value={data.inss_status || ""} onChange={(e) => set("inss_status", e.target.value)} />
          </Field>
        </div>
      </div>

      <Separator />

      {/* Endereço */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="CEP">
            <Input value={data.cep || ""} onChange={(e) => set("cep", e.target.value)} />
          </Field>
          <Field label="Cidade">
            <Input value={data.city || ""} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="Estado">
            <Input value={data.state || ""} onChange={(e) => set("state", e.target.value)} />
          </Field>
          <Field label="Bairro">
            <Input value={data.neighborhood || ""} onChange={(e) => set("neighborhood", e.target.value)} />
          </Field>
          <Field label="Endereço" className="md:col-span-2">
            <Input value={data.address || ""} onChange={(e) => set("address", e.target.value)} />
          </Field>
          <Field label="Número">
            <Input value={data.address_number || ""} onChange={(e) => set("address_number", e.target.value)} />
          </Field>
          <Field label="Complemento">
            <Input value={data.complement || ""} onChange={(e) => set("complement", e.target.value)} />
          </Field>
          <Field label="Referência">
            <Input value={data.reference || ""} onChange={(e) => set("reference", e.target.value)} />
          </Field>
        </div>
      </div>

      <Separator />

      {/* Acolhimento */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">Acolhimento</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Tipo de Estadia">
            <Select value={data.stay_type || ""} onValueChange={(v) => set("stay_type", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Permanente">Permanente</SelectItem>
                <SelectItem value="Temporária">Temporária</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Data do Acolhimento">
            <Input type="date" value={data.admission_date || ""} onChange={(e) => set("admission_date", e.target.value)} />
          </Field>
          <Field label="Quarto / Ocupação">
            <Input value={data.room || ""} onChange={(e) => set("room", e.target.value)} />
          </Field>
          <Field label="Rendimentos / Mensalidade">
            <Input value={data.income || ""} onChange={(e) => set("income", e.target.value)} />
          </Field>
          <Field label="Grau de Dependência">
            <Select value={data.dependency_level || ""} onValueChange={(v) => set("dependency_level", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Independente">Independente</SelectItem>
                <SelectItem value="Parcialmente Dependente">Parcialmente Dependente</SelectItem>
                <SelectItem value="Dependente">Dependente</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Motivo do Acolhimento" className="md:col-span-3">
            <Textarea value={data.admission_reason || ""} onChange={(e) => set("admission_reason", e.target.value)} rows={2} />
          </Field>
          <Field label="Instituição Anterior">
            <Input value={data.previous_institution || ""} onChange={(e) => set("previous_institution", e.target.value)} />
          </Field>
          <Field label="Tempo na Inst. Anterior">
            <Input value={data.stay_time || ""} onChange={(e) => set("stay_time", e.target.value)} />
          </Field>
          <Field label="Motivo da Troca">
            <Input value={data.change_reason || ""} onChange={(e) => set("change_reason", e.target.value)} />
          </Field>
          <Field label="Data Desacolhimento">
            <Input type="date" value={data.discharge_date || ""} onChange={(e) => set("discharge_date", e.target.value)} />
          </Field>
          <Field label="Motivo Desacolhimento" className="md:col-span-2">
            <Input value={data.discharge_reason || ""} onChange={(e) => set("discharge_reason", e.target.value)} />
          </Field>
          <Field label="Status">
            <Select value={data.status || "ativo"} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="desacolhido">Desacolhido</SelectItem>
                <SelectItem value="falecido">Falecido</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Observações" className="md:col-span-3">
            <Textarea value={data.observations || ""} onChange={(e) => set("observations", e.target.value)} rows={3} />
          </Field>
        </div>
      </div>
    </div>
  );
}
