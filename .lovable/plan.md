

## Implantar Terapeuta Ocupacional + Atividades em Grupo

### 1. Banco de Dados — 3 novas tabelas para TO + 1 tabela de Atividades em Grupo

#### Terapeuta Ocupacional (seguindo o padrao das outras competencias)

**`ot_assessments`** — 1a Avaliacao do Terapeuta Ocupacional
- `id`, `resident_id`, `date`, campos clinicos: `functional_independence_level` (text), `adl_evaluation` (text — atividades de vida diaria), `cognitive_motor_screening` (text), `leisure_interests` (text), `environmental_adaptation_needs` (text), `pia_ot_goals` (text), `initial_ot_synthesis` (text), `created_by`, `created_at`, `updated_at`

**`ot_evolutions`** — Evolucoes periodicas
- `id`, `resident_id`, `date`, `functional_status` (text), `adl_progress` (text), `pia_goal_status` (text), `new_conduct` (text), `created_by`, `created_at`

**`ot_attendances`** — Atendimentos individuais
- `id`, `resident_id`, `date_time` (timestamptz), `activity_type` (text), `attendance_notes` (text), `mural_notes` (text), `signature` (text), `created_by`, `created_at`

#### Atividades em Grupo (transversal a todas as competencias)

**`group_activities`** — Registro de atividades coletivas
- `id`, `organization_id`, `date` (date), `time_start` (text), `time_end` (text), `competency` (text — psicologia, nutricao, terapia_ocupacional, etc.), `activity_title` (text), `activity_description` (text), `objectives` (text), `observations` (text), `mural_notes` (text), `signature` (text), `created_by`, `created_at`

**`group_activity_participants`** — Participantes de cada atividade
- `id`, `group_activity_id` (uuid FK), `resident_id` (uuid FK), `participated` (boolean default true), `observation` (text)

Todas as tabelas terao RLS baseado em `organization_id` (via join com `residents` para as de TO, direto para `group_activities`).

---

### 2. Hooks (seguindo padrao existente)

| Arquivo | Descricao |
|---------|-----------|
| `useOTAssessments.ts` | Query + create para `ot_assessments` |
| `useOTEvolutions.ts` | Query + create para `ot_evolutions` |
| `useOTAttendances.ts` | Query + create para `ot_attendances` |
| `useGroupActivities.ts` | Query + create para `group_activities` + participants |

---

### 3. Componentes de UI

| Arquivo | Descricao |
|---------|-----------|
| `OTAssessment.tsx` | Formulario de 1a avaliacao de TO (igual padrao NutritionAssessment) |
| `OTEvolutions.tsx` | Evolucoes de TO (igual padrao NutritionEvolutions) |
| `OTAttendances.tsx` | Atendimentos individuais de TO (igual padrao NutritionAttendances) |
| `GroupActivities.tsx` | Atividades em grupo — formulario com selecao multipla de residentes participantes, campos de atividade, e listagem |

---

### 4. Pagina AtendimentoMultidisciplinar.tsx

- Adicionar `terapia_ocupacional` na lista `ALL_COMPETENCIAS` (icon: `Puzzle` do lucide, enabled: true, module: `"atend:terapia_ocupacional"`)
- Adicionar `atividades_grupo` como item separado na barra lateral (icon: `UsersRound`, enabled: true, module: `"atend:atividades_grupo"`)
- Renderizar as abas de TO: 1a Avaliacao, Evolucoes, Atendimentos
- Renderizar a aba de Atividades em Grupo (sem seletor de residente individual — selecao multipla dentro do formulario)

---

### 5. Permissoes (useUserRole.ts)

Adicionar novos modulos ao mapa de permissoes:
- `"atend:terapia_ocupacional"`: `["admin", "terapeuta_ocupacional"]`
- `"atend:atividades_grupo"`: `["admin", "psicologo", "nutricionista", "terapeuta_ocupacional"]`

Nota: o role `terapeuta_ocupacional` precisara ser adicionado ao enum `app_role` no banco.

---

### 6. Prontuario Multidisciplinar (useMultidisciplinaryRecord.ts)

Adicionar queries de `ot_assessments`, `ot_evolutions`, `ot_attendances` e `group_activities` para aparecerem na timeline consolidada do residente.

---

### Resumo de alteracoes

| Tipo | Arquivos |
|------|----------|
| Migration SQL | 5 tabelas + RLS + enum update |
| Hooks novos | 4 arquivos |
| Componentes novos | 4 arquivos |
| Alteracoes | `AtendimentoMultidisciplinar.tsx`, `useUserRole.ts`, `useMultidisciplinaryRecord.ts` |

