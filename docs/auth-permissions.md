# Autenticação e Permissões — funac-system-web

Este documento descreve, em detalhes, como o projeto implementa autenticação e autorização (permissões de acesso). Ele cobre o modelo de dados no banco (tabelas), o fluxo de autenticação/assembly de dados no servidor, a verificação de permissão que bloqueia rotas com `forbidden()` e os pontos importantes para testes e seed de dados.

## Resumo rápido

- Autenticação: Supabase Auth (token/cookie) usado com `createServerClient` em server components.
- Associação usuário ↔ posições: tabela `profile_positions` (um usuário pode ter múltiplas posições).
- Permissões: tabelas `screens`, `permissions`, `accesses` (join entre `positions`, `screens`, `permissions`).
- Verificação de rota: `app/(private)/layout.tsx` monta `authData` e chama `forbidden()` quando o usuário não tem a permissão `view` para o `screen.url` alvo.

## Esquema de banco de dados (resumo)

- `departments` — departamentos (id, name).
- `positions` — posições/cargos (id, department_id, name).
- `profiles` — ligação 1:1 com `auth.users`; armazena `name`.
- `profile_positions` — join: `user_id` (uuid) ↔ `position_id` (integer).
- `screens` — recursos/navegação: `id`, `name`, `url`, `icon`, `sidebar` (boolean), `screen_group_id`.
- `screen_group` — grupos de telas usados para agrupar itens da sidebar.
- `permissions` — nomes de ações, por exemplo `view`, `create`, etc.
- `accesses` — join entre `position_id`, `screen_id`, `permission_id` que determina quais posições têm determinada permissão sobre determinada tela.

As migrações relevantes estão em `supabase/migrations/` (ver `20260224120000_initial_schema.sql` e demais historicamente relacionadas como `20260222123000_update_screen_table.sql`, `20260222124500_add_group_screen_and_screen_cols.sql`).

## Fluxo de montagem de dados de autenticação (server)

Arquivo central: `app/(private)/layout.tsx` (server component)

1. Cria um cliente Supabase server-side com `createServerClient(...)` usando cookies do request.
2. Obtém o `user` com `supabase.auth.getUser()`.
3. Se `user` existir:
   - Carrega `profiles` (se existir) via `profiles.user_id = user.id`.
   - Carrega posições do usuário via `profile_positions` (coluna `position_id`).
   - Carrega linhas completas de `positions` para essas posições.
   - Carrega `accesses` para essas posições.
   - Carrega `screens` e `permissions` referenciados por `accesses`.
   - Carrega `screen_group` para agrupar sidebar.
   - Monta um objeto `authData` com campos úteis: `user`, `profile`, `positions` (resumido), `positions_meta` (linhas completas), `accesses` (enriquecido com screen/permission), `screens`, `permissions`, `groups`, e entradas `access_<positionId>` para acesso por posição.
4. `authData` é passado ao cliente via `AuthProvider` e usado pelo `AppSidebar` para renderizar navegação dinâmica.

O layout faz `console.log('AUTH_DATA', ...)` para facilitar observabilidade no servidor.

## Verificação de permissão e bloqueio de rota

Objetivo: evitar que um usuário acesse uma rota (renderize a árvore privada) sem a permissão necessária.

Como funciona:

1. O `middleware.ts` (simplificado) garante que apenas usuários autenticados atinjam rotas privadas e grava o caminho original em um cookie `x-original-path` (é lido pelo server layout).
2. Em `app/(private)/layout.tsx` (após montar `authData`) o código pega `path = cookieStore.get('x-original-path')?.value || '/'` e busca a linha `screen` com `url = path`.
3. Se a `screen` existe, o layout verifica se existe a `permission` `view` na tabela `permission`.
   - Se não houver permissão `view` configurada, o comportamento atual é negar por padrão (`forbidden()`).
4. Em seguida faz uma query em `accesses` procurando qualquer row onde `position_id` esteja entre as posições do usuário, `screen_id` = screen.id e `permission_id` = viewPerm.id. Se não existe nenhum `accesses` correspondente, chama `forbidden()`.

Observações técnicas:

- Esta verificação roda no servidor (server component) e usa `forbidden()` de Next.js. Para que `forbidden()` funcione é necessário habilitar `experimental.authInterrupts: true` em `next.config.ts` e reiniciar o servidor de desenvolvimento (já fez isso no repositório).
- Se ocorrer um erro infra (ex.: Supabase indisponível) o layout captura o erro e, por agora, permite a renderização (mas loga o problema) — isso evita bloquear por falhas temporárias na infra.

