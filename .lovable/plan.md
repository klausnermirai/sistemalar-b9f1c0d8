

## Revisao Estrutural para Crescimento Futuro

### Diagnostico Atual

A estrutura do banco de dados ja esta bem encaminhada para multi-tenancy:

- Tabela `organizations` com `org_type` (enum com 4 niveis hierarquicos) e `parent_id` (auto-referencia)
- Isolamento por `organization_id` em `candidates` e `interview_data`
- RLS funcionando via `user_belongs_to_org()`
- Campos `central_council_name` e `metropolitan_council_name` como texto livre (nao sao referencias reais)

### O que precisa mudar

| Alteracao | Motivo |
|-----------|--------|
| Adicionar coluna `state` (Estado/UF) em `organizations` | Permitir filtros geograficos e agrupamentos futuros |
| Adicionar `UNIQUE` constraint no `cnpj` | Evitar duplicatas; CNPJ e o identificador unico de cada instituicao |
| Criar indice em `parent_id` | Performance para consultas hierarquicas futuras |
| Criar indice em `org_type` | Performance para filtros por tipo de entidade |

### O que NAO sera alterado (e por que)

- **`central_council_name` e `metropolitan_council_name`**: Esses campos texto serao mantidos. Hoje servem como registro informativo. No futuro, quando conselhos forem cadastrados no sistema, o `parent_id` assumira o papel de vinculo real e esses campos poderao ser migrados ou descontinuados sem perda de dados.
- **RLS policies**: Continuam filtrando apenas pela organizacao do usuario. A expansao para conselhos verem subordinados via `parent_id` sera feita em etapa futura com funcao `get_subordinate_org_ids()`.
- **Tabelas `candidates` e `interview_data`**: Estrutura permanece igual, ja preparada com `organization_id`.

### Migration SQL

```text
-- 1. Adicionar campo Estado (UF) na tabela organizations
ALTER TABLE public.organizations 
  ADD COLUMN IF NOT EXISTS state text;

-- 2. Garantir unicidade do CNPJ (ignorando nulos)
CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_cnpj_unique 
  ON public.organizations(cnpj) 
  WHERE cnpj IS NOT NULL;

-- 3. Indice para consultas hierarquicas por parent_id
CREATE INDEX IF NOT EXISTS idx_organizations_parent_id 
  ON public.organizations(parent_id) 
  WHERE parent_id IS NOT NULL;

-- 4. Indice para filtros por tipo de organizacao
CREATE INDEX IF NOT EXISTS idx_organizations_org_type 
  ON public.organizations(org_type);
```

### Atualizacoes no Frontend

1. **Setup.tsx**: Adicionar campo "Estado (UF)" no formulario da Etapa 1, visivel para todos os tipos de entidade
2. **Settings.tsx**: Adicionar campo "Estado" na aba de dados da instituicao
3. **Edge function `setup-organization`**: Aceitar e salvar o novo campo `state`

### Atualizacoes no Codigo

| Arquivo | Alteracao |
|---------|-----------|
| Migration SQL | Adicionar `state`, indice unico em `cnpj`, indices em `parent_id` e `org_type` |
| `src/pages/Setup.tsx` | Novo campo "Estado (UF)" na Etapa 1 |
| `src/pages/Settings.tsx` | Novo campo "Estado" na edicao de dados da instituicao |
| `supabase/functions/setup-organization/index.ts` | Aceitar campo `state` no body |

### Visao de Crescimento Futuro (referencia, sem implementacao agora)

Quando for o momento de ativar a hierarquia:

1. Cadastrar conselhos como organizacoes com seus respectivos `org_type`
2. Popular `parent_id` vinculando obras a conselhos centrais, centrais a metropolitanos, etc.
3. Criar funcao `get_subordinate_org_ids(org_id)` que percorre a arvore
4. Ajustar RLS de SELECT para incluir `organization_id IN (get_subordinate_org_ids(...))`
5. Migrar dados de `central_council_name`/`metropolitan_council_name` para referencias reais via `parent_id`

A estrutura proposta suporta tudo isso sem necessidade de mudancas destrutivas.

