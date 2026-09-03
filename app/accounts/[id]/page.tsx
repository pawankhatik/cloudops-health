'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import {
  ArrowLeft,
  Cloud,
  MapPin,
  Activity,
  AlertTriangle,
  ClipboardCheck,
  Server,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { PageContainer } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HealthScoreBadge, SeverityBadge, StatusBadge } from '@/components/badges';
import { accounts, findings, assessments } from '@/lib/mock-data';
import { formatDate, formatDateTime, cn } from '@/lib/utils';

export default function AccountDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const account = accounts.find((a) => a.id === id);
  if (!account) return notFound();

  const accountFindings = findings.filter((f) => f.accountId === account.id);
  const accountAssessments = assessments.filter((a) => a.accountId === account.id);

  const findingsBySeverity = {
    Critical: accountFindings.filter((f) => f.severity === 'Critical').length,
    High: accountFindings.filter((f) => f.severity === 'High').length,
    Medium: accountFindings.filter((f) => f.severity === 'Medium').length,
    Low: accountFindings.filter((f) => f.severity === 'Low').length,
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        {/* Breadcrumb + back */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/accounts" className="text-muted-foreground hover:text-foreground flex items-center gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            AWS Accounts
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">{account.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Cloud className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{account.name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                <span className="font-mono">{account.accountId}</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <Badge variant="secondary" className="gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  {account.status}
                </Badge>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span>Owner: {account.owner}</span>
              </div>
            </div>
          </div>
          <HealthScoreBadge score={account.healthScore} />
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                <Activity className="h-3.5 w-3.5" />
                Health Score
              </div>
              <p className="text-2xl font-bold mt-2">{account.healthScore}<span className="text-sm text-muted-foreground">/100</span></p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                <AlertTriangle className="h-3.5 w-3.5" />
                Findings
              </div>
              <p className="text-2xl font-bold mt-2">{account.findingsCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                <Server className="h-3.5 w-3.5" />
                Resources
              </div>
              <p className="text-2xl font-bold mt-2">{account.resourcesCount.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                <Calendar className="h-3.5 w-3.5" />
                Last Assessment
              </div>
              <p className="text-sm font-medium mt-2">{formatDate(account.lastAssessment)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Account info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account Name</span>
                <span className="font-medium">{account.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account ID</span>
                <span className="font-mono font-medium">{account.accountId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Environment</span>
                <span className="font-medium">{account.environment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Regions</span>
                <span className="font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {account.regions.join(', ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Owner</span>
                <span className="font-medium">{account.owner}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary" className="gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  {account.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Findings by severity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Findings by Severity</CardTitle>
              <CardDescription>{accountFindings.length} total findings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {(['Critical', 'High', 'Medium', 'Low'] as const).map((sev) => (
                <Link
                  key={sev}
                  href={`/findings?account=${account.id}&severity=${sev}`}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors group"
                >
                  <SeverityBadge severity={sev} />
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn('h-full', sev === 'Critical' ? 'bg-destructive' : sev === 'High' ? 'bg-orange-500' : sev === 'Medium' ? 'bg-amber-500' : 'bg-sky-500')}
                      style={{ width: `${accountFindings.length ? (findingsBySeverity[sev] / accountFindings.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="font-semibold tabular-nums w-6 text-right text-sm">
                    {findingsBySeverity[sev]}
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Assessment Summary</CardTitle>
              <CardDescription>{accountAssessments.length} assessments run</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {accountAssessments.slice(0, 5).map((a) => (
                <Link
                  key={a.id}
                  href={`/assessments/${a.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors group"
                >
                  <ClipboardCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.category} · {formatDate(a.completedAt)}</p>
                  </div>
                  <HealthScoreBadge score={a.score} />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Assessment history */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Assessment History</CardTitle>
            <CardDescription>All assessments run for this account</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Assessment</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Category</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Score</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Findings</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Completed</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Status</th>
                    <th className="w-10 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {accountAssessments.map((a) => (
                    <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/assessments/${a.id}`} className="font-medium hover:text-primary">
                          {a.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{a.category}</td>
                      <td className="px-4 py-3"><HealthScoreBadge score={a.score} /></td>
                      <td className="px-4 py-3">{a.findingsCount}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(a.completedAt)}</td>
                      <td className="px-4 py-3">
                        <Badge variant={a.status === 'Completed' ? 'secondary' : 'default'}>
                          {a.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/assessments/${a.id}`}>
                          <ArrowRight className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent findings */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Findings</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/findings?account=${account.id}`}>
                  View all
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Finding</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Severity</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Status</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Resource</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {accountFindings.slice(0, 8).map((f) => (
                    <tr key={f.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/findings/${f.id}`} className="font-medium hover:text-primary">
                          {f.title}
                        </Link>
                        <p className="text-xs text-muted-foreground font-mono">{f.id}</p>
                      </td>
                      <td className="px-4 py-3"><SeverityBadge severity={f.severity} /></td>
                      <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                      <td className="px-4 py-3 font-mono text-xs">{f.resource}</td>
                      <td className="px-4 py-3 text-muted-foreground">{f.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
