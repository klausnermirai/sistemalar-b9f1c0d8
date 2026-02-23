

## Relatorio Completo na Integracao

### Objetivo

Alterar o botao "Gerar Relatorio" na aba Integracao para produzir um relatorio consolidado com todas as informacoes do processo, desde o primeiro contato ate a integracao.

### Secoes do Relatorio

O relatorio impresso contera as seguintes secoes, nesta ordem:

1. **Dados do Candidato** - Nome, telefone
2. **Primeiro Contato** - Data do primeiro contato (`contact_date`) e endereco de visita (`visit_address`)
3. **Ficha da Entrevista Social** - Todas as 11 secoes do `InterviewForm`, buscadas da tabela `interview_data`:
   - Identificacao do Idoso
   - Responsavel Legal / Familiar
   - Composicao Familiar e Rede de Apoio
   - Composicao Familiar Detalhada (tabela de membros)
   - Condicoes de Moradia
   - Situacao Socioeconomica
   - Condicoes de Saude
   - Grau de Dependencia
   - Aspectos Psicossociais
   - Motivo da Solicitacao do Acolhimento
   - Parecer Social
4. **Fila de Espera** - Nivel de prioridade do candidato (`priority`)
5. **Parecer da Diretoria** - Texto do parecer em ata (`board_opinion`)
6. **Parecer Medico** - Status (Apto/Inapto) e observacoes (`medical_status`, `medical_opinion`)
7. **Integracao** - Data da integracao, status do contrato, relatorio/observacoes da integracao

### Alteracoes Tecnicas

**Arquivo:** `src/components/triagens/IntegracaoTab.tsx`

| Alteracao | Descricao |
|-----------|-----------|
| Import `useInterviewData` | Para buscar os dados da ficha de entrevista do candidato selecionado |
| Chamar `useInterviewData(selectedId)` | Carregar dados da entrevista quando o modal abrir |
| Reescrever `handlePrintReport` | Gerar HTML completo com todas as secoes listadas acima |
| Labels de prioridade | Mapear `padrao`, `social_urgente`, `dependencia_duvidosa` para textos legiveis |

**Nenhum outro arquivo sera alterado. Nenhuma migration ou alteracao de banco.**

### Formato do Relatorio

O relatorio sera gerado em uma nova janela do navegador com CSS embutido para impressao, contendo:
- Cabecalho com titulo "Relatorio Completo de Triagem"
- Cada secao com titulo destacado e campos organizados
- Tabela para composicao familiar detalhada
- Formatacao limpa para impressao (fonte sans-serif, margens, separadores)

### Dados necessarios

Todos os dados ja existem no banco:
- `candidates`: `contact_date`, `visit_address`, `priority`, `board_opinion`, `medical_status`, `medical_opinion`, `integration_date`, `contract_status`, `integration_report`
- `interview_data`: `identification`, `legal_guardian`, `family_support`, `family_detail`, `housing`, `socioeconomic`, `health`, `dependency`, `psychosocial`, `admission_reason`, `social_opinion`

