'use client';

import { LogoutButton } from '@/components/logout-button';
import PageHeader from '@/components/page-header';
import { ThemeSwitcher } from '@/components/theme-switcher';

export default function HomePage({ email }: { email?: string }) {
  const text = {
    heading: 'Página inicial',
    welcome: 'Bem‑vindo {email}! Você entrou com sucesso.',
  };

  const headerItems = [{ label: 'Página inicial', href: '/home' }];

  return (
    <main>
      <PageHeader items={headerItems} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold">{text.heading}</h1>
          <p className="mt-4">{text.welcome.replace('{email}', email ?? '')}</p>
          <div className="mt-6 flex gap-2">
            <LogoutButton />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </main>
  );
}
