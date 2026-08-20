'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Zap,
  Activity,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  FileText,
  Cpu,
  ClipboardCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Area,
  AreaChart,
} from 'recharts';
import { PageHeader, PageContainer } from '@/components/page-header';
import { FilterBar } from '@/components/filter-bar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SeverityBadge } from '@/components/badges';
import { useApp } from '@/components/app-provider';
import {
  healthCategories,
  healthTrends,
  riskDistribution,
  findings,
  activityEvents,
  kpiTrends,
} from '@/lib/mock-data';
import {
  cn,
  healthScoreColor,
  healthScoreLabel,
  severityConfig,
  relativeTime,
} from '@/lib/utils';
import type { ActivityEvent } from '@/lib/types';

const severityColors: Record<string, string> = {
  Critical: 'hsl(0 72% 51%)',
  High: 'hsl(25 90% 50%)',
  Medium: 'hsl(38 92% 50%)',
  Low: 'hsl(199 89% 48%)',
};

function HealthScoreCard() {
  const score = 82;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Overall Health Score</CardTitle>
        <CardDescription>Weighted across all assessment categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-8">
          <div className="relative shrink-0">
            <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
              />
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="hsl(var(--success))"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn('text-5xl font-bold tabular-nums', healthScoreColor(score))}>
                {score}
              </span>
              <span className="text-sm text-muted-foreground mt-1">/ 100</span>
              <span className={cn('text-sm font-semibold mt-1', healthScoreColor(score))}>
                {healthScoreLabel(score)}
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            {healthCategories.map((cat) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-28 shrink-0">{cat.name}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-700', healthScoreBg(cat.score))}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
                <span className="text-sm font-semibold tabular-nums w-8 text-right">
                  {cat.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function healthScoreBg(score: number): string {
  if (score >= 85) return 'bg-success';
  if (score >= 70) return 'bg-amber-500';
  if (score >= 50) return 'bg-orange-500';
  return 'bg-destructive';
}

function KpiCard({
  label,
  value,
  suffix,
  icon: Icon,
  trend,
  trendDirection,
  trendLabel,
  accent,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ElementType;
  trend: 'up' | 'down';
  trendDirection: 'good' | 'bad';
  trendLabel: string;
  accent: string;
}) {
  const isGood = (trend === 'up' && trendDirection === 'good') || (trend === 'down' && trendDirection === 'bad');
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </span>
            <span className="text-3xl font-bold tabular-nums">
              {value}
              {suffix && <span className="text-lg text-muted-foreground ml-0.5">{suffix}</span>}
            </span>
          </div>
          <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', accent)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          {isGood ? (
            trend === 'up' ? <ArrowUpRight className="h-3.5 w-3.5 text-success" /> : <ArrowDownRight className="h-3.5 w-3.5 text-success" />
          ) : (
            trend === 'up' ? <ArrowUpRight className="h-3.5 w-3.5 text-destructive" /> : <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
          )}
          <span className={cn('text-xs font-medium', isGood ? 'text-success' : 'text-destructive')}>
            {trendLabel}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function KpiGrid() {
  const k = kpiTrends;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <KpiCard label="Critical" value={k.criticalFindings.current} icon={AlertTriangle} trend="down" trendDirection="good" trendLabel={`↓ ${k.criticalFindings.change} vs last month`} accent="bg-destructive/10 text-destructive" />
      <KpiCard label="High" value={k.highFindings.current} icon={ShieldCheck} trend="down" trendDirection="good" trendLabel={`↓ ${k.highFindings.change} vs last month`} accent="bg-orange-500/10 text-orange-500" />
      <KpiCard label="Open" value={k.openFindings.current} icon={AlertTriangle} trend="down" trendDirection="good" trendLabel={`↓ ${k.openFindings.change} vs last month`} accent="bg-amber-500/10 text-amber-500" />
      <KpiCard label="Resolved" value={k.findingsResolved.current} icon={CheckCircle2} trend="up" trendDirection="good" trendLabel={`↑ ${k.findingsResolved.change} vs last month`} accent="bg-success/10 text-success" />
      <KpiCard label="Automation" value={k.automationCoverage.current} suffix="%" icon={Zap} trend="up" trendDirection="good" trendLabel={`↑ ${k.automationCoverage.change} vs last month`} accent="bg-primary/10 text-primary" />
      <KpiCard label="Health" value={k.platformHealth.current} suffix="%" icon={Activity} trend="up" trendDirection="good" trendLabel={`↑ ${k.platformHealth.change} vs last month`} accent="bg-success/10 text-success" />
    </div>
  );
}

function RiskDistributionChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Risk Distribution</CardTitle>
        <CardDescription>Findings by severity across all accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <ResponsiveContainer width="50%" height={180}>
            <PieChart>
              <Pie
                data={riskDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={2}
              >
                {riskDistribution.map((entry) => (
                  <Cell key={entry.name} fill={severityColors[entry.name]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2.5">
            {riskDistribution.map((r) => (
              <Link
                key={r.name}
                href={`/findings?severity=${r.name}`}
                className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors group"
              >
                <span
                  className="h-3 w-3 rounded-sm shrink-0"
                  style={{ background: severityColors[r.name] }}
                />
                <span className="text-sm font-medium flex-1">{r.name}</span>
                <span className="text-sm font-semibold tabular-nums">{r.value}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HealthByCategoryChart() {
  const data = healthCategories.map((c) => ({
    name: c.name,
    score: c.score,
    fill: c.score >= 85 ? 'hsl(var(--success))' : c.score >= 70 ? 'hsl(38 92% 50%)' : 'hsl(25 90% 50%)',
  }));
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Health by Category</CardTitle>
        <CardDescription>Click a category to view related assessments</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
            <CartesianGrid horizontal={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={90} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={18}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function HealthTrendChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Platform Health Trend</CardTitle>
        <CardDescription>Overall health score over the last 8 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={healthTrends} margin={{ left: 0, right: 10, top: 5, bottom: 0 }}>
            <defs>
              <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis domain={[60, 90]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#healthGradient)"
              dot={{ fill: 'hsl(var(--primary))', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function CategoryTrendChart() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Category Trends</CardTitle>
        <CardDescription>Health scores by category over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={healthTrends} margin={{ left: 0, right: 10, top: 5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Line type="monotone" dataKey="security" stroke="hsl(var(--success))" strokeWidth={2} dot={false} name="Security" />
            <Line type="monotone" dataKey="reliability" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Reliability" />
            <Line type="monotone" dataKey="governance" stroke="hsl(38 92% 50%)" strokeWidth={2} dot={false} name="Governance" />
            <Line type="monotone" dataKey="observability" stroke="hsl(280 60% 60%)" strokeWidth={2} dot={false} name="Observability" />
            <Line type="monotone" dataKey="backup" stroke="hsl(0 72% 55%)" strokeWidth={2} dot={false} name="Backup & DR" />
            <Line type="monotone" dataKey="automation" stroke="hsl(160 60% 45%)" strokeWidth={2} dot={false} name="Automation" />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
          {[
            { label: 'Security', color: 'hsl(var(--success))' },
            { label: 'Reliability', color: 'hsl(var(--primary))' },
            { label: 'Governance', color: 'hsl(38 92% 50%)' },
            { label: 'Observability', color: 'hsl(280 60% 60%)' },
            { label: 'Backup & DR', color: 'hsl(0 72% 55%)' },
            { label: 'Automation', color: 'hsl(160 60% 45%)' },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const activityIcons: Record<ActivityEvent['type'], React.ElementType> = {
  finding_created: AlertTriangle,
  finding_assigned: ShieldCheck,
  finding_resolved: CheckCircle2,
  assessment_completed: ClipboardCheck,
  control_failed: AlertTriangle,
  automation_executed: Zap,
  report_generated: FileText,
};

const activityColors: Record<ActivityEvent['type'], string> = {
  finding_created: 'bg-destructive/10 text-destructive',
  finding_assigned: 'bg-blue-500/10 text-blue-500',
  finding_resolved: 'bg-success/10 text-success',
  assessment_completed: 'bg-primary/10 text-primary',
  control_failed: 'bg-amber-500/10 text-amber-500',
  automation_executed: 'bg-purple-500/10 text-purple-500',
  report_generated: 'bg-emerald-500/10 text-emerald-500',
};

function TopRisks() {
  const topFindings = findings
    .filter((f) => f.severity === 'Critical' || f.severity === 'High')
    .sort((a, b) => {
      const order = { Critical: 0, High: 1 };
      return order[a.severity] - order[b.severity];
    })
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">Top Risks Requiring Attention</CardTitle>
            <CardDescription>Highest-priority findings across the platform</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/findings?severity=Critical">
              View all
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {topFindings.map((f) => (
          <Link
            key={f.id}
            href={`/findings/${f.id}`}
            className="flex items-start gap-3 rounded-lg border border-border p-3 hover:bg-muted/30 hover:border-input transition-colors group"
          >
            <SeverityBadge severity={f.severity} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                {f.title}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5 text-xs text-muted-foreground">
                <span>{f.category}</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span>{f.accountName}</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span>{f.environment}</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span className="font-mono text-[11px]">{f.resource}</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span>{f.owner}</span>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function ActivityTimeline() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
        <CardDescription>Latest platform events and changes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-4 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-border">
          {activityEvents.map((event) => {
            const Icon = activityIcons[event.type];
            return (
              <div key={event.id} className="relative flex gap-3">
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-full shrink-0 z-10 border-2 border-card', activityColors[event.type])}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex flex-col gap-0.5 pt-1">
                  <p className="text-sm leading-tight">{event.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{relativeTime(event.timestamp)}</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    <span>{event.user}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ExecutiveSummary() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold">Executive Summary — August 2026</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Platform health improved from 76 to 82 over the last month, driven by a 33% reduction
              in critical findings and 31 resolved issues. 12 high-priority findings remain,
              primarily in security group configuration and EKS version alignment. 5 operational
              workflows have been identified for automation to reduce manual remediation effort.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary" className="gap-1">
                <TrendingUp className="h-3 w-3 text-success" />
                Health +6 pts
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-3 w-3 text-success" />
                31 resolved
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <AlertTriangle className="h-3 w-3 text-destructive" />
                12 high-priority open
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Zap className="h-3 w-3 text-primary" />
                5 automation candidates
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { viewMode } = useApp();
  const isExecutive = viewMode === 'executive';

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <PageHeader
            title="AWS Platform Health"
            subtitle="Centralized visibility into cloud reliability, security, governance and operational risk."
          />
          <FilterBar />
        </div>

        {isExecutive && <ExecutiveSummary />}

        {/* Row 1: Health score + KPIs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <HealthScoreCard />
          </div>
          <div className="lg:col-span-2">
            <KpiGrid />
          </div>
        </div>

        {/* Row 2: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HealthTrendChart />
          <RiskDistributionChart />
        </div>

        {/* Row 3: Category breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HealthByCategoryChart />
          <CategoryTrendChart />
        </div>

        {/* Row 4: Top risks + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopRisks />
          <ActivityTimeline />
        </div>
      </div>
    </PageContainer>
  );
}
