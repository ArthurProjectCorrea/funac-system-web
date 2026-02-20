import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { ThemeProvider } from '@/components/theme-provider';
import TopLoader from '@/components/top-loader';
import { Toaster } from '@/components/ui/sonner';
import { locales } from '@/lib/i18n';
import { getDictionary, hasLocale } from './dictionaries';

type LayoutProps = Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.LangLayout.title,
    description: dict.LangLayout.description,
  };
}

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: LayoutProps) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  // if the request was for the locale root, decide where to send the user
  const hdr = await headers();
  const orig = hdr.get('x-original-path') ?? '';
  if (orig === `/${lang}`) {
    // determine logged‑in state using Supabase
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (
            cookiesToSet: Array<{
              name: string;
              value: string;
              options: unknown;
            }>,
          ) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              // options type is opaque, suppress lint
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cookieStore.set(name, value, options as any),
            );
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect(`/${lang}/home`);
    } else {
      redirect(`/${lang}/login`);
    }
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TopLoader />
      <Toaster />
      {children}
    </ThemeProvider>
  );
}
