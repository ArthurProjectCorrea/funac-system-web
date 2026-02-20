'use client';

/**
 * Seletor de idioma. Navega para a rota /[locale]/... ao trocar.
 * Passe as traduções de dict.LocaleSwitcher (ariaLabel + um label por locale).
 *
 * @example
 * const dict = await getDictionary(lang);
 * <LocaleSwitcher labels={dict.LocaleSwitcher} />
 */
import { usePathname, useRouter } from 'next/navigation';
import { GlobeIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { locales, type Locale } from '@/lib/i18n';

export type LocaleSwitcherLabels = {
  ariaLabel: string;
} & Record<Locale, string>;

type LocaleSwitcherProps = {
  labels: LocaleSwitcherLabels;
};

export function LocaleSwitcher({ labels }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  const currentLocale = pathname?.split('/').filter(Boolean)[0] ?? locales[0];

  function handleLocaleChange(locale: Locale) {
    if (!pathname) return;
    const segments = pathname.split('/').filter(Boolean);
    const rest = segments.slice(1).join('/');
    const newPath = `/${locale}${rest ? `/${rest}` : ''}`;
    router.push(newPath);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={labels.ariaLabel}>
          <GlobeIcon className="size-4" />
          <span className="sr-only">{labels.ariaLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={currentLocale === locale ? 'bg-accent' : ''}
          >
            {labels[locale] ?? locale}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
