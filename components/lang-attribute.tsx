'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Define o atributo lang do <html> com base no segmento [lang] da URL.
 * Necessário porque o layout raiz (app/layout.tsx) não tem acesso aos params.
 */
export function LangAttribute() {
  const pathname = usePathname();

  useEffect(() => {
    const lang = pathname?.split('/')[1] ?? 'en';
    if (typeof document?.documentElement?.setAttribute === 'function') {
      document.documentElement.setAttribute('lang', lang);
    }
  }, [pathname]);

  return null;
}
