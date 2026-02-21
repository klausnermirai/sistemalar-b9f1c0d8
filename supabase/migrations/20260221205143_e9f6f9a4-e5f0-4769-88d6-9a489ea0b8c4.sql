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