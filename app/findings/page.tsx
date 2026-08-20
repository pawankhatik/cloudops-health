'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, ArrowRight, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SeverityBadge, StatusBadge } from '@/components/badges';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { findings, accounts } from '@/lib/mock-data';
import { formatDate, cn } from '@/lib/utils';
import type { Severity, FindingStatus, Category } from '@/lib/types';

const categories: Category[] = [
  'Reliability', 'Security', 'EKS', 'Networking', 'IAM', 'S3',
  'Compute', 'Database', 'Observability', 'Backup', 'Governance', 'Automation',
];
const severities: Severity[] = ['Critical', 'High', 'Medium', 'Low'];
const statuses: FindingStatus[] = ['Open', 'Investigating', 'Planned', 'In Progress', 'Resolved', 'Accepted Risk', 'False Positive'];
const owners = [...new Set(findings.map((f) => f.owner))];

const PAGE_SIZE = 12;

export default function FindingsPage() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<string>(searchParams.get('severity') || 'all');
  const [category, setCategory] = useState('all');
  const [account, setAccount] = useState<string>(searchParams.get('account') || 'all');
  const [environment, setEnvironment] = useState('all');
  const [status, setStatus] = useState('all');
  const [owner, setOwner] = useState('all');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'severity' | 'createdAt' | 'dueDate'>('severity');

  useEffect(() => {
    const sev = searchParams.get('severity');
    const acc = searchParams.get('account');
    if (sev) setSeverity(sev);
    if (acc) setAccount(acc);
  }, [searchParams]);

  const severityOrder: Record<Severity, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };

  const filtered = useMemo(() => {
    let result = findings.filter((f) => {
      if (search && !f.title.toLowerCase().includes(search.toLowerCase()) && !f.id.toLowerCase().includes(search.toLowerCase()) && !f.resource.toLowerCase().includes(search.toLowerCase())) return false;
      if (severity !== 'all' && f.severity !== severity) return false;
      if (category !== 'all' && f.category !== category) return false;
      if (account !== 'all' && f.accountId !== account) return false;
      if (environment !== 'all' && f.environment !== environment) return false;
      if (status !== 'all' && f.status !== status) return false;
      if (owner !== 'all' && f.owner !== owner) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'severity') return severityOrder[a.severity] - severityOrder[b.severity];
      if (sortBy === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'dueDate') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return 0;
    });

    return result;
  }, [search, severity, category, account, environment, status, owner, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, severity, category, account, environment, status, owner, sortBy]);

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Findings"
          subtitle={`${filtered.length} findings across all connected AWS accounts. Filter, search, and track remediation progress.`}
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search findings, IDs, resources…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="w-[130px] h-9 text-sm">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              {severities.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={account} onValueChange={setAccount}>
            <SelectTrigger className="w-[130px] h-9 text-sm">
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={environment} onValueChange={setEnvironment}>
            <SelectTrigger className="w-[130px] h-9 text-sm">
              <SelectValue placeholder="Environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Environments</SelectItem>
              <SelectItem value="Production">Production</SelectItem>
              <SelectItem value="Staging">Staging</SelectItem>
              <SelectItem value="Development">Development</SelectItem>
              <SelectItem value="Test">Test</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={owner} onValueChange={setOwner}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {owners.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="severity">Sort: Severity</SelectItem>
              <SelectItem value="createdAt">Sort: Newest</SelectItem>
              <SelectItem value="dueDate">Sort: Due Date</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Finding</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Severity</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Category</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Account</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Env</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Resource</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Owner</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Status</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Due</th>
                    <th className="w-10 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((f) => (
                    <tr key={f.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/findings/${f.id}`} className="font-medium hover:text-primary">
                          {f.title}
                        </Link>
                        <p className="text-xs text-muted-foreground font-mono">{f.id}</p>
                      </td>
                      <td className="px-4 py-3"><SeverityBadge severity={f.severity} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{f.category}</td>
                      <td className="px-4 py-3 text-muted-foreground">{f.accountName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{f.environment}</td>
                      <td className="px-4 py-3 font-mono text-xs">{f.resource.length > 25 ? f.resource.slice(0, 25) + '…' : f.resource}</td>
                      <td className="px-4 py-3 text-muted-foreground">{f.owner}</td>
                      <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(f.dueDate)}</td>
                      <td className="px-4 py-3">
                        <Link href={`/findings/${f.id}`}>
                          <ArrowRight className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No findings match your filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Prev
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
