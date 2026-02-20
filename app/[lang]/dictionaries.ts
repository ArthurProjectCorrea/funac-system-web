/* eslint-disable @typescript-eslint/no-explicit-any */
import 'server-only';
import { type Locale, hasLocale, locales, defaultLocale } from '@/lib/i18n';

const dictionaries = {
  en: () => import('../../lang/en.json').then((m) => m.default),
} as const;

export type { Locale };
export { hasLocale, locales };

export async function getDictionary(locale: Locale) {
  // cast to any so the compiler stops complaining about indexing
  const loader =
    (dictionaries as Record<string, any>)[locale] ||
    (dictionaries as Record<string, any>)[defaultLocale];

  // loader may be undefined if locale is invalid; default back to defaultLocale
  if (typeof loader !== 'function') {
    return (dictionaries as Record<string, any>)[defaultLocale]!();
  }
  return loader();
}
