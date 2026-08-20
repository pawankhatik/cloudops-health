'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApp } from './app-provider';
import { accounts } from '@/lib/mock-data';
import type { Environment } from '@/lib/types';

const environments: Environment[] = ['Production', 'Staging', 'Development', 'Test'];
const timePeriods = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '1y', label: 'Last year' },
];

export function FilterBar() {
  const { filters, setFilter } = useApp();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={filters.organization} onValueChange={(v) => setFilter('organization', v)}>
        <SelectTrigger className="w-[160px] h-9 text-sm">
          <SelectValue placeholder="Organization" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="CloudOps Platform">CloudOps Platform</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.account} onValueChange={(v) => setFilter('account', v)}>
        <SelectTrigger className="w-[150px] h-9 text-sm">
          <SelectValue placeholder="AWS Account" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Accounts</SelectItem>
          {accounts.map((a) => (
            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.region} onValueChange={(v) => setFilter('region', v)}>
        <SelectTrigger className="w-[140px] h-9 text-sm">
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Regions</SelectItem>
          <SelectItem value="us-east-1">us-east-1</SelectItem>
          <SelectItem value="us-west-2">us-west-2</SelectItem>
        </SelectContent>
      </Select>

      <Select value={filters.environment} onValueChange={(v) => setFilter('environment', v)}>
        <SelectTrigger className="w-[150px] h-9 text-sm">
          <SelectValue placeholder="Environment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Environments</SelectItem>
          {environments.map((e) => (
            <SelectItem key={e} value={e}>{e}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.timePeriod} onValueChange={(v) => setFilter('timePeriod', v)}>
        <SelectTrigger className="w-[140px] h-9 text-sm">
          <SelectValue placeholder="Time Period" />
        </SelectTrigger>
        <SelectContent>
          {timePeriods.map((t) => (
            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
