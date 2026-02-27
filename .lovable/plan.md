

## Atendimento Multidisciplinar - Subguia Psicologia

### Visao Geral

Criar a guia **Atendimento Multidisciplinar** no sistema com a subguia **Psicologia** completa, contendo 4 abas: Anamnese, Primeira Avaliacao Psicologica, Evolucao Psicologica e Atendimentos. Seguindo fielmente o prototipo existente e o padrao visual do sistema.

---

### 1. Banco de Dados - 4 Novas Tabelas

#### Tabela `psychology_anamnesis` (avaliacao inicial / anamnese)

| Coluna | Tipo |
|--------|------|
| id | uuid PK |
| resident_id | uuid FK -> residents |
| date | date |
| institutionalization_awareness | text |
| initial_emotional_reaction | jsonb (array de strings) |
| recent_griefs_and_losses | text |
| traumas_and_emotional_triggers | text |
| orientation_level | text |
| mood_screening_gds | text |
| cognitive_screening_mmse | numeric |
| family_bond_quality | text |
| visit_expectations | text |
| initial_psychological_synthesis | text |
| pia_psychological_goals | text |
| created_at | timestamptz |
| updated_at | timestamptz |

#### Tabela `psychology_assessments` (primeira avaliacao psicologica)

Mesma estrutura da anamnese (campos identicos conforme prototipo usa o mesmo formulario `PsychologicalAssessmentForm` com flag `isAnamnese`).

| Coluna | Tipo |
|--------|------|
| id | uuid PK |
| resident_id | uuid FK -> residents |
| date | date |
| institutionalization_awareness | text |
| initial_emotional_reaction | jsonb |
| recent_griefs_and_losses | text |
| traumas_and_emotional_triggers | text |
| orientation_level | text |
| mood_screening_gds | text |
| cognitive_screening_mmse | numeric |
| family_bond_quality | text |
| visit_expectations | text |
| initial_psychological_synthesis | text |
| pia_psychological_goals | text |
| created_at | timestamptz |
| updated_at | timestamptz |

#### Tabela `psychology_evolutions` (evolucoes periodicas)

| Coluna | Tipo |
|--------|------|
| id | uuid PK |
| resident_id | uuid FK -> residents |
| date | date |
| institutional_adaptation_status | text |
| mood_behavior_evolution | text |
| current_socialization_quality | jsonb (array de strings) |
| pia_goal_status | text |
| new_conduct | text |
| created_by | uuid |
| created_at | timestamptz |

#### Tabela `psychology_attendances` (prontuario corrido)

| Coluna | Tipo |
|--------|------|
| id | uuid PK |
| resident_id | uuid FK -> residents |
| date_time | timestamptz |
| intervention_type | text |
| attendance_evolution | text |
| mural_notes | text |
| private_notes | text |
| needs_team_report | boolean DEFAULT false |
| signature | text |
| created_by | uuid |
| created_at | timestamptz |

**RLS**: Todas as tabelas seguem o padrao existente - join com `residents.organization_id` via `user_belongs_to_org`. A tabela `psychology_attendances` tera uma politica especial: o campo `private_notes` sera protegido no nivel da aplicacao (nao retornado para usuarios sem perfil de psicologia). No banco, o campo sera armazenado normalmente mas a logica de acesso sera controlada no frontend.

**Seguranca do campo sigiloso**: O campo `private_notes` sera protegido por confirmacao de senha no frontend (como no prototipo). Futuramente pode ser migrado para controle por role no backend.

---

### 2. Componentes Frontend

#### Nova pagina: `src/pages/AtendimentoMultidisciplinar.tsx`
- Seletor de residente (dropdown com busca)
- Sidebar de competencias (Psicologia habilitada, demais desabilitadas)
- Area de conteudo com sub-abas da competencia selecionada

#### Novos componentes em `src/components/atendimento/`:

| Componente | Funcao |
|-----------|--------|
| `PsychologyAnamnese.tsx` | Formulario de anamnese - Secoes A (Historico/Emocional), B (Rastreio Cognitivo), C (Rede de Apoio), D (Conclusao PIA) |
| `PsychologyAssessment.tsx` | Primeira Avaliacao Psicologica - mesmo formulario, dados separados |
| `PsychologyEvolutions.tsx` | Lista + formulario de evolucoes - adaptacao institucional, humor, socializacao, meta PIA |
| `PsychologyAttendances.tsx` | Lista + formulario de atendimentos com 3 areas: prontuario, mural, sigiloso |

#### Novos hooks em `src/hooks/`:

| Hook | Tabela |
|------|--------|
| `usePsychologyAnamnesis.ts` | psychology_anamnesis |
| `usePsychologyAssessments.ts` | psychology_assessments |
| `usePsychologyEvolutions.ts` | psychology_evolutions |
| `usePsychologyAttendances.ts` | psychology_attendances |

---

### 3. Navegacao

- Adicionar item "Atendimento Multidisciplinar" no sidebar (`AppSidebar.tsx`) com icone `Brain` ou `HeartPulse`
- Adicionar rota `/atendimento` no `App.tsx`

---

### 4. Detalhes dos Formularios (baseado no prototipo)

**Anamnese e Primeira Avaliacao** (mesmo layout, dados separados):
- Consciencia da Institucionalizacao (select: vontade propria / persuadido / resistencia / incapaz)
- Reacao Emocional Inicial (checkboxes: Apatia, Tristeza, Agressividade, Ansiedade, Tranquilidade)
- Lutos e Perdas Recentes (textarea)
- Traumas e Gatilhos Emocionais (textarea com destaque vermelho quando preenchido)
- Nivel de Orientacao (select)
- Rastreio de Humor GDS (select)
- Rastreio Cognitivo Mini-Mental (numero)
- Qualidade do Vinculo Familiar (select)
- Expectativa de Visitas (textarea)
- Sintese Psicologica Inicial (textarea)
- Metas Psicologicas para o PIA (textarea)

**Evolucao Psicologica**:
- Data, Status de Adaptacao, Evolucao Humor/Comportamento
- Qualidade da Socializacao (checkboxes)
- Status da Meta do PIA
- Nova Conduta

**Atendimentos**:
- Data/hora automaticos
- Tipo de Intervencao (select: Acolhimento individual, Observacao, Crise, Mediacao, Orientacao familiar)
- Anotacao do Prontuario (textarea - registro profissional normal)
- Compartilhar no Mural (textarea - visivel para equipe)
- Anotacao Privada (textarea - protegida por senha, somente psicologia)
- Checkbox "Precisa de Repasse a Equipe"
- Assinatura automatica do profissional logado

---

### 5. Resumo de Entregas

| Item | Tipo |
|------|------|
| 4 tabelas no banco | Migration SQL |
| RLS para todas as tabelas | Migration SQL |
| Triggers updated_at | Migration SQL |
| 1 pagina (AtendimentoMultidisciplinar.tsx) | Componente React |
| 4 componentes de psicologia | Componentes React |
| 4 hooks de dados | Hooks React |
| Rota + sidebar | Alteracao App.tsx e AppSidebar.tsx |

