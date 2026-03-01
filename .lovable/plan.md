

## Melhorias: Cards Clicaveis + Arquivamento Flexivel + Controle de Vagas + Indicadores

### 1. Cards Clicaveis na Triagem (remover tabs duplicadas)

**Arquivos alterados**: `StatusCards.tsx`, `Triagens.tsx`

- `StatusCards` recebe callback `onStageClick(stage)` e remove o card "Acolhidos"
- Cada card fica clicavel, com visual de selecionado (borda/cor) para o stage ativo
- `Triagens.tsx` remove o `TabsList` (botoes duplicados) e os TabsTriggers de "Acolhidos" e "Arquivados"
- A navegacao passa a ser feita exclusivamente pelos cards — ao clicar, seta o `activeTab` correspondente
- Manter o `TabsContent` para renderizar o conteudo de cada etapa
- Adicionar novo tab "arquivados" com componente `ArquivadosTab` para consulta do historico

**Novo arquivo**: `src/components/triagens/ArquivadosTab.tsx`
- Lista candidatos com `stage = "arquivado"`, exibindo nome, motivo e data do arquivamento
- Somente leitura (consulta)

---

### 2. Arquivamento Flexivel em Todas as Etapas

**Arquivos alterados**: `EntrevistasTab.tsx`, `FilaEsperaTab.tsx`, `DiretoriaTab.tsx`, `ParecerMedicoTab.tsx`, `IntegracaoTab.tsx`

Cada aba de etapa que ainda nao tem, recebe um modal padronizado de arquivamento com:
- Select obrigatorio com motivos fixos:
  - Institucionalizado em outro local
  - Falecimento
  - Desistencia do idoso
  - Desistencia familiar
- Campo opcional de descricao complementar (textarea)
- Ao confirmar: `stage = "arquivado"`, `archive_reason = motivo selecionado`, `archived_at = now()`

O `AgendamentosTab` ja possui modal de arquivamento — sera atualizado para usar a nova lista de motivos padronizados.

**Novo componente reutilizavel**: `src/components/triagens/ArchiveModal.tsx`
- Recebe `open`, `onClose`, `onConfirm`, `isPending`
- Contem o Select de motivos + textarea opcional
- Todas as tabs importam este componente ao inves de duplicar a logica

---

### 3. Controle de Vagas (Configuracoes)

**Banco de dados**: Nova tabela `rooms` + novas colunas em `organizations`

Migration SQL:
```sql
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS total_male_beds integer NOT NULL DEFAULT 30;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS total_female_beds integer NOT NULL DEFAULT 22;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS total_male_rooms integer NOT NULL DEFAULT 12;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS total_female_rooms integer NOT NULL DEFAULT 8;

CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  identifier text NOT NULL,
  type text NOT NULL DEFAULT 'masculino',
  beds integer NOT NULL DEFAULT 1,
  observations text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
-- RLS: mesmas politicas padrao por org
```

**Arquivo alterado**: `Settings.tsx`
- Nova aba (visivel para admin): "Estrutura do Lar"
- Campos editaveis: vagas masculinas, femininas, quartos masculinos, femininos
- Tabela de quartos: listar, criar, editar, excluir quartos (identificador, tipo, camas, obs)
- Salvar atualiza `organizations` e `rooms`

**Novo hook**: `src/hooks/useRooms.ts`
- CRUD para tabela `rooms`

---

### 4. Indicadores de Vagas no Topo (Triagens + Residentes)

**Novo componente**: `src/components/shared/OccupancyPanel.tsx`
- Busca dados de `organizations` (vagas configuradas) e conta residentes ativos por genero
- Exibe painel com:
  - ACOLHIDOS: X Homens | X Mulheres
  - VAGAS DISPONIVEIS: X Homens | X Mulheres
- Calculo: vagas disponiveis = vagas configuradas - residentes ativos do genero
- Visual: cards coloridos compactos no topo

**Novo hook**: `src/hooks/useOccupancy.ts`
- Query em `residents` filtrando `status = 'ativo'` e agrupando por `gender`
- Query em `organizations` para buscar `total_male_beds` e `total_female_beds`
- Retorna `{ maleResidents, femaleResidents, maleBeds, femaleBeds, maleAvailable, femaleAvailable }`

**Arquivos alterados**:
- `Triagens.tsx`: adicionar `OccupancyPanel` abaixo do titulo, acima dos cards
- `Residentes.tsx`: adicionar `OccupancyPanel` abaixo do titulo, acima da lista

---

### 5. Resumo de Entregas

| Item | Tipo |
|------|------|
| 4 colunas novas em `organizations` (vagas/quartos) | Migration |
| Tabela `rooms` com RLS | Migration |
| Cards clicaveis + remocao de tabs duplicadas | Edicao StatusCards + Triagens |
| Remocao do card "Acolhidos" da triagem | Edicao StatusCards |
| ArquivadosTab.tsx (lista de arquivados) | Novo componente |
| ArchiveModal.tsx (modal padronizado) | Novo componente |
| Arquivamento em todas as etapas com motivos padrao | Edicao de 6 tabs |
| Secao "Estrutura do Lar" em Configuracoes | Edicao Settings |
| useRooms.ts | Novo hook |
| OccupancyPanel.tsx + useOccupancy.ts | Novos componentes |
| Indicadores no topo de Triagens e Residentes | Edicao paginas |

Nenhuma alteracao em modulos nao mencionados (Prontuario, PIA, Mural, Atendimento).

