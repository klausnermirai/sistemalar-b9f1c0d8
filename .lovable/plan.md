

## Duas opcoes ao clicar no candidato na aba Entrevistas

### Problema Atual

Ao clicar no nome do candidato na aba Entrevistas, o sistema abre diretamente o formulario de entrevista. Nao ha opcao de evoluir o candidato para a proxima etapa sem abrir a ficha.

### Solucao

Substituir o comportamento de clique direto por um **mini painel de acoes** dentro do card do candidato. Ao clicar, em vez de abrir a ficha imediatamente, o card expande mostrando dois botoes:

1. **Abrir Ficha** - Abre o `InterviewForm` para criar ou editar a ficha de entrevista (comportamento atual)
2. **Evoluir para Fila de Espera** - Move o candidato diretamente para o stage `lista_espera`

### Detalhes Tecnicos

**Arquivo alterado:** `src/components/triagens/EntrevistasTab.tsx`

| Alteracao | Descricao |
|-----------|-----------|
| Novo state `expandedId` | Controla qual card esta expandido (mostrando as opcoes) |
| Clique no card | Em vez de `setSelectedId`, alterna `expandedId` para mostrar/esconder os botoes |
| Botao "Abrir Ficha" | Chama `setSelectedId(c.id)` para abrir o formulario (icone `FileText`) |
| Botao "Evoluir para Fila de Espera" | Chama `updateCandidate.mutateAsync({ id: c.id, stage: "lista_espera" })`, exibe toast de confirmacao (icone `ArrowRight`) |
| Import adicional | `useUpdateCandidate` do hook existente, icone `ArrowRight` do lucide-react |

### Comportamento Visual

```text
Antes (clique direto):
  [Card: Nome do Idoso]  -->  abre ficha

Depois (clique expande):
  [Card: Nome do Idoso]
    |
    v
  [  Abrir Ficha  ] [  Evoluir para Fila de Espera  ]
```

- Clicar no card expande/colapsa os botoes
- Clicar em "Abrir Ficha" abre o InterviewForm normalmente
- Clicar em "Evoluir" atualiza o stage, mostra toast "Candidato enviado para Fila de Espera" e o candidato some da lista
- Nenhuma alteracao em banco de dados, migrations ou outros componentes

