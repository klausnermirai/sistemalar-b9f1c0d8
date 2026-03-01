

## Arquivamento de Residentes + Confirmacao dos Indicadores

### 1. Indicadores de Ocupacao (ja implementado)

O painel `OccupancyPanel` ja esta funcionando na guia Residentes. Ele:
- Conta residentes ativos por sexo (`masculino` / `feminino`) na tabela `residents`
- Busca vagas configuradas em `organizations` (`total_male_beds`, `total_female_beds`)
- Calcula vagas disponiveis automaticamente
- Atualiza em tempo real quando residentes sao acolhidos ou arquivados

Nenhuma alteracao necessaria neste ponto.

---

### 2. Arquivamento de Residentes (nova funcionalidade)

Adicionar botao "Arquivar" na lista de residentes e um modal com motivos especificos para residentes.

#### Componente: `ResidentArchiveModal.tsx` (novo)

Modal reutilizavel similar ao `ArchiveModal` de triagens, mas com motivos proprios:
- **Desacolhimento** (saida voluntaria ou por decisao)
- **Falecimento**
- **Transferencia para outra instituicao**
- **Outros**

Campos:
- Motivo (obrigatorio, lista suspensa)
- Data de saida (obrigatorio, pre-preenchido com data atual)
- Descricao complementar (opcional, texto livre)

#### Alteracao: `ResidentList.tsx`

- Adicionar botao "Arquivar" (icone Archive) ao lado do botao de visualizar na tabela
- Ao clicar, abre o `ResidentArchiveModal`
- Ao confirmar, atualiza o residente com:
  - `status = "desacolhido"` (ou `"falecido"`)
  - `discharge_date = data informada`
  - `discharge_reason = motivo + descricao`
- Invalida queries `["residents"]` e `["occupancy"]` para atualizar contagens

#### Alteracao: `useResidents.ts`

- Adicionar mutation `useArchiveResident` que faz o update de `status`, `discharge_date` e `discharge_reason`
- Invalida as queries de residentes e ocupacao

#### Alteracao: `ResidentList.tsx` — Filtro de status

- Adicionar filtro para mostrar "Ativos" ou "Todos" (incluindo arquivados)
- Por padrao, exibir apenas residentes ativos (`status = "ativo"`)
- Badge com cores diferenciadas: verde para "Ativo", cinza para "Desacolhido", vermelho para "Falecido"

---

### 3. Resumo de Arquivos

| Arquivo | Acao |
|---------|------|
| `src/components/residentes/ResidentArchiveModal.tsx` | Novo componente |
| `src/components/residentes/ResidentList.tsx` | Adicionar botao arquivar + filtro de status |
| `src/hooks/useResidents.ts` | Adicionar `useArchiveResident` mutation |

Nenhuma alteracao no banco de dados necessaria — os campos `status`, `discharge_date` e `discharge_reason` ja existem na tabela `residents`.

