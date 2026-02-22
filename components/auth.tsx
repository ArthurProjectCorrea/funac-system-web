'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
type AuthContextType = {
  authData: any | null;
  setAuthData: (d: any) => void;
  createProfile: (payload: { full_name?: string }) => Promise<any>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialAuthData,
}: {
  children: React.ReactNode;
  initialAuthData: any;
}) {
  const [authData, setAuthDataState] = useState<any | null>(
    initialAuthData ?? null,
  );

  const setAuthData = useCallback((d: any) => {
    setAuthDataState(d);
  }, []);

  const createProfile = useCallback(
    async (payload: { full_name?: string }) => {
      if (!authData?.user?.id) throw new Error('No authenticated user');
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: authData.user.id, ...payload }),
      });
      if (!res.ok) throw new Error('Failed to create profile');
      const data = await res.json();
      const updated = { ...authData, profile: data };
      setAuthDataState(updated);
      return data;
    },
    [authData],
  );

  return (
    <AuthContext.Provider value={{ authData, setAuthData, createProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthProvider;
