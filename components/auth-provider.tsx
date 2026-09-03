'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { DbUser, Role } from '@/lib/db-types';

interface AuthState {
  session: Session | null;
  user: DbUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async (userId: string): Promise<DbUser | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) return null;
    return data as DbUser | null;
  }, []);

  const refreshUser = useCallback(async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (s?.user) {
      const u = await fetchUser(s.user.id);
      setUser(u);
    } else {
      setUser(null);
    }
  }, [fetchUser]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.onAuthStateChange((event, s) => {
      (async () => {
        if (!mounted) return;
        setSession(s);
        if (s?.user) {
          const u = await fetchUser(s.user.id);
          if (mounted) setUser(u);
        } else {
          if (mounted) setUser(null);
        }
        if (mounted) setLoading(false);
      })();
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) {
        fetchUser(s.user.id).then((u) => {
          if (mounted) {
            setUser(u);
            setLoading(false);
          }
        });
      } else {
        if (mounted) setLoading(false);
      }
    });

    return () => { mounted = false; };
  }, [fetchUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, loading, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
