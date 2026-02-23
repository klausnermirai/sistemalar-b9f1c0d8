

## Implementacao do Modulo de Residentes

### Visao Geral

Criar a guia **Residentes** completa, com 4 abas conforme solicitado: **Dados Pessoais**, **Familiares e Visitantes**, **Financeiro** e **Itens Pessoais**. O modelo de banco sera baseado na planilha fornecida e no prototipo.

---

### 1. Banco de Dados - Novas Tabelas

Baseado na planilha (44 residentes com 53 colunas) e no prototipo, serao criadas 5 tabelas:

#### Tabela `residents` (dados pessoais + documentos + acolhimento)

| Coluna | Tipo | Origem (planilha) |
|--------|------|-------------------|
| id | uuid PK | ID |
| organization_id | uuid FK | vinculo organizacional |
| name | text NOT NULL | Nome |
| nickname | text | Apelido |
| gender | text | Sexo |
| birth_date | date | Data de aniversario |
| nationality | text | (default "Brasileira") |
| naturalness | text | Cidade de emissao |
| marital_status | text | Estado civil |
| education | text | Escolaridade |
| profession | text | Profissao |
| father_name | text | - |
| mother_name | text | - |
| spouse | text | - |
| religion | text | Religiao |
| preferred_hospitals | text | Referencia |
| observations | text | Observacao |
| photo_url | text | - |
| cpf | text | CPF |
| rg | text | RG |
| issuing_body | text | Orgao expeditor |
| voter_title | text | Titulo de eleitor |
| voter_section | text | Secao eleitoral |
| voter_zone | text | Zona eleitoral |
| cert_type | text | Tipo de documento certidao |
| cert_number | text | Numero certidao |
| cert_page | text | Folha |
| cert_book | text | Livro |
| cert_city | text | Cidade de emissao |
| cert_state | text | Estado de emissao |
| cert_date | date | Data de emissao |
| sus_card | text | Numero cartao SUS |
| sams_card | text | Numero cartao SAMS |
| cad_unico | text | Numero do cadastro unico |
| inss_number | text | Numero do beneficio do INSS |
| inss_status | text | Situacao do beneficio do INSS |
| cep | text | CEP |
| city | text | Cidade |
| state | text | Estado |
| neighborhood | text | Bairro |
| address | text | Endereco |
| address_number | text | Numero |
| reference | text | Referencia |
| complement | text | Complemento |
| stay_type | text | Tipo de estadia |
| admission_date | date | Data do acolhimento |
| room | text | Ocupacao do residente |
| income | text | Rendimentos mensalidades |
| admission_reason | text | Motivo do acolhimento |
| dependency_level | text | Grau de dependencia |
| previous_institution | text | Nome de outra instituicao |
| stay_time | text | Tempo de acolhimento da outra inst. |
| change_reason | text | Motivo da troca |
| discharge_date | date | Data do desacolhimento |
| discharge_reason | text | Motivo do desacolhimento |
| favorite_activities | text | Atividades favoritas |
| status | text DEFAULT 'ativo' | Status |
| candidate_id | uuid | vinculo opcional com candidato de triagem |
| created_at | timestamptz | Data de criacao |
| updated_at | timestamptz | - |

#### Tabela `resident_relatives` (familiares/contatos)

| Coluna | Tipo |
|--------|------|
| id | uuid PK |
| resident_id | uuid FK |
| name | text |
| kinship | text |
| phone | text |
| observation | text |
| is_responsible | boolean DEFAULT false |

#### Tabela `resident_visits` (controle de portaria)

| Coluna | Tipo |
|--------|------|
| id | uuid PK |
| resident_id | uuid FK |
| date | date |
| visitor_name | text |
| visitor_doc | text |
| time_in | text |
| time_out | text |
| observation | text |

#### Tabela `resident_financials` (lancamentos financeiros)

| Coluna | Tipo |
|--------|------|
| id | uuid PK |
| resident_id | uuid FK |
| date | date |
| type | text (entrada/saida) |
| description | text |
| amount | numeric(10,2) |

#### Tabela `resident_personal_items` (itens pessoais)

| Coluna | Tipo |
|--------|------|
| id | uuid PK |
| resident_id | uuid FK |
| description | text |
| status | text (Entrada/Saida) |
| date | date |
| observation | text |

**RLS**: Todas as tabelas terao politicas baseadas em `user_belongs_to_org` via join com `residents.organization_id`, seguindo o padrao ja existente em `candidates`.

---

### 2. Componentes Frontend

Seguindo o prototipo, a estrutura sera:

#### Pagina `src/pages/Residentes.tsx`
- Sub-abas: Dados Pessoais, Familiares e Visitantes, Financeiro, Itens Pessoais
- Lista de residentes com busca por nome/CPF
- Botao "Cadastrar Idoso"

#### Componentes:
- `src/components/residentes/ResidentList.tsx` - Tabela/lista de residentes com resumo por aba ativa
- `src/components/residentes/ResidentForm.tsx` - Formulario completo com as 4 abas internas
- `src/components/residentes/DadosPessoaisTab.tsx` - Secoes: Informacoes Pessoais, Documentos, Cartoes/INSS, Endereco, Acolhimento
- `src/components/residentes/FamiliaresVisitantesTab.tsx` - Cadastro de familiares + controle de portaria/visitas
- `src/components/residentes/FinanceiroTab.tsx` - Saldo atual, lancamentos de entrada/saida
- `src/components/residentes/ItensPessoaisTab.tsx` - Catalogo de itens com movimento entrada/saida

#### Hooks:
- `src/hooks/useResidents.ts` - CRUD de residentes
- `src/hooks/useResidentRelatives.ts` - CRUD de familiares
- `src/hooks/useResidentVisits.ts` - CRUD de visitas
- `src/hooks/useResidentFinancials.ts` - CRUD financeiro
- `src/hooks/useResidentItems.ts` - CRUD itens pessoais

#### Rota e Navegacao:
- Adicionar rota `/residentes` no `App.tsx`
- Habilitar o item "Residentes" no `AppSidebar.tsx` (atualmente `enabled: false`)

---

### 3. Fluxo de Uso

```text
/residentes
  |
  +-- Sub-abas no topo: [Dados Pessoais] [Familiares e Visitantes] [Financeiro] [Itens Pessoais]
  |
  +-- Lista de residentes (tabela com busca)
  |     Cada linha mostra: Nome, CPF, resumo da aba ativa, botao de acao
  |
  +-- Ao clicar "Abrir Ficha" ou "Cadastrar Idoso":
        Abre formulario com as mesmas 4 abas
        Botoes: Voltar, Salvar, Exportar PDF
```

### 4. Modelo de Dados para Migracao Futura

A tabela `residents` foi desenhada para receber diretamente os dados da planilha XLS fornecida. O mapeamento de colunas esta documentado na tabela acima. A migracao nao sera feita agora, apenas o modelo.

### 5. Resumo de Entregas

| Item | Tipo |
|------|------|
| 5 tabelas no banco | Migration SQL |
| RLS para todas as tabelas | Migration SQL |
| Trigger updated_at | Migration SQL |
| 1 pagina (Residentes.tsx) | Componente React |
| 6 componentes de residentes | Componentes React |
| 5 hooks de dados | Hooks React |
| Rota + sidebar | Alteracao em App.tsx e AppSidebar.tsx |

