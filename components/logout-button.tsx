'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

import { toast } from 'sonner';

// static text for logout button
const text = {
  logout: 'Logout',
  signingOut: 'Saindo…',
  success: 'Desconectado',
  error: 'Falha ao desconectar',
} as const;

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) {
      toast.error(text.error);
      return;
    }
    toast.success(text.success);
    // after sign out redirect to login page
    router.push('/login');
  };

  return (
    <Button onClick={handleLogout} variant="outline" disabled={loading}>
      {loading ? text.signingOut : text.logout}
    </Button>
  );
}
