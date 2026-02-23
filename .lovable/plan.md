

## Como Migrar os Dados da Planilha para o Sistema

### Opcao Recomendada: Edge Function de Importacao

Criar uma funcao no backend que recebe os dados da planilha (em JSON) e insere diretamente na tabela `residents`. Voce podera fazer o upload da planilha pela propria interface do sistema.

---

### O que sera criado

1. **Botao "Importar Planilha"** na pagina de Residentes
2. **Backend function** que processa o arquivo e insere os registros
3. **Mapeamento automatico** das colunas da planilha para as colunas do banco

### Mapeamento Planilha → Banco

A planilha tem 53 colunas. Aqui esta o mapeamento direto:

| Coluna da Planilha | Campo no Banco | Observacao |
|---------------------|----------------|------------|
| Nome | name | direto |
| Apelido | nickname | direto |
| Sexo | gender | direto |
| Data de aniversario | birth_date | converter "10/09/1959" para "1959-09-10" |
| Religiao | religion | direto |
| Profissao | profession | direto |
| Escolaridade | education | direto |
| Estado civil | marital_status | direto |
| RG | rg | direto |
| Orgao expeditor | issuing_body | direto |
| CPF | cpf | direto |
| Titulo de eleitor | voter_title | direto |
| Secao eleitoral | voter_section | direto |
| Zona eleitoral | voter_zone | direto |
| Tipo de documento certidao | cert_type | direto |
| Numero certidao | cert_number | direto |
| Folha | cert_page | direto |
| Livro | cert_book | direto |
| Cidade de emissao | cert_city | direto |
| Estado de emissao | cert_state | direto |
| Data de emissao | cert_date | converter data |
| Numero cartao SUS | sus_card | direto |
| Numero cartao SAMS | sams_card | direto |
| Numero do beneficio do INSS | inss_number | direto |
| Situacao do beneficio do INSS | inss_status | direto |
| Numero do cadastro unico | cad_unico | direto |
| Tipo de estadia | stay_type | mapear "Residente" para "Permanente" |
| Nome de outra instituicao | previous_institution | direto |
| Tempo de acolhimento da outra inst. | stay_time | direto |
| Motivo da troca | change_reason | direto |
| Data do acolhimento | admission_date | converter data |
| Ocupacao do residente | room | direto |
| Motivo do acolhimento | admission_reason | direto |
| Motivo do desacolhimento | discharge_reason | direto |
| Data do desacolhimento | discharge_date | converter data |
| Rendimentos mensalidades | income | direto |
| Atividades favoritas | favorite_activities | direto |
| Endereco | address | direto |
| CEP | cep | direto |
| Numero | address_number | direto |
| Bairro | neighborhood | direto |
| Cidade | city | direto |
| Estado | state | direto |
| Referencia | reference | direto |
| Complemento | complement | direto |
| Observacao | observations | direto |
| Status | status | mapear "Ativo" para "ativo" |
| Grau de dependencia | dependency_level | direto |
| Responsavel | *separado* | sera inserido na tabela `resident_relatives` |

### Campos que precisam de tratamento especial

- **Datas**: Formato "DD/MM/AAAA" da planilha precisa ser convertido para "AAAA-MM-DD"
- **Responsavel**: A planilha tem um campo unico com nomes separados por "/". Cada nome sera inserido como registro separado na tabela `resident_relatives` com `is_responsible = true`
- **Status**: Normalizar para lowercase ("Ativo" vira "ativo")
- **Idade**: Nao sera importada (calculada automaticamente a partir da data de nascimento)

### Fluxo da Importacao

```text
1. Usuario clica "Importar Planilha" na pagina Residentes
2. Seleciona o arquivo XLS
3. Sistema le o arquivo no navegador (biblioteca SheetJS/xlsx)
4. Converte para JSON com o mapeamento acima
5. Envia para o backend (edge function)
6. Backend insere na tabela residents + resident_relatives
7. Exibe resumo: "44 residentes importados com sucesso"
```

### Detalhes Tecnicos

**Novo arquivo:** `src/components/residentes/ImportResidents.tsx`
- Componente com input de arquivo e botao de importar
- Usa biblioteca `xlsx` (SheetJS) para ler o XLS no navegador
- Faz o mapeamento e conversao de dados
- Chama a edge function para inserir

**Nova edge function:** `supabase/functions/import-residents/index.ts`
- Recebe array de residentes em JSON
- Valida campos obrigatorios (nome)
- Insere em batch na tabela `residents`
- Extrai responsaveis e insere na tabela `resident_relatives`
- Retorna contagem de sucesso/erros

**Nova dependencia:** `xlsx` (SheetJS) - para parsing do arquivo XLS no navegador

**Alteracao:** `src/pages/Residentes.tsx` - adicionar botao "Importar Planilha" ao lado de "Cadastrar Idoso"

### Resumo

| Item | Tipo |
|------|------|
| Componente ImportResidents | React |
| Edge function import-residents | Backend |
| Dependencia xlsx | npm |
| Botao na pagina | Alteracao Residentes.tsx |
