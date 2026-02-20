import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/logout-button';
import { getDictionary } from '../../dictionaries';
import type { Locale } from '@/lib/i18n';
import { ThemeSwitcher } from '@/components/theme-switcher';

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{dict.HomePage.heading}</h1>
      <p className="mt-4">
        {dict.HomePage.welcome.replace('{email}', user?.email ?? '')}
      </p>
      <div className="mt-6">
        <LogoutButton
          messages={{
            success: dict.HomePage.logoutSuccess,
            error: dict.HomePage.logoutError,
            loading: dict.HomePage.signingOut,
          }}
        >
          {dict.HomePage.logout}
        </LogoutButton>
        <ThemeSwitcher labels={dict.ThemeSwitcher} />
      </div>
    </div>
  );
}
