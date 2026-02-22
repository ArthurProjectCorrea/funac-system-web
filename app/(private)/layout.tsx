/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import AuthProvider from '@/components/auth';
import { forbidden } from 'next/navigation';

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
    // get profile linked to auth user
    const { data: profileData } = await supabase
      .from('profile')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    // get roles (positions) linked to this user
    const { data: roleRows } = await supabase
      .from('role_profile')
      .select('position')
      .eq('user_id', user.id);

    const positionIds = (roleRows || []).map((r: any) => r.position);

    // fetch position rows
    const { data: positions } = positionIds.length
      ? await supabase.from('position').select('*').in('id', positionIds)
      : { data: [] };

    // fetch access entries for these positions
    const { data: accesses } = positionIds.length
      ? await supabase.from('access').select('*').in('position_id', positionIds)
      : { data: [] };

    const screenIds = Array.from(
      new Set((accesses || []).map((a: any) => a.screen_id)),
    );
    const permissionIds = Array.from(
      new Set((accesses || []).map((a: any) => a.permission_id)),
    );

    const { data: screens } = screenIds.length
      ? await supabase.from('screen').select('*').in('id', screenIds)
      : { data: [] };

    const { data: permissions } = permissionIds.length
      ? await supabase.from('permission').select('*').in('id', permissionIds)
      : { data: [] };

    // fetch groups (for grouping screens in the sidebar)
    const { data: groups } = await supabase.from('group_screen').select('*');

    const screensMap = (screens || []).reduce(
      (acc: any, s: any) => {
        acc[s.id] = s;
        return acc;
      },
      {} as Record<string, any>,
    );

    const permsMap = (permissions || []).reduce(
      (acc: any, p: any) => {
        acc[p.id] = p;
        return acc;
      },
      {} as Record<string, any>,
    );

    const enrichedAccesses = (accesses || []).map((a: any) => ({
      ...a,
      screen: screensMap[a.screen_id] || null,
      permission: permsMap[a.permission_id] || null,
    }));

    // build compact positions summary and per-position access arrays
    const positionsSummary = (positions || []).map((p: any) => ({
      id: p.id,
      department_id: p.department_id,
    }));

    const accessByPosition: Record<string, any[]> = {};
    (positions || []).forEach((p: any) => {
      const rows = enrichedAccesses
        .filter((a: any) => a.position_id === p.id)
        .map((a: any) => ({
          id: a.id,
          screen_id: a.screen_id,
          permission_id: a.permission_id,
        }));
      accessByPosition[`access_${p.id}`] = rows;
    });

    // final auth object: compact positions list + per-position access arrays
    authData = {
      user,
      profile: profileData ?? null,
      // compact list to reduce payload
      positions: positionsSummary,
      // full position rows in case callers need names or timestamps
      positions_meta: positions ?? [],
      // compact accesses (enriched) kept for convenience
      accesses: enrichedAccesses,
      screens: screens ?? [],
      permissions: permissions ?? [],
      groups: groups ?? [],
      // per-position access arrays, keys like access_1, access_2, ...
      ...accessByPosition,
    };

    // debug log so it's visible when rendering private layout
    // this will appear in the server logs where Next.js runs
    console.log('AUTH_DATA', JSON.stringify(authData, null, 2));

    // Server-side authorization: use Next.js `forbidden()` for routes the user
    // is not permitted to `view`. We rely on the middleware to set the
    // `x-original-path` header so we can map the incoming request to a
    // `screen.url` row in the database.
    try {
      const path = cookieStore.get('x-original-path')?.value || '/';
      const { data: screen } = await supabase
        .from('screen')
        .select('id,url')
        .eq('url', path)
        .maybeSingle();

      // if the path isn't a registered screen, allow rendering
      if (screen) {
        const positionIds = (authData.positions_meta || []).map(
          (p: any) => p.id,
        );
        if (!positionIds || positionIds.length === 0) {
          forbidden();
        }

        const { data: viewPerm } = await supabase
          .from('permission')
          .select('id')
          .eq('name', 'view')
          .maybeSingle();
        if (!viewPerm) {
          // no explicit 'view' permission configured — deny by default
          forbidden();
        }

        const { data: accessRows } = await supabase
          .from('access')
          .select('id')
          .in('position_id', positionIds)
          .eq('screen_id', screen.id)
          .eq('permission_id', viewPerm.id)
          .limit(1);

        if (!accessRows || accessRows.length === 0) {
          forbidden();
        }
      }
    } catch (err) {
      // If the permission check fails due to infra error, allow rendering
      // but log the error so it can be investigated.
      console.error('permission-check-error', err);
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
