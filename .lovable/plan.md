

## Estrutura de Acesso e Configuracao - Adaptando o Prototipo

### Objetivo
Implementar o fluxo de configuracao e acesso do prototipo no sistema atual, adaptando para usar o backend com autenticacao real (Supabase Auth) em vez de localStorage. Inclui: tela de primeiro acesso (Setup), login com identificacao da instituicao, configuracoes da instituicao e controle de acesso de usuarios.

---

### O que ja existe (e sera aproveitado)
- Tabela `organizations` com hierarquia (parent_id) e tipos (conselho_nacional, metropolitano, central, obra_unida)
- Tabela `user_roles` vinculando usuarios a organizacoes com papeis (admin, coordinator, social_worker, viewer)
- Tabela `profiles` com dados do usuario
- Autenticacao via Supabase Auth (email/senha)
- Funcoes RLS: `user_belongs_to_org`, `has_role`, `get_user_organization_id`

### Mudancas no Banco de Dados

1. **Adicionar campos na tabela `organizations`**:
   - `cnpj` (text, nullable) - identificador da instituicao no login
   - `city` (text, nullable) - cidade da obra unida
   - `central_council_name` (text, nullable) - nome do conselho central vinculado (texto livre por enquanto)
   - `metropolitan_council_name` (text, nullable) - nome do conselho metropolitano vinculado

2. **Adicionar campo na tabela `profiles`**:
   - `role_title` (text, nullable) - cargo/funcao na instituicao (ex: "Gestor(a)", "Assistente Social")

3. **Adicionar campo na tabela `user_roles`**:
   - `is_primary` (boolean, default true) - para identificar a organizacao principal do usuario

### Mudancas no Frontend

#### 1. Tela de Login (refatorar `Auth.tsx`)
Adaptar para seguir o design do prototipo:
- Campo CNPJ da Instituicao (identifica a organizacao)
- Campo E-mail (em vez de username, ja que usamos Supabase Auth)
- Campo Senha com toggle de visibilidade
- Visual com fundo azul #004c99, card arredondado (rounded-[40px]), tipografia bold/uppercase
- Logo SSVP estilizado

#### 2. Tela de Primeiro Acesso (novo: `SetupScreen.tsx`)
Fluxo em 2 etapas para configuracao inicial da instituicao:
- **Etapa 1 - Instituicao**: Tipo de entidade (Obra Unida / Conselho), nome, CNPJ, cidade, conselhos vinculados
- **Etapa 2 - Administrador**: Nome completo, e-mail, senha, cargo
- Ao finalizar: cria a organizacao no banco, registra o usuario via Supabase Auth, atribui role "admin"
- Visual identico ao prototipo (sidebar de progresso, cards arredondados)

#### 3. Pagina de Configuracoes (novo: `Settings.tsx`)
Modulo com 2 abas:
- **Aba Instituicao**: Editar dados da organizacao (nome, CNPJ, cidade, conselhos vinculados, tipo de entidade)
- **Aba Controle de Acesso**: 
  - Lista de usuarios da organizacao com nome, username, cargo
  - Formulario para convidar novo usuario (e-mail, nome, cargo, papel)
  - Acoes: alterar senha, excluir usuario
  - O admin padrao nao pode ser excluido

#### 4. Layout/Sidebar (atualizar `AppSidebar.tsx` e `AppLayout.tsx`)
- Exibir nome da instituicao e informacoes do conselho vinculado na sidebar
- Adicionar item "Configuracoes" no menu (habilitado)
- Exibir nome do usuario logado no footer da sidebar

#### 5. Fluxo de Navegacao (atualizar `App.tsx`)
- Rota `/auth` - Login
- Rota `/setup` - Primeiro acesso (acessivel apenas quando nao ha organizacao configurada)
- Rota `/configuracoes` - Pagina de configuracoes
- Rota `/triagens` - Modulo de triagens (ja existe)

### Detalhes Tecnicos

#### Banco de Dados (Migrations)
```text
-- Adicionar campos a organizations
ALTER TABLE organizations ADD COLUMN cnpj text;
ALTER TABLE organizations ADD COLUMN city text;
ALTER TABLE organizations ADD COLUMN central_council_name text;
ALTER TABLE organizations ADD COLUMN metropolitan_council_name text;

-- Adicionar campo a profiles
ALTER TABLE profiles ADD COLUMN role_title text;
```

#### Fluxo de Setup (Edge Function ou cliente direto)
O setup criara:
1. Registro do usuario via `supabase.auth.signUp()`
2. A organizacao via insert na tabela `organizations`
3. O vinculo via insert na tabela `user_roles` com role = 'admin'
4. O profile sera criado automaticamente pelo trigger existente `handle_new_user`

**Problema**: O insert em `organizations` requer que o usuario ja pertenca a org (RLS). Solucao: criar uma **edge function `setup-organization`** que usa service_role para:
- Criar a organizacao
- Criar o user_role vinculando o usuario recem-criado

#### Login com CNPJ
O login funcionara em 2 passos:
1. Autenticar via Supabase Auth (email + senha)
2. Apos autenticacao, verificar se o CNPJ informado corresponde a organizacao do usuario
3. Se nao corresponder, exibir erro e fazer signOut

#### Convite de Usuarios (Configuracoes)
Para adicionar novos usuarios a organizacao:
- Edge function `invite-user` que usa service_role para criar o usuario e vincular a org
- Ou: registrar o usuario normalmente e associar via CNPJ no login

### Sequencia de Implementacao
1. Migration: adicionar campos no banco
2. Edge function: `setup-organization`
3. Tela de Setup (`/setup`)
4. Refatorar tela de Login com design do prototipo
5. Pagina de Configuracoes
6. Atualizar Sidebar e Layout
7. Atualizar rotas no App.tsx
