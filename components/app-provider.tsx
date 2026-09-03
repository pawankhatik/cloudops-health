'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Environment } from '@/lib/types';

type ViewMode = 'engineering' | 'executive';

interface FilterState {
  organization: string;
  account: string;
  region: string;
  environment: Environment | 'all';
  timePeriod: string;
}

interface AppState {
  filters: FilterState;
  setFilter: (key: keyof FilterState, value: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  demoMode: boolean;
  resetDemoData: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [filters, setFilters] = useState<FilterState>({
    organization: 'CloudOps Platform',
    account: 'all',
    region: 'all',
    environment: 'all',
    timePeriod: '30d',
  });
  const [viewMode, setViewMode] = useState<ViewMode>('engineering');
  const [demoMode, setDemoMode] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  const setFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetDemoData = useCallback(() => {
    setResetKey((k) => k + 1);
  }, []);

  return (
    <AppContext.Provider
      value={{
        filters,
        setFilter,
        viewMode,
        setViewMode,
        demoMode,
        resetDemoData,
      }}
      key={resetKey}
    >
      {children}
    </AppContext.Provider>
  );
}
