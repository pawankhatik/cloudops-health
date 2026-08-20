'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import {
  ArrowLeft,
  AlertTriangle,
  Shield,
  Activity,
  FileText,
  Lightbulb,
  User,
  Calendar,
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Send,
  ChevronDown,
} from 'lucide-react';
import { PageContainer } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SeverityBadge, StatusBadge, ImpactBadge } from '@/components/badges';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { findings, auditLog } from '@/lib/mock-data';
import { formatDate, formatDateTime, relativeTime, cn } from '@/lib/utils';
import type { FindingStatus, Severity } from '@/lib/types';
import { toast } from 'sonner';

export default function FindingDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const finding = findings.find((f) => f.id === id);
  if (!finding) return notFound();

  const [status, setStatus] = useState<FindingStatus>(finding.status);
  const [severity, setSeverity] = useState<Severity>(finding.severity);
  const [comments, setComments] = useState(finding.comments);
  const [commentText, setCommentText] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [severityOpen, setSeverityOpen] = useState(false);

  const relatedAudit = auditLog.filter((a) => a.resource === finding.id);

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    setComments([
      ...comments,
      {
        id: `c-${Date.now()}`,
        author: 'Pawan Kumar',
        text: commentText,
        createdAt: new Date().toISOString(),
      },
    ]);
    setCommentText('');
    toast.success('Comment added.');
  };

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/findings" className="text-muted-foreground hover:text-foreground flex items-center gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Findings
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-mono">{finding.id}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl shrink-0',
                finding.severity === 'Critical' ? 'bg-destructive/10 text-destructive'
                : finding.severity === 'High' ? 'bg-orange-500/10 text-orange-500'
                : finding.severity === 'Medium' ? 'bg-amber-500/10 text-amber-500'
                : 'bg-sky-500/10 text-sky-500'
              )}>
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-muted-foreground">{finding.id}</span>
                  <SeverityBadge severity={severity} />
                  <StatusBadge status={status} />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">{finding.title}</h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-muted-foreground">
                  <Link href={`/accounts/${finding.accountId}`} className="hover:text-foreground">
                    {finding.accountName}
                  </Link>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                  <span>{finding.environment}</span>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                  <span className="font-mono text-xs">{finding.resource}</span>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                  <span>{finding.category}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu open={assignOpen} onOpenChange={setAssignOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-3.5 w-3.5 mr-1.5" />
                  Assign
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Assign to</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {['Sarah Chen', 'Marcus Webb', 'Elena Rossi', 'David Park'].map((name) => (
                  <DropdownMenuItem
                    key={name}
                    onClick={() => {
                      setAssignOpen(false);
                      toast.success(`Finding assigned to ${name}.`);
                    }}
                  >
                    {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={severityOpen} onOpenChange={setSeverityOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
                  Change Severity
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Severity</DialogTitle>
                  <DialogDescription>Current severity: {severity}</DialogDescription>
                </DialogHeader>
                <Select value={severity} onValueChange={(v) => setSeverity(v as Severity)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSeverityOpen(false)}>Cancel</Button>
                  <Button onClick={() => {
                    setSeverityOpen(false);
                    toast.success(`Severity changed to ${severity}.`);
                  }}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Activity className="h-3.5 w-3.5 mr-1.5" />
                  Change Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Status</DialogTitle>
                  <DialogDescription>Current status: {status}</DialogDescription>
                </DialogHeader>
                <Select value={status} onValueChange={(v) => setStatus(v as FindingStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['Open', 'Investigating', 'Planned', 'In Progress', 'Resolved', 'Accepted Risk', 'False Positive'].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setStatusOpen(false)}>Cancel</Button>
                  <Button onClick={() => {
                    setStatusOpen(false);
                    toast.success(`Status changed to ${status}.`);
                  }}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={() => toast.success('Comment section activated. Add your comment below.')}>
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Add Comment
            </Button>

            <Button
              size="sm"
              variant="default"
              onClick={() => {
                setStatus('Resolved');
                toast.success('Finding marked as resolved.');
              }}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Mark Resolved
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setStatus('Accepted Risk');
                toast.info('Finding accepted as risk. Documented in audit log.');
              }}
            >
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Accept Risk
            </Button>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Details */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{finding.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Business Risk
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{finding.businessRisk}</p>
                <div className="mt-3">
                  <ImpactBadge impact={finding.businessImpact} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Evidence
                </CardTitle>
                <CardDescription>Mock AWS evidence collected during assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs font-mono bg-muted/50 rounded-lg p-4 border border-border whitespace-pre-wrap leading-relaxed">
                  {finding.evidence}
                </pre>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{finding.recommendation}</p>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments
                  <Badge variant="secondary">{comments.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No comments yet. Be the first to add one.
                  </p>
                )}
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0">
                      {c.author.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{c.author}</span>
                        <span className="text-xs text-muted-foreground">{relativeTime(c.createdAt)}</span>
                      </div>
                      <p className="text-sm mt-1 leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Textarea
                    placeholder="Add a comment…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[60px] resize-none"
                  />
                  <Button size="icon" onClick={handleAddComment} disabled={!commentText.trim()} className="self-end">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Sidebar */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Finding Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Finding ID</span>
                  <span className="font-mono font-medium">{finding.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Severity</span>
                  <SeverityBadge severity={severity} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <StatusBadge status={status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{finding.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account</span>
                  <Link href={`/accounts/${finding.accountId}`} className="font-medium hover:text-primary">
                    {finding.accountName}
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Environment</span>
                  <span className="font-medium">{finding.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resource</span>
                  <span className="font-mono text-xs font-medium">{finding.resource}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner</span>
                  <span className="font-medium">{finding.owner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className="font-medium">{formatDate(finding.dueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{formatDate(finding.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Business Impact</span>
                </div>
                <div><ImpactBadge impact={finding.businessImpact} /></div>
              </CardContent>
            </Card>

            {/* Remediation progress */}
            {finding.remediationStage && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Remediation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stage</span>
                    <span className="font-medium">{finding.remediationStage}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{finding.remediationProgress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-700"
                        style={{ width: `${finding.remediationProgress}%` }}
                      />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/remediation">
                      View on Remediation Board
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Activity timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                  <div className="relative flex gap-3">
                    <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary shrink-0 z-10 mt-1.5 ring-4 ring-card" />
                    <div>
                      <p className="text-sm font-medium">Finding created</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(finding.createdAt)}</p>
                    </div>
                  </div>
                  {relatedAudit.map((log) => (
                    <div key={log.id} className="relative flex gap-3">
                      <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-500 shrink-0 z-10 mt-1.5 ring-4 ring-card" />
                      <div>
                        <p className="text-sm font-medium">
                          {log.user} {log.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.previousValue && `from ${log.previousValue} `}
                          {log.newValue && `to ${log.newValue} · `}
                          {relativeTime(log.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {comments.map((c) => (
                    <div key={c.id} className="relative flex gap-3">
                      <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-purple-500 shrink-0 z-10 mt-1.5 ring-4 ring-card" />
                      <div>
                        <p className="text-sm font-medium">{c.author} commented</p>
                        <p className="text-xs text-muted-foreground">{relativeTime(c.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
