# Sidebar e Controle de Permissões

Este documento descreve como a sidebar é montada e como o controle de permissões impacta o que é exibido ao usuário.

**Arquivos principais envolvidos**

- `components/sidebar/app-sidebar.tsx` — componente de mais alto nível que monta a sidebar e determina os itens visíveis.
- `components/sidebar/nav-main.tsx` — renderiza o menu (grupos, itens e subitens).
- `components/sidebar/department-switcher.tsx` — determina departamentos e posições do usuário para filtrar itens.
- `lib/auth/build-auth-data.ts` — helper server-side que monta `authData` (posições, accesses, screens, permissions, modules, permissionsByRoute).
- `lib/auth/check-permission.ts` — helper com `hasPermission()` que checa permissões por rota.
- `app/(private)/layout.tsx` — instancia `authData` no servidor e usa `hasPermission()` para bloquear rotas com `forbidden()`.

## Modelo de dados envolvido

- `role_profile(user_id, position)` — posições do usuário.
- `position(id, department_id, name)` — cargos/posições.
- `screen(id, name, url, sidebar, group_id)` — entradas de navegação.
- `permission(id, name)` — ações possíveis (`view`, `create`, ...).
- `access(position_id, screen_id, permission_id)` — relação que define quais posições têm quais permissões nas screens.
- `group_screen` — grupos para agrupar telas na sidebar.

## Fluxo de montagem (resumido)

1. No server layout (`app/(private)/layout.tsx`) é criado o cliente Supabase e obtido o `user` autenticado.
2. `buildAuthData(supabase, user.id)` é chamado e retorna um objeto `authData` contendo: `positions_meta`, `accesses` (enriquecido com `screen` e `permission`), `screens`, `permissions`, `modules`, e `permissionsByRoute` (mapa url → lista de permissões).
3. `authData` é passado ao cliente via `AuthProvider` e consumido por componentes da sidebar.

## Como a sidebar decide o que mostrar

O `AppSidebar` monta os itens visíveis seguindo estes passos:

1. Busca departamentos disponíveis via API `/api/departments` e filtra apenas os departamentos para os quais o usuário tem posições (`authData.positions_meta`).
2. Seleciona o departamento atual (switcher) e obtém as posições daquele departamento.
3. Para cada posição coleta as arrays `access_<positionId>` (geradas por `buildAuthData`) e concatena todos os `access` relevantes.
4. Extrai os `screen_id` presentes nesses `access` e busca as linhas em `authData.screens` correspondentes.
5. Filtra screens que:
   - Estão na lista de access do usuário (posições atuais).
   - Têm `sidebar !== false` (por padrão aparecem no sidebar).
   - E — crucial — para as quais o usuário tem a permissão `view`.

O filtro de permissão é aplicado usando `authData.permissionsByRoute` (mapa rápido) quando disponível; caso contrário, faz-se um fallback percorrendo `authData.accesses` procurando um access com `permission.name === 'view'` e `screen.url === <url>`.

Se um item for um grupo (`group_id`), o `AppSidebar` agrupa as telas por `group_id` e passa os grupos e subitens ao `NavMain`.

## Renderização no `NavMain`

- `NavMain` recebe um array `items` já filtrado. Ele aplica lógica adicional de renderização:
  - Se um item tiver `sidebar: false` é ignorado.
  - Grupos com zero itens visíveis são omitidos (se já estiverem filtrados pelo `AppSidebar`, o `NavMain` também evita renderizar colapsíveis vazios).

## Bloqueio de rota vs. ocultação de menu

- Bloqueio de rota (autorização estrita): Em `app/(private)/layout.tsx` é feita uma checagem server-side com `hasPermission({ authData, path, action: 'view' })`. Se retornar `false`, é chamado `forbidden()`. Isso impede acesso mesmo que a URL seja conhecida.
- Ocultação na UI (melhor UX): Itens para os quais o usuário não tem `view` são removidos da lista da sidebar, evitando que o usuário veja links que não poderá abrir.

Esses dois mecanismos trabalham em conjunto: a UI esconde itens, e o servidor garante que requests diretos (URL manual) também sejam bloqueados.

## Performance e otimizações

- `buildAuthData` constrói `permissionsByRoute` para permitir checagens O(1) por URL no cliente (e para filtrar a sidebar sem queries adicionais).
- A montagem atual faz múltiplas queries simples; é recomendado (próxima iteração) usar uma única query aninhada via Supabase `.select()` com joins (role_profile → position → access (permission, screen)) para reduzir latência e complexidade.

## Boas práticas e sugestões

- Evite enviar `authData` excessivamente grande ao cliente — o cliente normalmente precisa apenas de `sidebar` (screens filtradas) e um mapa de permissões por rota (`permissionsByRoute`).
- Centralize lógica de autorização em `lib/auth/*` (já existem `build-auth-data.ts` e `check-permission.ts`). Teste essas funções isoladamente.
- Remova o uso de cookies para tráfego interno (ex.: `x-original-path`) e prefira capturar o path via route segments ou headers quando possível.
- Trate erros de infra de forma conservadora: prefira falhar fechando acesso (ou redirecionando para uma página de erro) em produção.

## Localização dos pontos a alterar (quando evoluir)

- Refatorar `buildAuthData` para usar nested select / joins.
- Mover lógica de formação de `navItems` do `AppSidebar` para uma função utilitária testável.
- Garantir que grupos vazios sejam omitidos no `NavMain` (melhor UX).

---

Arquivo criado automaticamente para documentar a sidebar e o controle de permissões.
