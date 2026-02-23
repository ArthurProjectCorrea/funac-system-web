/* eslint-disable @typescript-eslint/no-explicit-any */
export function hasPermission({
  authData,
  path,
  action = 'view',
}: {
  authData: any;
  path: string;
  action?: string;
}) {
  if (!authData) return false;

  // fast path: use permissionsByRoute if available
  const map = authData.permissionsByRoute || {};
  if (map[path] && map[path].includes(action)) return true;

  // fallback: scan enriched accesses
  const accesses = authData.accesses || [];
  return accesses.some((a: any) => {
    return a.screen?.url === path && a.permission?.name === action;
  });
}
