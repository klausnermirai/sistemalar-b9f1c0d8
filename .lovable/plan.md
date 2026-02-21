

## Plano de Correcoes e Melhorias

### 1. Corrigir "Email not confirmed"

**Causa raiz:** O Supabase Auth exige confirmacao de e-mail por padrao. Quando o usuario e criado via `signUp()` no Setup ou via `admin.createUser()` no invite-user, o campo `confirmed_at` fica vazio, bloqueando o login.

**Solucao:**
- Habilitar auto-confirm de e-mail nas configuracoes de autenticacao do backend (configure-auth tool)
- A edge function `invite-user` ja passa `email_confirm: true` no `admin.createUser()`, o que esta correto
- O `signUp()` no Setup tambem passara a funcionar automaticamente com auto-confirm habilitado

### 2. Proteger /setup com credenciais de desenvolvedor

**Solucao:** Criar um "Dev Gate" na propria tela `/setup`:

- Ao acessar `/setup`, o usuario ve primeiro um modal pedindo credenciais do desenvolvedor
- As credenciais sao verificadas via uma edge function `verify-dev-access` que consulta secrets do backend (`DEV_SETUP_USER` e `DEV_SETUP_PASS`)
- Se corretas, libera o wizard de configuracao; se erradas, bloqueia com mensagem de erro
- Nenhuma credencial fica hardcoded no frontend

**Implementacao tecnica:**
- Criar 2 secrets: `DEV_SETUP_USER` e `DEV_SETUP_PASS`
- Criar edge function `verify-dev-access` que recebe username/password e compara com os secrets
- No `Setup.tsx`, adicionar estado `devAuthenticated` e um modal inicial de autenticacao dev
- So apos autenticacao dev bem-sucedida o wizard de configuracao e exibido

### 3. Multi-instituicao (CNPJ como tenant)

**O que ja esta implementado e funcionando:**
- Todas as tabelas relevantes (`candidates`, `interview_data`) ja usam `organization_id` como tenant
- RLS ja filtra por `user_belongs_to_org(auth.uid(), organization_id)` em todas as tabelas
- Login ja valida CNPJ contra a organizacao do usuario
- Edge functions ja isolam dados por organizacao
- Instituicao A ja nao ve dados da instituicao B

**O que falta para hierarquia de conselhos (visao futura):**
- Hoje o campo `parent_id` na tabela `organizations` existe mas nao e utilizado
- Para conselhos verem dados de subordinados, sera necessario no futuro:
  - Popular `parent_id` vinculando obras unidas aos seus conselhos centrais, e assim por diante
  - Criar funcao RLS `get_subordinate_org_ids(org_id)` que percorre a arvore hierarquica
  - Ajustar as policies de SELECT para incluir organizacoes subordinadas
- **Isso nao sera implementado agora** pois requer modelagem mais robusta e testes com dados reais

### Sequencia de Implementacao

1. Habilitar auto-confirm de e-mail no backend
2. Solicitar ao usuario os secrets `DEV_SETUP_USER` e `DEV_SETUP_PASS`
3. Criar edge function `verify-dev-access`
4. Atualizar `Setup.tsx` com modal de autenticacao dev
5. Testar fluxo completo: setup -> login -> acesso aos dados

### Resumo do que muda

| Arquivo | Alteracao |
|---------|-----------|
| Configuracao de auth | Habilitar auto-confirm |
| `supabase/functions/verify-dev-access/index.ts` | Nova edge function |
| `supabase/config.toml` | Registrar nova funcao |
| `src/pages/Setup.tsx` | Adicionar modal Dev Gate |
| Secrets | Adicionar DEV_SETUP_USER e DEV_SETUP_PASS |