## Comportamento da UI

- `AppSidebar` consome `authData` e monta a navegação agrupando `screens` por `screen_group` e filtrando por `sidebar = true`.
- `NavMain` foi atualizado para usar `next/link` (App Router) e renderizar apenas as `screen.url` que estiverem marcadas para aparecer na sidebar.
- `AuthProvider` + `useAuth` expõem `authData` no cliente para componentes que precisam (ex.: DepartmentSwitcher, NavUser).

## Como testar / seeds úteis

1. Habilite `experimental.authInterrupts` em `next.config.ts` (feito) e reinicie `npm run dev`.
2. Seed (exemplo idempotente SQL) que adiciona um `screens` `/teste`, uma `permissions` `create` e registra `accesses` para as posições do usuário alvo:

```sql
BEGIN;

INSERT INTO permissions (name, created_at, updated_at)
SELECT 'create', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'create');

INSERT INTO screens (name, url, sidebar, screen_group_id, created_at, updated_at)
SELECT 'Teste', '/teste', true, NULL, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM screens WHERE url = '/teste');

INSERT INTO accesses (position_id, screen_id, permission_id, created_at, updated_at)
SELECT rp.position_id, s.id, p.id, now(), now()
FROM profile_positions rp
JOIN screens s ON s.url = '/teste'
JOIN permissions p ON p.name = 'create'
LEFT JOIN accesses a ON a.position_id = rp.position_id AND a.screen_id = s.id AND a.permission_id = p.id
WHERE rp.user_id = '9ffd7ff5-04ce-4f8e-8206-5ced1707fd55'
  AND a.id IS NULL;

COMMIT;
```

3. Observação de teste: a verificação do layout exige a permissão `view`. Se você criar `access` apenas com `create` (como no exemplo acima) o usuário continuará sendo bloqueado ao navegar para `/teste` — isso é desejado para testar o `forbidden()`.

4. Para permitir acesso, insira (`permission.name = 'view'`) e crie um `access` equivalente para a posição do usuário.

## Pontos importantes / notas de manutenção

- `forbidden()` só tem efeito se `experimental.authInterrupts` estiver habilitado — lembre-se de reiniciar o servidor após alterar `next.config.ts`.
- A fonte da verdade para permissões é a tabela `accesses`. A lógica atual exige explicitamente a permissão `view` para que uma rota seja exibida.
- Se quiser ajustes de UX: em vez de negar por padrão quando `permissions.view` não existe, a equipe pode escolher permitir por padrão e somente negar quando `permissions.view` existe mas não há `accesses` (política permissiva vs. política restritiva).
- Logs: o layout faz `console.log('AUTH_DATA', ...)` — útil em desenvolvimento, remova ou nivele para debug em produção.
- Tipos: em alguns arquivos houve uso temporário de `/* eslint-disable @typescript-eslint/no-explicit-any */` para acelerar iterações; recomenda-se substituir pelos tipos corretos (`Position`, `Access`, `Screen`, etc.) antes de subir para produção.

## Localizações de arquivo relevantes

- Server layout / autorização: `app/(private)/layout.tsx`
- Custom 403 UI: `app/forbidden.tsx` (server component) e `components/back-button.tsx` (client)
- Sidebar e UI: `components/sidebar/*` (`app-sidebar.tsx`, `nav-main.tsx`, `nav-user.tsx`, `department-switcher.tsx`)
- Auth provider / hook: `components/auth.tsx`
- Middleware que grava `x-original-path`: `middleware.ts`
- Migrações: `supabase/migrations/*.sql`

## Próximos passos sugeridos

- Remover logs sensíveis e transformar `console.log('AUTH_DATA', ...)` em logger condicional.
- Substituir `any` por tipos concretos em arquivos críticos.
- Adicionar testes de integração que validem a `forbidden()` e a montagem de `authData` (usando um banco de teste ou fixtures).

---

Se quiser, eu salvo esse arquivo em outra pasta do `docs/` (por exemplo em `docs/next-js/get-started/`), ou gero um migration SQL para adicionar o screen `/teste` com `view` permission também. Quer que eu faça isso agora?

**\* FIM do documento **
