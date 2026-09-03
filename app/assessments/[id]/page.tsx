'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import {
  ArrowLeft,
  ClipboardCheck,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { PageContainer } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HealthScoreBadge, ControlResultBadge, SeverityBadge } from '@/components/badges';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { assessments } from '@/lib/mock-data';
import { formatDate, formatDateTime, cn } from '@/lib/utils';

export default function AssessmentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const assessment = assessments.find((a) => a.id === id);
  if (!assessment) return notFound();

  const passed = assessment.controls.filter((c) => c.result === 'Pass').length;
  const failed = assessment.controls.filter((c) => c.result === 'Fail').length;
  const warnings = assessment.controls.filter((c) => c.result === 'Warning').length;

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/assessments" className="text-muted-foreground hover:text-foreground flex items-center gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Assessments
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium">{assessment.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <ClipboardCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{assessment.name}</h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                <span className="font-mono">{assessment.id}</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <Link href={`/accounts/${assessment.accountId}`} className="hover:text-foreground">
                  {assessment.accountName}
                </Link>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <span>{assessment.environment}</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                <Badge variant="outline">{assessment.category}</Badge>
              </div>
            </div>
          </div>
          {assessment.status === 'Completed' && <HealthScoreBadge score={assessment.score} />}
        </div>

        {/* Summary metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                <ClipboardCheck className="h-3.5 w-3.5" />
                Score
              </div>
              <p className="text-2xl font-bold mt-2">
                {assessment.status === 'Completed' ? assessment.score : '—'}
                {assessment.status === 'Completed' && <span className="text-sm text-muted-foreground">/100</span>}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                Passed
              </div>
              <p className="text-2xl font-bold mt-2 text-success">{passed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                Failed
              </div>
              <p className="text-2xl font-bold mt-2 text-destructive">{failed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wide">
                <Info className="h-3.5 w-3.5 text-amber-500" />
                Warnings
              </div>
              <p className="text-2xl font-bold mt-2 text-amber-500">{warnings}</p>
            </CardContent>
          </Card>
        </div>

        {/* Assessment metadata */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Assessment Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Started</p>
              <p className="font-medium mt-1">{formatDateTime(assessment.startedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="font-medium mt-1">{assessment.completedAt ? formatDateTime(assessment.completedAt) : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Findings Generated</p>
              <p className="font-medium mt-1">{assessment.findingsCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <div className="mt-1">
                <Badge variant={assessment.status === 'Completed' ? 'secondary' : 'default'}>
                  {assessment.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Controls</CardTitle>
            <CardDescription>
              {assessment.controls.length} controls evaluated. Click to expand details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Control</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Result</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {assessment.controls.map((c) => (
                    <tr key={c.controlId} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-muted-foreground">{c.controlId}</span>
                        <p className="font-medium mt-0.5">{c.name}</p>
                      </td>
                      <td className="px-4 py-3"><ControlResultBadge result={c.result} /></td>
                      <td className="px-4 py-3">
                        {c.severity ? <SeverityBadge severity={c.severity} /> : <span className="text-muted-foreground">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-sm font-semibold mb-3 mt-6">Control Details</h3>
            <Accordion type="multiple" className="space-y-2">
              {assessment.controls.map((c) => (
                <AccordionItem
                  key={c.controlId}
                  value={c.controlId}
                  className="border border-border rounded-lg px-4 overflow-hidden data-[state=open]:bg-muted/20"
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3 flex-1 pr-4">
                      <ControlResultBadge result={c.result} />
                      <span className="font-mono text-xs text-muted-foreground">{c.controlId}</span>
                      <span className="font-medium text-sm flex-1 text-left">{c.name}</span>
                      {c.severity && <SeverityBadge severity={c.severity} />}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pt-1 space-y-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Description</p>
                      <p className="text-sm">{c.description}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <Info className="h-3 w-3" />
                        Why it matters
                      </p>
                      <p className="text-sm">{c.whyItMatters}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <FileText className="h-3 w-3" />
                        Evidence
                      </p>
                      <p className="text-sm font-mono text-xs bg-muted/50 rounded-md p-3 border border-border">
                        {c.evidence}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <Lightbulb className="h-3 w-3" />
                        Recommendation
                      </p>
                      <p className="text-sm">{c.recommendation}</p>
                    </div>
                    {c.findingId && (
                      <div className="pt-2 border-t border-border">
                        <Link
                          href={`/findings/${c.findingId}`}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Related finding: {c.findingId}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
