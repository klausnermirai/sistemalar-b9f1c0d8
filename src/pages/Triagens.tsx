import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusCards } from "@/components/triagens/StatusCards";
import { AgendamentosTab } from "@/components/triagens/AgendamentosTab";
import { EntrevistasTab } from "@/components/triagens/EntrevistasTab";
import { FilaEsperaTab } from "@/components/triagens/FilaEsperaTab";
import { DiretoriaTab } from "@/components/triagens/DiretoriaTab";
import { ParecerMedicoTab } from "@/components/triagens/ParecerMedicoTab";
import { IntegracaoTab } from "@/components/triagens/IntegracaoTab";

export default function Triagens() {
  const [activeTab, setActiveTab] = useState("agendamentos");

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

      <StatusCards />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card border flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="agendamentos" className="font-semibold uppercase text-xs tracking-wider">
            Agendamentos
          </TabsTrigger>
          <TabsTrigger value="entrevistas" className="font-semibold uppercase text-xs tracking-wider">
            Entrevistas
          </TabsTrigger>
          <TabsTrigger value="lista_espera" className="font-semibold uppercase text-xs tracking-wider">
            Fila de Espera
          </TabsTrigger>
          <TabsTrigger value="diretoria" className="font-semibold uppercase text-xs tracking-wider">
            Diretoria
          </TabsTrigger>
          <TabsTrigger value="parecer_medico" className="font-semibold uppercase text-xs tracking-wider">
            Parecer Médico
          </TabsTrigger>
          <TabsTrigger value="integracao" className="font-semibold uppercase text-xs tracking-wider">
            Integração
          </TabsTrigger>
          <TabsTrigger value="acolhidos" disabled className="font-semibold uppercase text-xs tracking-wider opacity-40">
            Acolhidos
          </TabsTrigger>
          <TabsTrigger value="arquivados" disabled className="font-semibold uppercase text-xs tracking-wider opacity-40">
            Arquivados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agendamentos">
          <AgendamentosTab />
        </TabsContent>
        <TabsContent value="entrevistas">
          <EntrevistasTab />
        </TabsContent>
        <TabsContent value="lista_espera">
          <FilaEsperaTab />
        </TabsContent>
        <TabsContent value="diretoria">
          <DiretoriaTab />
        </TabsContent>
        <TabsContent value="parecer_medico">
          <ParecerMedicoTab />
        </TabsContent>
        <TabsContent value="integracao">
          <IntegracaoTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
