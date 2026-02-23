import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const COLUMN_MAP: Record<string, string> = {
  "Nome": "name",
  "Apelido": "nickname",
  "Sexo": "gender",
  "Data de aniversário": "birth_date",
  "Data de aniversario": "birth_date",
  "Religião": "religion",
  "Religiao": "religion",
  "Profissão": "profession",
  "Profissao": "profession",
  "Escolaridade": "education",
  "Estado civil": "marital_status",
  "RG": "rg",
  "Órgão expeditor": "issuing_body",
  "Orgao expeditor": "issuing_body",
  "CPF": "cpf",
  "Título de eleitor": "voter_title",
  "Titulo de eleitor": "voter_title",
  "Seção eleitoral": "voter_section",
  "Secao eleitoral": "voter_section",
  "Zona eleitoral": "voter_zone",
  "Tipo de documento certidão": "cert_type",
  "Tipo de documento certidao": "cert_type",
  "Número certidão": "cert_number",
  "Numero certidao": "cert_number",
  "Folha": "cert_page",
  "Livro": "cert_book",
  "Cidade de emissão": "cert_city",
  "Cidade de emissao": "cert_city",
  "Estado de emissão": "cert_state",
  "Estado de emissao": "cert_state",
  "Data de emissão": "cert_date",
  "Data de emissao": "cert_date",
  "Número cartão SUS": "sus_card",
  "Numero cartao SUS": "sus_card",
  "Número cartão SAMS": "sams_card",
  "Numero cartao SAMS": "sams_card",
  "Número do benefício do INSS": "inss_number",
  "Numero do beneficio do INSS": "inss_number",
  "Situação do benefício do INSS": "inss_status",
  "Situacao do beneficio do INSS": "inss_status",
  "Número do cadastro único": "cad_unico",
  "Numero do cadastro unico": "cad_unico",
  "Tipo de estadia": "stay_type",
  "Nome de outra instituição": "previous_institution",
  "Nome de outra instituicao": "previous_institution",
  "Tempo de acolhimento da outra inst.": "stay_time",
  "Motivo da troca": "change_reason",
  "Data do acolhimento": "admission_date",
  "Ocupação do residente": "room",
  "Ocupacao do residente": "room",
  "Motivo do acolhimento": "admission_reason",
  "Motivo do desacolhimento": "discharge_reason",
  "Data do desacolhimento": "discharge_date",
  "Rendimentos mensalidades": "income",
  "Atividades favoritas": "favorite_activities",
  "Endereço": "address",
  "Endereco": "address",
  "CEP": "cep",
  "Número": "address_number",
  "Numero": "address_number",
  "Bairro": "neighborhood",
  "Cidade": "city",
  "Estado": "state",
  "Referência": "reference",
  "Referencia": "reference",
  "Complemento": "complement",
  "Observação": "observations",
  "Observacao": "observations",
  "Status": "status",
  "Grau de dependência": "dependency_level",
  "Grau de dependencia": "dependency_level",
};

const DATE_FIELDS = ["birth_date", "cert_date", "admission_date", "discharge_date"];

function parseDate(value: unknown): string | null {
  if (!value) return null;
  // Excel serial number
  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      const y = date.y;
      const m = String(date.m).padStart(2, "0");
      const d = String(date.d).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
    return null;
  }
  const str = String(value).trim();
  // DD/MM/YYYY
  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  }
  return str || null;
}

function normalizeStatus(val: unknown): string {
  if (!val) return "ativo";
  const s = String(val).trim().toLowerCase();
  if (s === "ativo" || s === "active") return "ativo";
  if (s === "inativo" || s === "inactive" || s === "desacolhido") return "inativo";
  return s;
}

interface ImportResidentsProps {
  onDone: () => void;
}

export function ImportResidents({ onDone }: ImportResidentsProps) {
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

      const residents: Record<string, unknown>[] = [];
      const relatives: Record<string, unknown>[] = [];

      jsonRows.forEach((row, idx) => {
        const mapped: Record<string, unknown> = {};

        for (const [header, value] of Object.entries(row)) {
          const trimmed = header.trim();
          const field = COLUMN_MAP[trimmed];
          if (!field) continue;

          if (DATE_FIELDS.includes(field)) {
            mapped[field] = parseDate(value);
          } else if (field === "status") {
            mapped[field] = normalizeStatus(value);
          } else if (field === "stay_type") {
            const v = String(value || "").trim();
            mapped[field] = v === "Residente" ? "Permanente" : v || null;
          } else {
            const v = value != null ? String(value).trim() : null;
            mapped[field] = v || null;
          }
        }

        if (!mapped.name) return;
        residents.push(mapped);

        // Extract "Responsável" field
        const respKey = Object.keys(row).find((k) =>
          k.trim().toLowerCase().startsWith("responsav") || k.trim().toLowerCase().startsWith("responsáv")
        );
        if (respKey && row[respKey]) {
          const names = String(row[respKey])
            .split("/")
            .map((n) => n.trim())
            .filter(Boolean);
          for (const name of names) {
            relatives.push({
              _rowIndex: residents.length - 1,
              name,
              is_responsible: true,
            });
          }
        }
      });

      if (residents.length === 0) {
        toast.error("Nenhum residente encontrado na planilha");
        setLoading(false);
        return;
      }

      const { data: result, error } = await supabase.functions.invoke(
        "import-residents",
        { body: { residents, relatives } }
      );

      if (error) throw error;

      toast.success(
        `${result.inserted} residentes importados com sucesso${result.errors > 0 ? ` (${result.errors} erros)` : ""}`
      );
      if (result.errorDetails?.length > 0) {
        console.warn("Erros de importação:", result.errorDetails);
      }

      qc.invalidateQueries({ queryKey: ["residents"] });
      onDone();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao importar";
      toast.error(message);
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".xls,.xlsx"
        className="hidden"
        onChange={handleFile}
      />
      <Button
        variant="outline"
        disabled={loading}
        onClick={() => fileRef.current?.click()}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {loading ? "Importando..." : "Importar Planilha"}
      </Button>
    </>
  );
}
