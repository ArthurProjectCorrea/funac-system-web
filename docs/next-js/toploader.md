# Configuração do NextJS TopLoader ✅

## O que foi feito

- Adicionei o **NextTopLoader** como um componente cliente em `components/top-loader.tsx`.
- Renderizei o componente no `app/layout.tsx` para mostrar a barra de carregamento global em todas as páginas.
- Configurei o TopLoader para **usar tokens CSS** definidos em `app/globals.css` (por exemplo `--primary`) para que a cor acompanhe o tema do site.

---

## Arquivos modificados 🔧

- `components/top-loader.tsx` (novo)
- `app/layout.tsx` (importou e adicionou `<TopLoader />`)

---

## Como está implementado (resumo)

- `components/top-loader.tsx` é um **client component** (contém `'use client'`) que simplesmente renderiza `<NextTopLoader />` com props configuradas.
- Para usar tokens do tema, passei **valores CSS** nas props (por exemplo `color="var(--primary)"`). O TopLoader aceita strings CSS para cor e sombra, então as variáveis do `:root` em `app/globals.css` são aplicadas automaticamente.

Exemplo (trecho):

```tsx
// components/top-loader.tsx
'use client';
import NextTopLoader from 'nextjs-toploader';

export default function NextTopLoaderWrapper() {
  return (
    <NextTopLoader
      color="var(--primary)" // usa token do globals.css
      height={3}
      showSpinner={false}
      shadow="0 0 8px var(--primary),0 0 4px var(--primary)"
      zIndex={1600}
    />
  );
}
```

No `app/layout.tsx` apenas importe e renderize o componente cliente:

```tsx
import TopLoader from '@/components/top-loader';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <TopLoader />
        {children}
      </body>
    </html>
  );
}
```

> Observação: não use `dynamic(..., { ssr: false })` dentro de um Server Component (`app/layout.tsx`) — importe diretamente um Client Component (marcado `'use client'`).

---

## Testes sugeridos ✅

1. Rode a aplicação (`npm run dev`) e navegue entre páginas — deve aparecer a barra de carregamento no topo.
2. Verifique que a cor da barra acompanha a variável `--primary` definida em `app/globals.css`.
3. Faça alterações na variável (`--primary`) e confirme que a barra muda de cor automaticamente.

---

Se quiser, posso:

- Mapear mais tokens para o TopLoader (por exemplo, altura via `--toploader-height`),
- Ativar o spinner (`showSpinner`),
- Expor hooks (`useTopLoader`) para controlar manualmente o carregamento em ações específicas.

Quer que eu implemente alguma dessas melhorias? ✨
