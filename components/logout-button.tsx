'use client';

import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

import { toast } from 'sonner';

export function LogoutButton({
  children,
  messages,
}: {
  children?: React.ReactNode;
  messages?: { success: string; error: string; loading?: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) {
      toast.error(messages?.error || 'Error signing out');
      return;
    }
    toast.success(messages?.success || 'Signed out');
    // after sign out redirect to login page
    const parts = pathname.split('/').filter(Boolean);
    const locale = parts[0] || '';
    router.push(`/${locale}/login`);
  };

  return (
    <Button onClick={handleLogout} variant="outline" disabled={loading}>
      {loading ? messages?.loading || 'Signing out…' : children || 'Logout'}
    </Button>
  );
}
