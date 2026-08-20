'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Cloud, Plus, ArrowRight, MapPin, Activity } from 'lucide-react';
import { PageHeader, PageContainer } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HealthScoreBadge } from '@/components/badges';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { accounts } from '@/lib/mock-data';
import { cn, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function AccountsPage() {
  const [connectOpen, setConnectOpen] = useState(false);

  return (
    <PageContainer>
      <div className="flex flex-col gap-6">
        <PageHeader
          title="AWS Accounts"
          subtitle="Connected AWS accounts across your organization. Health scores, findings, and assessment status at a glance."
          actions={
            <Button onClick={() => setConnectOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Connect AWS Account
            </Button>
          }
        />

        {/* Account cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <Link key={account.id} href={`/accounts/${account.id}`}>
              <Card className="hover:border-input hover:shadow-sm transition-all cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Cloud className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold leading-tight">{account.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {account.accountId}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      {account.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Environment</p>
                      <p className="font-medium mt-0.5">{account.environment}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Health</p>
                      <div className="mt-0.5">
                        <HealthScoreBadge score={account.healthScore} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Findings</p>
                      <p className="font-medium mt-0.5">{account.findingsCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Resources</p>
                      <p className="font-medium mt-0.5">{account.resourcesCount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {account.regions.join(', ')}
                    </span>
                    <span className="flex-1" />
                    <span className="text-xs text-muted-foreground">
                      Last: {formatDate(account.lastAssessment)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Summary table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Account</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Environment</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Region</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Health</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Findings</th>
                    <th className="text-left font-medium text-xs text-muted-foreground uppercase tracking-wide px-4 py-3">Status</th>
                    <th className="w-10 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((a) => (
                    <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/accounts/${a.id}`} className="font-medium hover:text-primary">
                          {a.name}
                        </Link>
                        <p className="text-xs text-muted-foreground font-mono">{a.accountId}</p>
                      </td>
                      <td className="px-4 py-3">{a.environment}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.regions.join(', ')}</td>
                      <td className="px-4 py-3"><HealthScoreBadge score={a.healthScore} /></td>
                      <td className="px-4 py-3">{a.findingsCount}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-success" />
                          {a.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/accounts/${a.id}`}>
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
      </div>

      <ConnectAccountDialog open={connectOpen} onOpenChange={setConnectOpen} />
    </PageContainer>
  );
}

function ConnectAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect AWS Account</DialogTitle>
          <DialogDescription>
            AWS account integration will be available in Phase 2.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
              Phase 2 Feature — Not yet available
            </p>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Future AWS integration will use secure cross-account IAM roles with temporary
              credentials via AWS STS AssumeRole. This approach follows AWS security best
              practices and eliminates the need for long-lived access keys.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">How it will work:</p>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
              <li>Create an IAM role in your AWS account with a trust policy allowing CloudOps Health</li>
              <li>CloudOps Health assumes the role using temporary credentials (STS)</li>
              <li>No access keys are ever stored or requested</li>
              <li>Permissions follow least-privilege principles</li>
              <li>All access is audited via CloudTrail</li>
            </ul>
          </div>
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              CloudOps Health will never ask you to paste permanent AWS access keys. The
              integration is designed around temporary, scoped credentials only.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              toast.info('AWS account integration is planned for Phase 2.');
            }}
          >
            Notify me when ready
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
