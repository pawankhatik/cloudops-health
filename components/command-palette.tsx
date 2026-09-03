'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Cloud,
  AlertTriangle,
  ClipboardCheck,
  ShieldCheck,
  Search,
  ArrowRight,
} from 'lucide-react';
import { accounts, findings, assessments, controls } from '@/lib/mock-data';
import { severityConfig } from '@/lib/utils';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search accounts, findings, assessments, controls…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Findings">
          {findings.slice(0, 8).map((f) => (
            <CommandItem
              key={f.id}
              value={`${f.id} ${f.title} ${f.category} ${f.severity}`}
              onSelect={() => go(`/findings/${f.id}`)}
              className="gap-3"
            >
              <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate text-sm">{f.title}</span>
                <span className="text-xs text-muted-foreground">
                  {f.id} · {f.severity} · {f.category}
                </span>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium border ${severityConfig[f.severity].badge}`}>
                {f.severity}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="AWS Accounts">
          {accounts.map((a) => (
            <CommandItem
              key={a.id}
              value={`${a.name} ${a.accountId} ${a.environment}`}
              onSelect={() => go(`/accounts/${a.id}`)}
              className="gap-3"
            >
              <Cloud className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate text-sm">{a.name}</span>
                <span className="text-xs text-muted-foreground">
                  {a.accountId} · {a.environment}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Assessments">
          {assessments.slice(0, 6).map((a) => (
            <CommandItem
              key={a.id}
              value={`${a.name} ${a.category} ${a.accountName}`}
              onSelect={() => go(`/assessments/${a.id}`)}
              className="gap-3"
            >
              <ClipboardCheck className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate text-sm">{a.name}</span>
                <span className="text-xs text-muted-foreground">
                  {a.accountName} · {a.category}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Controls">
          {controls.slice(0, 6).map((c) => (
            <CommandItem
              key={c.id}
              value={`${c.id} ${c.name} ${c.category}`}
              onSelect={() => go('/controls')}
              className="gap-3"
            >
              <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="truncate text-sm">{c.name}</span>
                <span className="text-xs text-muted-foreground">
                  {c.id} · {c.category}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => go('/')} className="gap-3">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm">Dashboard</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          </CommandItem>
          <CommandItem onSelect={() => go('/findings')} className="gap-3">
            <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm">All Findings</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          </CommandItem>
          <CommandItem onSelect={() => go('/remediation')} className="gap-3">
            <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm">Remediation Board</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
