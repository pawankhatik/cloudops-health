'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { Severity, FindingStatus, ControlResult, BusinessImpact } from '@/lib/types';
import { severityConfig, statusConfig, controlResultConfig, impactConfig } from '@/lib/utils';

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  const config = severityConfig[severity];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
        config.badge,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: FindingStatus;
  className?: string;
}) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
        config.badge,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}

export function ControlResultBadge({
  result,
  className,
}: {
  result: ControlResult;
  className?: string;
}) {
  const config = controlResultConfig[result];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        config.badge,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function ImpactBadge({
  impact,
  className,
}: {
  impact: BusinessImpact;
  className?: string;
}) {
  const config = impactConfig[impact];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
        config.badge,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function HealthScoreBadge({ score }: { score: number }) {
  const color =
    score >= 85 ? 'text-success bg-success/10 border-success/30'
    : score >= 70 ? 'text-amber-500 bg-amber-500/10 border-amber-500/30'
    : score >= 50 ? 'text-orange-500 bg-orange-500/10 border-orange-500/30'
    : 'text-destructive bg-destructive/10 border-destructive/30';
  return (
    <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold', color)}>
      {score}
    </span>
  );
}
