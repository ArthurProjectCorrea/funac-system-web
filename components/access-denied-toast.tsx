'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

export default function AccessDeniedToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;
    const denied = searchParams.get('access_denied');
    if (denied) {
      const screen = searchParams.get('forbidden_screen') || '';
      toast.error(`Sem permissão de acesso${screen ? `: ${screen}` : ''}`);

      // remove the params so the toast isn't shown repeatedly
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('access_denied');
        url.searchParams.delete('forbidden_screen');
        window.history.replaceState({}, '', url.toString());
      } catch (_) {
        // ignore
      }
    }
  }, [searchParams]);

  return null;
}
