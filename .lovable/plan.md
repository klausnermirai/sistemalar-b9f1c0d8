

## Adicionar campos "Origem da Indicacao" e "Descricao do Caso" no Agendamento

### 1. Migration: adicionar 2 colunas na tabela `candidates`

```sql
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS referral_source text;
ALTER TABLE public.candidates ADD COLUMN IF NOT EXISTS case_description text;
```

### 2. Alterar `AgendamentosTab.tsx`

- Adicionar ao `newForm`: `referral_source: ""` e `case_description: ""`
- No formulario do modal "Novo Agendamento":
  - Campo Select "Origem da Indicacao" com opcoes: CREAS/Prefeitura, Judicial, Conferencias, Contato direto no Lar
  - Campo Textarea "Breve Descricao do Caso" (opcional)
- No `handleCreate`: enviar `referral_source` e `case_description`
- No card da listagem: exibir a origem como badge/tag quando preenchida

### Arquivos alterados

| Arquivo | Acao |
|---------|------|
| Migration SQL | 2 colunas novas em `candidates` |
| `AgendamentosTab.tsx` | Adicionar campos no formulario e exibicao |

