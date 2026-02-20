

## Sistema de Gestão ILPI — Módulo de Triagens (Fase 1)

### Visão Geral
Sistema de gestão para Instituições de Longa Permanência para Idosos (ILPI), vinculado à SSVP. Nesta primeira fase, implementaremos o módulo **Triagens** com as abas **Agendamentos** e **Entrevistas**, com backend completo (Supabase) e estrutura multi-tenant desde o início.

---

### 1. Estrutura Multi-Tenant (Banco de Dados)
Criação da hierarquia organizacional que será a base de todo o sistema:
- **Tabela de organizações** com tipo (Conselho Nacional, Metropolitano, Central, Obra Unida) e referência ao nível superior
- **Tabela de user_roles** vinculando usuários a organizações e seus papéis
- Toda tabela de dados terá uma coluna `organization_id` para isolamento de dados
- **Políticas RLS** garantindo que cada instituição veja apenas seus dados (preparado para futuramente permitir acesso dos conselhos superiores)

### 2. Autenticação
- Tela de login com email e senha
- Vinculação do usuário à sua organização (Obra Unida)
- Proteção de rotas — apenas usuários autenticados acessam o sistema

### 3. Layout Principal
- **Sidebar** com navegação lateral no estilo do protótipo (azul escuro #004c99)
- Logo SSVP e identidade visual do protótipo (tipografia bold/uppercase, cores azul e vermelho)
- Menu com item "Triagens" ativo (demais itens visíveis mas desabilitados para futuras fases)

### 4. Aba Agendamentos (Etapa 0)
- **Header** com título "Fluxo de Triagem", campo de busca e botão "Novo Agendamento"
- **Cards de status** mostrando contagem por etapa (Agendamentos e Entrevistas ativos; demais etapas visíveis mas desabilitadas)
- **Lista de candidatos** agendados com nome, telefone, endereço, data de contato e badge de prioridade
- **Modal "Novo Agendamento"** — formulário simples com: Nome do Idoso, Telefone, Data do Contato e Endereço da Visita
- **Modal "Gerenciar Etapa"** — ao clicar em um candidato, permite: iniciar a entrevista (abrir ficha completa) ou evoluir para a etapa de Entrevista
- Opção de **arquivar** candidato com motivo (Inapto Clínico, Desistência, etc.)

### 5. Aba Entrevistas (Etapa 1)
- Lista de candidatos na fase de entrevista
- **Formulário completo de Entrevista Social** com 11 seções numeradas:
  1. Identificação do Idoso (nome, nascimento, sexo, estado civil, RG, CPF, endereço, telefone)
  2. Responsável Legal/Familiar
  3. Composição Familiar e Rede de Apoio (com quem reside, filhos, cuidador, rede de apoio)
  4. Composição Familiar Detalhada (tabela dinâmica com nome, parentesco, idade, trabalho, renda)
  5. Condições de Moradia
  6. Situação Socioeconômica (fonte de renda, empréstimos, condições da família)
  7. Condições de Saúde (diagnósticos, medicação, acompanhamento, comprometimento cognitivo)
  8. Grau de Dependência (higiene, alimentação, locomoção, banheiro, medicação)
  9. Aspectos Psicossociais (conflitos familiares, concordância do idoso e família)
  10. Motivo da Solicitação do Acolhimento
  11. Parecer Social
- Configuração de **prioridade** (Social Urgente, Dependência Duvidosa, Padrão)
- Barra fixa superior com botões **Salvar** e **Imprimir Ficha**
- Opção de evoluir para Lista de Espera (campo visível, mas etapa desabilitada nesta fase)

### 6. Seções Complementares
- **Painel de Arquivados** — lista de candidatos descartados com motivo
- **Painel de Acolhidos** — lista de candidatos que foram admitidos
- **Exportar PDF** — geração de relatório completo de candidatos por status

### 7. Design e UX
- Fidelidade ao protótipo: cores #004c99 (azul), #e31b23 (vermelho), fundo cinza claro
- Tipografia Inter, estilo bold/uppercase nas labels e títulos
- Cards arredondados (border-radius grande), sombras suaves
- Modais com backdrop blur e animações de entrada
- Responsividade para desktop e tablet

