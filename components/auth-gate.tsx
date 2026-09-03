'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Activity } from 'lucide-react';

const PUBLIC_PATHS = ['/login'];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session, loading } = useAuth();

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground animate-pulse">
            <Activity className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground">Loading CloudOps Health…</p>
        </div>
      </div>
    );
  }

  if (!session && !isPublic) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Activity className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground">Redirecting to login…</p>
          <meta httpEquiv="refresh" content="0;url=/login" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
