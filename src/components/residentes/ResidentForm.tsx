import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save } from "lucide-react";
import { Resident, useCreateResident, useUpdateResident } from "@/hooks/useResidents";
import { DadosPessoaisTab } from "./DadosPessoaisTab";
import { FamiliaresVisitantesTab } from "./FamiliaresVisitantesTab";
import { FinanceiroTab } from "./FinanceiroTab";
import { ItensPessoaisTab } from "./ItensPessoaisTab";
import { ProntuarioTab } from "./ProntuarioTab";
import { PIATab } from "./PIATab";
import { toast } from "sonner";

interface Props {
  resident: Resident | null;
  onBack: () => void;
}

export function ResidentForm({ resident, onBack }: Props) {
  const [data, setData] = useState<Partial<Resident>>(resident || { status: "ativo", nationality: "Brasileira" });
  const [activeTab, setActiveTab] = useState("dados_pessoais");
  const createResident = useCreateResident();
  const updateResident = useUpdateResident();

  const isEditing = !!resident?.id;

  const handleSave = () => {
    if (!data.name) { toast.error("Informe o nome do residente"); return; }

    if (isEditing) {
      updateResident.mutate({ id: resident!.id, ...data }, {
        onSuccess: () => toast.success("Residente atualizado"),
        onError: () => toast.error("Erro ao atualizar"),
      });
    } else {
      createResident.mutate(data as any, {
        onSuccess: () => { toast.success("Residente cadastrado"); onBack(); },
        onError: () => toast.error("Erro ao cadastrar"),
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-bold text-foreground">
            {isEditing ? data.name : "Novo Residente"}
          </h2>
        </div>
        <Button onClick={handleSave} disabled={createResident.isPending || updateResident.isPending} className="gap-2">
          <Save className="h-4 w-4" />
          Salvar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="dados_pessoais" className="font-semibold uppercase text-xs tracking-wider">
            Dados Pessoais
          </TabsTrigger>
          <TabsTrigger value="familiares" className="font-semibold uppercase text-xs tracking-wider" disabled={!isEditing}>
            Familiares e Visitantes
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="font-semibold uppercase text-xs tracking-wider" disabled={!isEditing}>
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="itens" className="font-semibold uppercase text-xs tracking-wider" disabled={!isEditing}>
            Itens Pessoais
          </TabsTrigger>
          <TabsTrigger value="prontuario" className="font-semibold uppercase text-xs tracking-wider" disabled={!isEditing}>
            Prontuário
          </TabsTrigger>
          <TabsTrigger value="pia" className="font-semibold uppercase text-xs tracking-wider" disabled={!isEditing}>
            PIA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dados_pessoais">
          <div className="rounded-lg border bg-card p-6">
            <DadosPessoaisTab data={data} onChange={setData} />
          </div>
        </TabsContent>
        <TabsContent value="familiares">
          <div className="rounded-lg border bg-card p-6">
            <FamiliaresVisitantesTab residentId={resident?.id || null} />
          </div>
        </TabsContent>
        <TabsContent value="financeiro">
          <div className="rounded-lg border bg-card p-6">
            <FinanceiroTab residentId={resident?.id || null} />
          </div>
        </TabsContent>
        <TabsContent value="itens">
          <div className="rounded-lg border bg-card p-6">
            <ItensPessoaisTab residentId={resident?.id || null} />
          </div>
        </TabsContent>
        <TabsContent value="prontuario">
          <div className="rounded-lg border bg-card p-6">
            <ProntuarioTab residentId={resident?.id || null} residentName={data.name} />
          </div>
        </TabsContent>
        <TabsContent value="pia">
          <div className="rounded-lg border bg-card p-6">
            <PIATab residentId={resident?.id || null} residentName={data.name} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
