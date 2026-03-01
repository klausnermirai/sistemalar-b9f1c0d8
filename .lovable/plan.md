

## Correcao: Contagem de Acolhidos mostrando zero

### Problema

Os residentes foram importados com o campo `gender` em formato capitalizado: `"Masculino"` e `"Feminino"`. Porem, o hook `useOccupancy.ts` compara com valores em minusculo (`"masculino"` e `"feminino"`), resultando em contagem zero.

### Solucao

Alterar a comparacao no `useOccupancy.ts` para ser case-insensitive, usando `.toLowerCase()` antes de comparar.

### Arquivo alterado

**`src/hooks/useOccupancy.ts`** - linhas 23-25

Antes:
```typescript
if (r.gender === "masculino") maleResidents++;
else if (r.gender === "feminino") femaleResidents++;
```

Depois:
```typescript
const g = r.gender?.toLowerCase();
if (g === "masculino") maleResidents++;
else if (g === "feminino") femaleResidents++;
```

Isso e tudo. Apenas uma linha de normalizacao resolve o problema sem necessidade de alterar dados no banco.

