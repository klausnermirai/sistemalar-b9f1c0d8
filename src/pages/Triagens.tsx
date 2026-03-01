import { useState } from "react";
import { StatusCards } from "@/components/triagens/StatusCards";
import { OccupancyPanel } from "@/components/shared/OccupancyPanel";
import { AgendamentosTab } from "@/components/triagens/AgendamentosTab";
import { EntrevistasTab } from "@/components/triagens/EntrevistasTab";
import { FilaEsperaTab } from "@/components/triagens/FilaEsperaTab";
import { DiretoriaTab } from "@/components/triagens/DiretoriaTab";
import { ParecerMedicoTab } from "@/components/triagens/ParecerMedicoTab";
import { IntegracaoTab } from "@/components/triagens/IntegracaoTab";
import { ArquivadosTab } from "@/components/triagens/ArquivadosTab";

const stageToTab: Record<string, string> = {
  agendamento: "agendamentos",
  entrevista: "entrevistas",
  lista_espera: "lista_espera",
  decisao_diretoria: "diretoria",
  avaliacao_medica: "parecer_medico",
  integracao: "integracao",
  arquivado: "arquivados",
};

export default function Triagens() {
  const [activeStage, setActiveStage] = useState("agendamento");

  const activeTab = stageToTab[activeStage] || "agendamentos";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold uppercase tracking-wide text-foreground">
          Fluxo de Triagem
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie o processo de admissão de candidatos
        </p>
      </div>

      <OccupancyPanel />
      <StatusCards activeStage={activeStage} onStageClick={setActiveStage} />

      <div className="mt-4">
        {activeTab === "agendamentos" && <AgendamentosTab />}
        {activeTab === "entrevistas" && <EntrevistasTab />}
        {activeTab === "lista_espera" && <FilaEsperaTab />}
        {activeTab === "diretoria" && <DiretoriaTab />}
        {activeTab === "parecer_medico" && <ParecerMedicoTab />}
        {activeTab === "integracao" && <IntegracaoTab />}
        {activeTab === "arquivados" && <ArquivadosTab />}
      </div>
    </div>
  );
}
