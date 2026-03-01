

## Controle de Papeis e Niveis de Acesso

### Visao Geral

Implementar controle de acesso baseado em papeis (RBAC) no sistema, usando os papeis: **Administrador**, **Assistente Social**, **Psicologia** e **Nutricionista**. Cada papel tera visibilidade restrita a modulos especificos.

---

### Status: ✅ IMPLEMENTADO

- ✅ Enum `app_role` atualizado com `psicologo` e `nutricionista`
- ✅ Hook `useUserRole.ts` com matriz de permissoes
- ✅ Edge function `reset-user-password`
- ✅ AppSidebar.tsx — menu filtrado por papel
- ✅ ResidentForm.tsx — abas filtradas por papel
- ✅ AtendimentoMultidisciplinar.tsx — competencias filtradas
- ✅ AppLayout.tsx — bloqueio de rota sem permissao
- ✅ Settings.tsx — novos papeis, editar papel, redefinir senha, minha conta
