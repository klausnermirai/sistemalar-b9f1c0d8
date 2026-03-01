

## 3 Funcionalidades: Prontuario Multidisciplinar + PIA + Mural

### Visao Geral

Implementar 3 funcionalidades novas sem alterar nenhuma estrutura existente:
1. **Prontuario Multidisciplinar** - timeline consolidada dentro de Residentes
2. **PIA** - Plano Individual de Atendimento autoabastecido dentro de Residentes
3. **Mural** - chat institucional com nao-lidas e exportacao WhatsApp

---

### 1. Banco de Dados — Novas Tabelas

#### Tabela `pia` (Plano Individual de Atendimento)

| Coluna | Tipo | Obs |
|--------|------|-----|
| id | uuid PK | |
| resident_id | uuid FK residents | |
| status | text | ativo/em_revisao/encerrado |
| team_synthesis | text | sintese geral editavel |
| interventions_psychology | text | plano intervencoes psico |
| interventions_nutrition | text | plano intervencoes nutri |
| interventions_other | text | outras competencias |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### Tabela `pia_goals` (Metas por competencia)

| Coluna | Tipo |
|--------|------|
| id | uuid PK |
| pia_id | uuid FK pia |
| competency | text |
| goal_text | text |
| status | text |
| review_deadline | date |
| observations | text |
| created_at | timestamptz |

#### Tabela `pia_revisions` (Historico de revisoes)

| Coluna | Tipo |
|--------|------|
| id | uuid PK |
| pia_id | uuid FK pia |
| date | date |
| revised_by | text |
| changes_description | text |
| created_by | uuid |
| created_at | timestamptz |

#### Tabela `mural_messages` (Mural institucional)

| Coluna | Tipo |
|--------|------|
| id | uuid PK |
| organization_id | uuid FK organizations |
| author_id | uuid |
| author_name | text |
| content | text |
| source_type | text | nutricao/psicologia/manual/etc |
| source_resident_name | text | nome do residente se aplicavel |
| created_at | timestamptz |

#### Tabela `mural_reads` (Controle de leitura)

| Coluna | Tipo |
|--------|------|
| id | uuid PK |
| user_id | uuid |
| organization_id | uuid FK |
| last_read_at | timestamptz |

Todas com RLS seguindo padrao existente (`user_belongs_to_org`). Triggers `updated_at` onde aplicavel.

Adicionar coluna `mural_whatsapp_phone` (text, nullable) na tabela `organizations`.

---

### 2. Prontuario Multidisciplinar (dentro de Residentes)

**Localizacao**: Nova aba "Prontuario" no `ResidentForm.tsx` (ao lado de Dados Pessoais, Familiares, etc.)

**Arquivos novos**:
- `src/components/residentes/ProntuarioTab.tsx` — componente da aba
- `src/hooks/useMultidisciplinaryRecord.ts` — hook que consulta TODAS as tabelas de atendimento do residente e unifica em timeline

**Funcionamento**:
- O hook faz queries paralelas nas 7 tabelas existentes: `psychology_anamnesis`, `psychology_assessments`, `psychology_evolutions`, `psychology_attendances`, `nutrition_assessments`, `nutrition_evolutions`, `nutrition_attendances`
- Unifica todos os registros em um array com formato `{ date, competency, type, professional, summary, fullData }`
- Ordena por data (mais recente primeiro)
- Filtros: competencia (dropdown), periodo (date range), checkbox "somente mural"
- Cada item na timeline: card compacto com data, badge da competencia, tipo, resumo truncado e botao "Ver completo" (dialog)
- Conteudo sigiloso da psicologia (`private_notes`): exibe "Conteudo restrito" para todos; nao ha controle de role nesta fase
- Botao "Gerar PDF": usa `window.print()` com CSS de impressao ou gera HTML formatado para download. Respeita sigilo (nao inclui `private_notes`)

**Alteracao em `ResidentForm.tsx`**: Adicionar nova tab "Prontuario" (habilitada somente em modo edicao, como as outras abas)

---

### 3. PIA — Plano Individual de Atendimento (dentro de Residentes)

