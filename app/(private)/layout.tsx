 
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import AuthProvider from '@/components/auth';
import { forbidden } from 'next/navigation';
import { buildAuthData } from '@/lib/auth/build-auth-data';
import { hasPermission } from '@/lib/auth/check-permission';

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // build server-side supabase client to fetch auth/profile/roles/access data
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        // Server components cannot set cookies directly; use no-op here.
        setAll: () => {},
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let authData = null;

  if (user) {
    // reuse helper to assemble auth data
    authData = await buildAuthData(supabase, user.id);

    // keep minimal logging for debugging
    console.log('AUTH_DATA', JSON.stringify(authData, null, 2));

    try {
      const path = cookieStore.get('x-original-path')?.value || '/';

      // check permission using helper
      const allowed = hasPermission({ authData, path, action: 'view' });
      if (!allowed) forbidden();
    } catch (err) {
      // Don't silently allow on infra failures; log and rethrow so
      // the error can be observed during development.
      console.error('permission-check-error', err);
      throw err;
    }
  }

  return (
    <main>
      <SidebarProvider>
        <AppSidebar authData={authData} />
        <SidebarInset>
          <AuthProvider initialAuthData={authData}>{children}</AuthProvider>
        </SidebarInset>
      </SidebarProvider>
    </main>
  );
}
