'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ClipboardCheck, Plus, Search } from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { HealthScoreBadge } from '@/components/badges';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { assessments, accounts } from '@/lib/mock-data';
import { formatDate, cn } from '@/lib/utils';
import type { AssessmentStatus, Category } from '@/lib/types';
import { toast } from 'sonner';

const categories: Category[] = [
  'Reliability', 'Security', 'EKS', 'Networking', 'IAM', 'S3',
  'Compute', 'Database', 'Observability', 'Backup', 'Governance', 'Automation',
];

const statusBadgeConfig: Record<AssessmentStatus, string> = {
  Scheduled: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
  Running: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  Completed: 'bg-success/10 text-success border-success/30',
  Failed: 'bg-destructive/10 text-destructive border-destructive/30',
};

export default function AssessmentsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');

  const filtered = useMemo(() => {
    return assessments.filter((a) => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.id.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (accountFilter !== 'all' && a.accountId !== accountFilter) return false;
      return true;
    });
  }, [search, categoryFilter, statusFilter, accountFilter]);

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Assessments"
          subtitle="Rule-based evaluations of your AWS environment across reliability, security, governance, and operational categories."
          actions={
            <Button onClick={() => toast.info('Assessment scheduling is planned for Phase 2.')}>
              <Plus className="h-4 w-4 mr-1.5" />
              New Assessment
            </Button>
          }
        />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assessments…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px] h-9 text-sm">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Running">Running</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={accountFilter} onValueChange={setAccountFilter}>
            <SelectTrigger className="w-[140px] h-9 text-sm">
              <SelectValue placeholder="Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
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
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Assessment</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Account</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Environment</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Category</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Score</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Findings</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Completed</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Status</th>
                    <th className="w-10 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/assessments/${a.id}`} className="font-medium hover:text-primary">
                          {a.name}
                        </Link>
                        <p className="text-xs text-muted-foreground font-mono">{a.id}</p>
                      </td>
                      <td className="px-4 py-3">{a.accountName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.environment}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{a.category}</Badge>
                      </td>
                      <td className="px-4 py-3">{a.status === 'Completed' ? <HealthScoreBadge score={a.score} /> : '—'}</td>
                      <td className="px-4 py-3">{a.findingsCount}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.completedAt ? formatDate(a.completedAt) : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium', statusBadgeConfig[a.status])}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/assessments/${a.id}`}>
                          <ArrowRight className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                        <ClipboardCheck className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">No assessments match your filters.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
