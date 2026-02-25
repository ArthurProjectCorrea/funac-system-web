/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SupabaseClient } from '@supabase/supabase-js';

export async function buildAuthData(supabase: SupabaseClient, userId: string) {
  // Load profile (now `profiles`)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // Load profile_positions rows (link users ↔ positions)
  const { data: roleRows } = await supabase
    .from('profile_positions')
    .select('position_id')
    .eq('user_id', userId);

  const positionIds = (roleRows || []).map((r: any) => r.position_id);

  // Fetch positions
  const { data: positions } = positionIds.length
    ? await supabase.from('positions').select('*').in('id', positionIds)
    : { data: [] };

  // Fetch accesses for these positions
  const { data: accesses } = positionIds.length
    ? await supabase.from('accesses').select('*').in('position_id', positionIds)
    : { data: [] };

  const screenIds = Array.from(
    new Set((accesses || []).map((a: any) => a.screen_id)),
  );
  const permissionIds = Array.from(
    new Set((accesses || []).map((a: any) => a.permission_id)),
  );

  const { data: screens } = screenIds.length
    ? await supabase.from('screens').select('*').in('id', screenIds)
    : { data: [] };

  const { data: permissions } = permissionIds.length
    ? await supabase.from('permissions').select('*').in('id', permissionIds)
    : { data: [] };

  const { data: modules } = await supabase.from('modules').select('*');

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

  const positionsSummary = (positions || []).map((p: any) => ({
    id: p.id,
    department_id: p.department_id,
    name: p.name,
  }));

  const accessByPosition: Record<string, any[]> = {};
  (positions || []).forEach((p: any) => {
    const rows = enrichedAccesses
      .filter((a: any) => a.position_id === p.id)
      .map((a: any) => ({
        id: a.id,
        screen_id: a.screen_id,
        permission_id: a.permission_id,
        permission_name: a.permission?.name ?? null,
        screen: a.screen,
      }));
    accessByPosition[`access_${p.id}`] = rows;
  });

  // Build a permissions map by route for quick checks
  const permissionsByRoute: Record<string, string[]> = {};
  enrichedAccesses.forEach((a: any) => {
    const url = a.screen?.url;
    const pname = a.permission?.name;
    if (!url || !pname) return;
    permissionsByRoute[url] = Array.from(
      new Set([...(permissionsByRoute[url] || []), pname]),
    );
  });

  return {
    profile: profile ?? null,
    positions: positionsSummary,
    positions_meta: positions ?? [],
    accesses: enrichedAccesses,
    screens: screens ?? [],
    permissions: permissions ?? [],
    modules: modules ?? [],
    permissionsByRoute,
    ...accessByPosition,
  };
}
