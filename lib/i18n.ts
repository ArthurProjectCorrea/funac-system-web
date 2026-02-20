/**
 * Configuração centralizada de i18n.
 * Novos idiomas: adicione o locale aqui, crie lang/xx.json e registre em app/[lang]/dictionaries.ts.
 */

export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const hasLocale = (locale: string): locale is Locale =>
  (locales as readonly string[]).includes(locale);
