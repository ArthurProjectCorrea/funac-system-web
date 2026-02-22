---
description: Describe when these instructions should be loaded
# applyTo: 'Describe when these instructions should be loaded' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---

### Text declaration standard

All pages and components in this repository **must declare their own static text** at the top of the file using a single
constant named `text`. Example pattern:

```ts
const text = {
  title: 'Entrar na sua conta',
  subtitle: 'Digite seu e-mail abaixo para acessar',
  emailLabel: 'E-mail',
  // …
};
```

Use the `text` object for every string that is not fetched from the database or
passed in as a prop from above. Do not forward hard‑coded strings via
component props; reference the `text` variable directly within the page or
component instead.

This allows easy editing and keeps all static copy colocated with the UI
element it belongs to. When translating the app or extracting copy later,
there will be a single place to look for the text of each file.

### Other general conventions

- Prefer Portuguese (`pt-br`) copy as the default language.
- Pages should live directly under `app/` (no `[lang]` subfolder) and use
  layouts at `app/layout.tsx` and `app/(private)/layout.tsx` for structure.
- Avoid passing static text as props; use the local `text` constant.
- Keep business logic out of layout components; use providers for shared data.
- All database data is accessed via `/api` routes or server components.

These guidelines apply globally and the AI assistant should adhere to them
whenever generating or modifying code.
