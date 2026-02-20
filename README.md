# next-template

Template Next.js com TypeScript, Tailwind CSS 4, shadcn UI, i18n e fluxo de qualidade (CI, hooks, semantic-release). Use como ponto de partida para novos projetos.

---

## Primeiros passos (após clonar)

Ao clonar este repositório como template, o projeto ainda terá o nome, versão e histórico do template. Siga um dos fluxos abaixo.

### Opção 1: Script automático (recomendado)

Execute **uma vez** após clonar. O script:

- Define o **nome** do projeto no `package.json` com o nome do repositório (extraído do `git remote origin`)
- Zera a **versão** para `0.0.0`
- **Remove** o `CHANGELOG.md` do template
- Atualiza o **primeiro commit** com a mensagem `chore: first commit` (incluindo essas alterações)

```bash
git clone <URL_DO_SEU_REPO>
cd <nome-do-repo>

npm run init
```

Depois:

```bash
npm install
npm run prepare   # instala os git hooks (husky)
npm run dev
```

> **Importante:** o script usa o nome do repositório a partir de `git remote get-url origin`. Configure o remote antes de rodar `npm run init` se você clonou por outro meio.

### Opção 2: Passos manuais

1. **Altere o nome e a versão** em `package.json`:
   - `name`: nome do seu projeto (recomendado: mesmo nome do repositório)
   - `version`: `0.0.0`

2. **Remova o changelog do template:** apague o arquivo `CHANGELOG.md` (o semantic-release criará um novo ao fazer releases).

3. **Padronize o primeiro commit** (opcional):

   ```bash
   git add -A
   git commit --amend -m "chore: first commit"
   ```

   > Modificar o último commit reescreve o histórico. Se já tiver enviado ao remoto, será necessário `git push --force-with-lease origin <branch>` (use com cuidado).

4. **Instale dependências e prepare os hooks:**

   ```bash
   npm install
   npm run prepare
   npm run dev
   ```

---

## Tecnologias do template

| Área            | Tecnologia                                                                      |
| --------------- | ------------------------------------------------------------------------------- |
| **Framework**   | Next.js 16 (App Router), React 19                                               |
| **Linguagem**   | TypeScript                                                                      |
| **Estilo**      | Tailwind CSS 4, tw-animate-css                                                  |
| **Componentes** | shadcn UI (Radix, CVA, Tailwind), Lucide icons                                  |
| **i18n**        | Rotas por locale (`/[lang]`), proxy para redirect, dicionários em `lang/*.json` |
| **Temas**       | next-themes (dark/light/system)                                                 |
| **UX**          | nextjs-toploader                                                                |
| **Formulários** | React Hook Form, Zod, @hookform/resolvers                                       |
| **Qualidade**   | ESLint, Prettier, Husky, lint-staged                                            |
| **CI/CD**       | GitHub Actions (CI + Release), semantic-release                                 |

- **Node:** `>=20.9.0` (definido em `engines` no `package.json`).

---

## Qualidade e boas práticas

- **Sempre** rode antes de commitar:
  - `npm run format` — formata o código
  - `npm run lint` — verifica regras de lint
  - `npm run build` — garante que o projeto compila

- **Git hooks (Husky):** o `prepare` instala hooks que rodam formatação, lint, build e `lint-staged` nos arquivos staged. Também valida mensagens de commit (Conventional Commits) via `commitlint`. Mantenha `npm run prepare` após clonar.

- **Commits:** Prefira mensagens no padrão [Conventional Commits](https://www.conventionalcommits.org/) (ex.: `feat:`, `fix:`, `chore:`). O `commit-msg` hook do Husky verifica a formatação e impedirá commits que não sigam o padrão.

- **Componentes:**
  - Use os componentes em `components/ui` (shadcn) como base; para novos componentes reutilizáveis, crie na raiz de `components/`.
  - Consulte `docs/shadcn-ui` para uso e documentação.
  - Prefira composição e wrappers em vez de duplicar comportamento.

- **i18n:** traduções em `lang/` organizadas por página/componente (ex.: `RootPage`, `RootLayout` em `lang/en.json`). Novos idiomas: adicione o locale em `lib/i18n.ts`, crie `lang/xx.json` e registre em `app/[lang]/dictionaries.ts`.

---

## Comandos úteis

```bash
# Desenvolvimento
npm run dev          # servidor de desenvolvimento

# Build e produção
npm run build        # build de produção
npm run start        # inicia o servidor de produção (após build)

# Qualidade
npm run format       # Prettier (escreve nos arquivos)
npm run lint         # ESLint
npx husky run pre-commit   # roda o hook de pre-commit manualmente

# Template (após clonar)
npm run init         # primeiros passos: nome, versão, changelog, primeiro commit
```

---

## Releases automatizados

O repositório usa **semantic-release** na CI: a cada push em `main` (após o workflow de CI passar), o job de release pode criar tags, GitHub Release e atualizar o `CHANGELOG.md`. A publicação no npm está **desativada** por padrão (`release.config.js`).

- **Tokens:** o workflow usa `GITHUB_TOKEN`; se precisar de permissões extras (ex.: branch protection), crie um Personal Access Token com escopo `repo` e defina o secret `SEMANTIC_RELEASE_TOKEN`.
- **Branch protection:** em repositórios com proteção em `main`, pode ser necessário permitir que o GitHub Actions faça push (ou usar o token acima).

O workflow de release está em `.github/workflows/release.yml` e depende do CI (`.github/workflows/ci.yml`).

---

Se precisar de ajuda com algo específico, abra uma issue ou envie uma PR. Obrigado por usar o template.
