import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Severity, FindingStatus, ControlResult, BusinessImpact } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function relativeTime(iso: string): string {
  if (!iso) return '—';
  const now = new Date('2026-08-19T10:00:00Z').getTime();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 30) return formatDate(iso);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

export function daysUntil(iso: string): number {
  const now = new Date('2026-08-19T10:00:00Z').getTime();
  const due = new Date(iso).getTime();
  return Math.ceil((due - now) / 86400000);
}

export const severityConfig: Record<
  Severity,
  { label: string; badge: string; dot: string; text: string; bg: string; border: string }
> = {
  Critical: {
    label: 'Critical',
    badge: 'bg-destructive/10 text-destructive border-destructive/30',
    dot: 'bg-destructive',
    text: 'text-destructive',
    bg: 'bg-destructive/5',
    border: 'border-destructive/20',
  },
  High: {
    label: 'High',
    badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30',
    dot: 'bg-orange-500',
    text: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/5',
    border: 'border-orange-500/20',
  },
  Medium: {
    label: 'Medium',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    dot: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/5',
    border: 'border-amber-500/20',
  },
  Low: {
    label: 'Low',
    badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
    dot: 'bg-sky-500',
    text: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-500/5',
    border: 'border-sky-500/20',
  },
};

export const statusConfig: Record<
  FindingStatus,
  { label: string; badge: string; dot: string }
> = {
  Open: { label: 'Open', badge: 'bg-destructive/10 text-destructive border-destructive/30', dot: 'bg-destructive' },
  Investigating: { label: 'Investigating', badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30', dot: 'bg-blue-500' },
  Planned: { label: 'Planned', badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30', dot: 'bg-purple-500' },
  'In Progress': { label: 'In Progress', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30', dot: 'bg-amber-500' },
  Resolved: { label: 'Resolved', badge: 'bg-success/10 text-success border-success/30', dot: 'bg-success' },
  'Accepted Risk': { label: 'Accepted Risk', badge: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' },
  'False Positive': { label: 'False Positive', badge: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' },
};

export const controlResultConfig: Record<
  ControlResult,
  { label: string; badge: string }
> = {
  Pass: { label: 'Pass', badge: 'bg-success/10 text-success border-success/30' },
  Fail: { label: 'Fail', badge: 'bg-destructive/10 text-destructive border-destructive/30' },
  Warning: { label: 'Warning', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
};

export const impactConfig: Record<BusinessImpact, { label: string; badge: string }> = {
  'Availability Risk': { label: 'Availability Risk', badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30' },
  'Security Risk': { label: 'Security Risk', badge: 'bg-destructive/10 text-destructive border-destructive/30' },
  'Compliance Risk': { label: 'Compliance Risk', badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  'Data Risk': { label: 'Data Risk', badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' },
  'Operational Risk': { label: 'Operational Risk', badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  'Financial Risk': { label: 'Financial Risk', badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
};

export function healthScoreColor(score: number): string {
  if (score >= 85) return 'text-success';
  if (score >= 70) return 'text-amber-500';
  if (score >= 50) return 'text-orange-500';
  return 'text-destructive';
}

export function healthScoreLabel(score: number): string {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  return 'Poor';
}

export function healthScoreBg(score: number): string {
  if (score >= 85) return 'bg-success';
  if (score >= 70) return 'bg-amber-500';
  if (score >= 50) return 'bg-orange-500';
  return 'bg-destructive';
}
