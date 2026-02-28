

## Subguia Nutricionista no Atendimento Multidisciplinar

### Visao Geral

Adicionar a competencia **Nutricionista** dentro da pagina Atendimento Multidisciplinar, com 3 abas internas: **Primeira Avaliacao Nutricional**, **Evolucao Nutricional** e **Atendimentos**. Seguindo exatamente os mesmos padroes de codigo e visual da Psicologia ja implementada.

---

### 1. Banco de Dados — 3 Novas Tabelas

#### Tabela `nutrition_assessments` (Primeira Avaliacao Nutricional)

| Coluna | Tipo | Obs |
|--------|------|-----|
| id | uuid PK | |
| resident_id | uuid FK residents | |
| date | date | default CURRENT_DATE |
| weight_kg | numeric | |
| height_m | numeric | |
| imc | numeric | calculado no frontend |
| circ_arm / circ_waist / circ_abdomen / circ_hip / circ_thigh / circ_calf | numeric | todas opcionais |
| measurements_not_possible | boolean | default false |
| chronic_diseases | jsonb | array de strings |
| feeding_route | text | oral/sne/gtt |
| recommended_consistency | text | normal/branda/pastosa/liquida_pastosa |
| oral_health | jsonb | array de strings |
| food_preferences | text | |
| aversions_restrictions | text | |
| severe_allergies | text | destaque visual |
| sex | text | F/M |
| age | numeric | calculado ou informado |
| activity_level | text | sedentario/leve/moderado/intenso |
| tmb | numeric | calculado |
| get | numeric | calculado |
| skinfold_tricipital / bicipital / subscapular / suprailiac | numeric | opcionais |
| body_fat_percentage | numeric | estimado |
| screening_score | numeric | triagem nutricional |
| screening_classification | text | sem_risco/risco/alto_risco |
| screening_observations | text | |
| nutritional_diagnosis | text | conclusao PIA |
| needs_supplementation | boolean | default false |
| supplementation_details | text | |
| pia_nutritional_goals | text | |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### Tabela `nutrition_evolutions` (Evolucao Nutricional)

| Coluna | Tipo |
|--------|------|
| id | uuid PK |
| resident_id | uuid FK |
| date | date |
| current_weight | numeric |
| weight_variation_percent | numeric |
| weight_alert | boolean | default false |
| food_acceptance | text |
| consistency_change | boolean | default false |
| consistency_change_justification | text |
| pia_goal_status | text |
| new_conduct | text |
| created_by | uuid |
| created_at | timestamptz |

#### Tabela `nutrition_attendances` (Atendimentos)

| Coluna | Tipo |
|--------|------|
| id | uuid PK |
| resident_id | uuid FK |
| date_time | timestamptz |
| visit_reason | text |
| attendance_notes | text |
| mural_notes | text |
| signature | text |
| created_by | uuid |
| created_at | timestamptz |

Todas com RLS identico ao padrao existente (join com `residents.organization_id` via `user_belongs_to_org`) e triggers `updated_at` onde aplicavel.

---

### 2. Hooks — 3 Novos Arquivos

Seguindo o padrao exato dos hooks de psicologia (`as any` cast, `useAuth` para `created_by`):

| Arquivo | Funcao |
|---------|--------|
| `src/hooks/useNutritionAssessments.ts` | Query + Upsert para avaliacao inicial |
| `src/hooks/useNutritionEvolutions.ts` | Query + Create para evolucoes |
| `src/hooks/useNutritionAttendances.ts` | Query + Create para atendimentos |

---

### 3. Componentes — 3 Novos Arquivos

| Arquivo | Descricao |
|---------|-----------|
| `src/components/atendimento/NutritionAssessment.tsx` | Formulario completo com secoes A-G, calculo automatico de IMC/TMB/GET, triagem com pontuacao, composicao corporal opcional |
| `src/components/atendimento/NutritionEvolutions.tsx` | Lista + formulario, calculo automatico de variacao de peso, alerta visual se perda > 5% |
| `src/components/atendimento/NutritionAttendances.tsx` | Lista + formulario com campo mural (azul), sem campo sigiloso, assinatura automatica |

---

### 4. Alteracao na Pagina Principal

**`src/pages/AtendimentoMultidisciplinar.tsx`**:
- Habilitar o item "Nutricionista" no array `COMPETENCIAS` (atualmente so Psicologia esta habilitada) adicionando um novo item com icone `Apple` ou similar do lucide-react
- Adicionar bloco condicional `selectedCompetencia === "nutricao"` com as 3 abas

---

### 5. Detalhes dos Calculos Automaticos

**IMC**: `peso / (altura ^ 2)` — exibido ao lado dos campos peso/altura

**TMB (Harris-Benedict)**:
- Homem: `66.5 + (13.75 * peso) + (5.003 * altura_cm) - (6.755 * idade)`
- Mulher: `655.1 + (9.563 * peso) + (1.85 * altura_cm) - (4.676 * idade)`

**GET**: `TMB * fator_atividade` (sedentario=1.2, leve=1.375, moderado=1.55, intenso=1.725)

**Sugestoes caloricas**: Manutencao = GET, Perda = GET - 500, Ganho = GET + 500

**% Gordura** (Durnin-Womersley simplificado): Se houver ao menos 2 dobras, calcular estimativa. Senao, "Dados insuficientes".

**Triagem Nutricional** (MNA simplificado):
- Pontuacao baseada em: apetite (derivado de food_acceptance se existir), IMC, mobilidade (derivado do activity_level), perda de peso recente (derivado de weight_variation). Classificacao: >= 12 sem risco, 8-11 risco, < 8 alto risco. Os campos serao preenchidos diretamente na avaliacao para simplicidade.

**Variacao de peso na Evolucao**: `((peso_atual - peso_anterior) / peso_anterior) * 100`. Peso anterior vem da ultima evolucao ou da avaliacao inicial. Alerta visual (badge vermelho) se perda > 5%.

---

### 6. Resumo de Entregas

| Item | Tipo |
|------|------|
| 3 tabelas no banco | Migration SQL |
| RLS para todas | Migration SQL |
| Triggers updated_at | Migration SQL |
| 3 hooks de dados | Hooks React |
| 3 componentes de nutricao | Componentes React |
| Alteracao AtendimentoMultidisciplinar.tsx | Habilitar Nutricionista |

Nenhuma alteracao em sidebar, rotas, ou qualquer outro modulo existente.