**Localizacao**: Nova aba "PIA" no `ResidentForm.tsx`

**Arquivos novos**:
- `src/components/residentes/PIATab.tsx` — componente completo
- `src/hooks/usePIA.ts` — hook para tabelas `pia`, `pia_goals`, `pia_revisions`

**Funcionamento**:
- Ao abrir, busca PIA existente do residente. Se nao existir, botao "Criar PIA"
- **Auto-abastecimento**: O componente faz query na `psychology_anamnesis` (campo `initial_psychological_synthesis` e `pia_psychological_goals`) e `nutrition_assessments` (campo `nutritional_diagnosis` e `pia_nutritional_goals`) para exibir automaticamente na secao de diagnostico
- Secoes:
  - A) Identificacao: status (select), data criacao, ultima revisao
  - B) Diagnostico Multidisciplinar: dados auto-preenchidos (read-only, vindos das avaliacoes) + campo editavel "Sintese geral da equipe"
  - C) Metas por competencia: lista de metas com competencia, texto, status (em_andamento/atingida/nao_atingida), prazo revisao, observacoes. Botao "Adicionar meta"
  - D) Plano de intervencoes por competencia: textareas editaveis (psicologia, nutricao, outros)
  - E) Revisoes: lista historica + botao "Nova revisao" (data auto, responsavel auto, campo descricao)
- Botao "Gerar PDF": monta documento completo com todas as secoes

---

### 4. Mural (Chat Institucional)

**Localizacao**: Icone na top bar (header do `AppLayout.tsx`) com badge de nao-lidas. Abre como sheet/drawer lateral.

**Arquivos novos**:
- `src/components/mural/MuralSheet.tsx` — drawer/sheet com o chat
- `src/components/mural/MuralBadge.tsx` — icone + badge de nao-lidas para o header
- `src/hooks/useMural.ts` — hook para mensagens + leitura

**Funcionamento**:
- `useMural` busca mensagens da `mural_messages` filtradas por `organization_id` do usuario
- Exibe em formato chat (mais recente embaixo), com avatar/nome do autor, data/hora, conteudo
- Campo de input na parte inferior para postar nova mensagem
- Badge: conta mensagens com `created_at > last_read_at` do usuario. Ao abrir, faz upsert em `mural_reads`
- **Exportacao**:
  - Botao "Exportar" no topo do mural
  - Opcoes: "Por data" (seletor de data, gera texto de todas as mensagens daquele dia) ou clicar em mensagem especifica
  - Gera texto formatado: `[DD/MM/YYYY HH:mm] Nome: Mensagem`
  - Botoes "Copiar" e "Enviar no WhatsApp" (abre `https://wa.me/{telefone}?text={texto}` usando telefone configurado)
- `source_type` e `source_resident_name` permitem identificar mensagens que vieram de campos "mural" das competencias (preparado para integracao futura)

**Alteracao em `AppLayout.tsx`**: Adicionar `MuralBadge` no header ao lado do `SidebarTrigger`

**Alteracao em `Settings.tsx`**: Adicionar campo "Telefone WhatsApp do Mural" na aba Instituicao

**Alteracao em `organizations`**: Adicionar coluna `mural_whatsapp_phone`

---

### 5. Resumo de Entregas

| Item | Tipo |
|------|------|
| 5 tabelas novas (pia, pia_goals, pia_revisions, mural_messages, mural_reads) | Migration SQL |
| 1 coluna nova em organizations | Migration SQL |
| RLS para todas as tabelas | Migration SQL |
| ProntuarioTab.tsx + useMultidisciplinaryRecord.ts | Componentes React |
| PIATab.tsx + usePIA.ts | Componentes React |
| MuralSheet.tsx + MuralBadge.tsx + useMural.ts | Componentes React |
| Alteracao ResidentForm.tsx (2 abas novas) | Edicao |
| Alteracao AppLayout.tsx (badge mural) | Edicao |
| Alteracao Settings.tsx (campo whatsapp) | Edicao |

Nenhuma alteracao em sidebar, rotas, triagens, competencias existentes ou qualquer outro modulo.

