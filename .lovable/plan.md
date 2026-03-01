

## Controle de Papeis e Niveis de Acesso

### Visao Geral

Implementar controle de acesso baseado em papeis (RBAC) no sistema, usando os papeis: **Administrador**, **Assistente Social**, **Psicologia** e **Nutricionista**. Cada papel tera visibilidade restrita a modulos especificos.

---

### 1. Banco de Dados — Novos Valores no Enum

A enum `app_role` atualmente tem: `admin`, `coordinator`, `social_worker`, `viewer`.

Adicionar dois novos valores:
- `psicologo`
- `nutricionista`

Manter os existentes para compatibilidade. O mapeamento final:

| Papel solicitado | Valor no enum |
|------------------|---------------|
| Administrador | `admin` |
| Assistente Social | `social_worker` |
| Psicologia | `psicologo` |
| Nutricionista | `nutricionista` |

Migration SQL:
```sql
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'psicologo';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'nutricionista';
```

Nenhuma alteracao em RLS necessaria — as politicas ja usam `user_belongs_to_org` para isolamento multi-tenant, sem filtrar por papel.

---

### 2. Hook de Permissoes — `useUserRole.ts`

Novo arquivo: `src/hooks/useUserRole.ts`

Funcionalidade:
- Busca o papel do usuario logado na tabela `user_roles`
- Expoe: `role`, `isAdmin`, `isSocialWorker`, `isPsicologo`, `isNutricionista`
- Expoe funcao utilitaria `canAccess(module)` que retorna `true/false` baseado na matriz de permissoes

Matriz de permissoes codificada no hook:

| Modulo/Aba | admin | social_worker | psicologo | nutricionista |
|------------|-------|---------------|-----------|---------------|
| Triagens | Sim | Sim | Nao | Nao |
| Residentes | Sim | Sim | Sim | Sim |
| Res: Dados Pessoais | Sim | Sim | Sim | Sim |
| Res: Familiares | Sim | Sim | Nao | Nao |
| Res: Financeiro | Sim | Sim | Nao | Nao |
| Res: Itens Pessoais | Sim | Sim | Nao | Nao |
| Res: Prontuario | Sim | Sim | Sim | Sim |
| Res: PIA | Sim | Sim | Sim | Sim |
| Atendimento | Sim | Nao | Sim | Sim |
| Atend: Psicologia | Sim | Nao | Sim | Nao |
| Atend: Nutricao | Sim | Nao | Nao | Sim |
| Configuracoes | Sim | Nao | Nao | Nao |

---

### 3. Alteracoes nos Componentes

#### `AppSidebar.tsx`
- Importar `useUserRole`
- Filtrar `menuItems` baseado em `canAccess`: ocultar itens do menu que o usuario nao pode acessar
- Triagens: visivel apenas para admin e social_worker
- Atendimento: visivel para admin, psicologo, nutricionista
- Configuracoes: visivel apenas para admin

#### `ResidentForm.tsx`
- Importar `useUserRole`
- Ocultar abas (Familiares, Financeiro, Itens) para psicologo e nutricionista
- Manter Dados Pessoais, Prontuario e PIA visiveis para todos

#### `AtendimentoMultidisciplinar.tsx`
- Importar `useUserRole`
- Filtrar competencias visiveis: psicologo ve apenas Psicologia, nutricionista ve apenas Nutricao, admin ve tudo

#### `AppLayout.tsx`
- Adicionar verificacao: se usuario tenta acessar rota sem permissao (ex: `/triagens` sendo nutricionista), exibir mensagem "Voce nao tem permissao para acessar esta area." ao inves do conteudo

#### `Settings.tsx`
- Visivel apenas para admin (ja controlado pelo menu, mas proteger tambem a rota)
- Atualizar o Select de papel no convite para incluir os novos papeis:
  - Administrador (`admin`)
  - Assistente Social (`social_worker`)
  - Psicologia (`psicologo`)
  - Nutricionista (`nutricionista`)
- Remover `coordinator` e `viewer` que nao sao usados no novo modelo
- Adicionar funcionalidade para admin editar papel de usuarios existentes
- Admin pode redefinir senha de outros usuarios (botao ao lado de cada membro)

#### Redefinicao de Senha
- Cada usuario pode alterar sua propria senha: adicionar secao "Minha Conta" no Settings ou um novo item acessivel a todos
- Admin pode redefinir senha de outros: usar edge function que chama `supabase.auth.admin.updateUser`

---

### 4. Edge Function — `reset-user-password`

Nova edge function: `supabase/functions/reset-user-password/index.ts`

- Recebe `user_id` e `new_password`
- Verifica que o chamador e admin da mesma organizacao
- Usa `supabase.auth.admin.updateUser({ password })` com service role key
- Retorna sucesso ou erro

---

### 5. Pagina/Secao "Minha Conta"

Adicionar aba "Minha Conta" no Settings (acessivel a TODOS os papeis, nao apenas admin):
- Exibe nome do usuario e papel (read-only)
- Campo para alterar senha propria (senha atual + nova senha + confirmacao)
- Usa `supabase.auth.updateUser({ password })` do lado do cliente

A aba "Instituicao" e "Controle de Acesso" continuam restritas ao admin.

---

### 6. Resumo de Entregas

| Item | Tipo |
|------|------|
| 2 novos valores na enum `app_role` | Migration SQL |
| Hook `useUserRole.ts` com matriz de permissoes | Hook React |
| Edge function `reset-user-password` | Backend |
| AppSidebar.tsx — menu filtrado por papel | Edicao |
| ResidentForm.tsx — abas filtradas por papel | Edicao |
| AtendimentoMultidisciplinar.tsx — competencias filtradas | Edicao |
| AppLayout.tsx — bloqueio de rota sem permissao | Edicao |
| Settings.tsx — novos papeis + redefinir senha + minha conta | Edicao |

Nenhuma alteracao em tabelas existentes, RLS, ou modulos nao mencionados.

