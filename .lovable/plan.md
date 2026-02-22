
## Novas Abas no Fluxo de Triagem

### Resumo

Adicionar 4 novas abas funcionais ao fluxo de triagem, baseadas no prototipo do GitHub:

1. **Fila de Espera** - Candidatos aptos aguardando vaga (ativar a aba ja existente)
2. **Diretoria** - Parecer oficial da diretoria em ata de reuniao
3. **Parecer Medico** - Avaliacao clinica (Apto/Inapto) com observacoes
4. **Integracao** - Contratos, data de integracao, relatorio e acolhimento final

### Fluxo Completo das Etapas

```text
Agendamento -> Entrevista -> Fila de Espera -> Diretoria -> Parecer Medico -> Integracao -> Acolhido
                                                                                    |
                                                                              (qualquer etapa pode -> Arquivado)
```

### 1. Migracao de Banco de Dados

**Novos valores no enum `candidate_stage`:**
- `decisao_diretoria`
- `avaliacao_medica`
- `integracao`

**Novas colunas na tabela `candidates`:**

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `board_opinion` | text | Parecer/ata da diretoria |
| `medical_status` | text | 'favoravel' ou 'desfavoravel' |
| `medical_opinion` | text | Observacoes medicas |
| `integration_date` | date | Data da integracao |
| `integration_report` | text | Relatorio da tarde de experiencia |
| `contract_status` | text | 'pendente' ou 'assinado' (default: 'pendente') |
| `admission_date` | date | Data de efetivacao do acolhimento |

### 2. Novos Componentes

| Arquivo | Funcionalidade |
|---------|---------------|
| `src/components/triagens/FilaEsperaTab.tsx` | Lista candidatos em `lista_espera`, permite alterar prioridade e enviar para Diretoria |
| `src/components/triagens/DiretoriaTab.tsx` | Lista candidatos em `decisao_diretoria`, textarea para parecer da ata, envia para Parecer Medico |
| `src/components/triagens/ParecerMedicoTab.tsx` | Lista candidatos em `avaliacao_medica`, botoes Apto/Inapto, observacoes, envia para Integracao |
| `src/components/triagens/IntegracaoTab.tsx` | Lista candidatos em `integracao`, data de integracao, status do contrato, relatorio, botao "Acolher" |

Cada aba segue o mesmo padrao das abas existentes: lista de cards com busca, clique para abrir modal de gestao.

### 3. Alteracoes em Arquivos Existentes

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Triagens.tsx` | Adicionar as 4 novas abas (ativar Lista de Espera, adicionar Diretoria, Parecer Medico, Integracao); remover abas Acolhidos desabilitada |
| `src/components/triagens/StatusCards.tsx` | Adicionar cards para `decisao_diretoria`, `avaliacao_medica`, `integracao`; ativar todos |
| `src/components/triagens/EntrevistasTab.tsx` | Ajustar acao de "enviar para fila de espera" (stage `lista_espera`) ao concluir entrevista |
| `src/hooks/useCandidates.ts` | Adicionar `useCandidateCounts` para os novos stages |

### 4. Funcionalidades por Aba (baseado no prototipo)

**Fila de Espera:**
- Lista de candidatos com prioridade visivel
- Permite alterar prioridade (Padrao / Social Urgente / Dependencia Duvidosa)
- Botao "Enviar para Parecer da Diretoria"
- Opcao de arquivar

**Diretoria:**
- Campo textarea para registrar decisao oficial / ata de reuniao
- Campo obrigatorio para prosseguir
- Botao "Encaminhar para Parecer Medico"
- Opcao de arquivar

**Parecer Medico:**
- Dois botoes: "Apto" e "Inapto"
- Campo textarea para observacoes medicas
- Se Apto: botao "Seguir para Integracao"
- Se Inapto: opcao de arquivar com motivo "Inapto Clinico"

**Integracao:**
- Campo data da integracao
- Select status do contrato (Pendente / Assinado)
- Campo textarea relatorio da integracao
- Botao "Gerar Relatorio Completo" (abre janela de impressao)
- Botao "Acolher" (so habilitado quando contrato = assinado)
- Ao acolher, candidato vai para stage `acolhido` com `admission_date` preenchida

### 5. Sequencia de Implementacao

1. Migration SQL (adicionar enum values + colunas)
2. Criar os 4 componentes de aba
3. Atualizar `Triagens.tsx` e `StatusCards.tsx`
4. Ajustar `EntrevistasTab.tsx` para progressao correta
5. Atualizar `useCandidates.ts` para contar novos stages
