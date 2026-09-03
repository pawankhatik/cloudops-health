'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertCircle,
  Bell,
} from 'lucide-react';
import { relativeTime, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiFetch } from '@/lib/api-client';

const iconMap: Record<string, typeof Info> = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
  success: CheckCircle2,
};

const colorMap: Record<string, string> = {
  critical: 'text-destructive bg-destructive/10',
  warning: 'text-amber-500 bg-amber-500/10',
  info: 'text-blue-500 bg-blue-500/10',
  success: 'text-success bg-success/10',
};

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: string;
  created_at: string;
}

interface NotificationPanelProps {
  onOpenChange?: (open: boolean) => void;
}

export function NotificationPanel({ onOpenChange }: NotificationPanelProps) {
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    apiFetch('/api/notifications').then((data) => setItems(data || [])).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span className="text-sm font-semibold">Notifications</span>
          <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-medium text-destructive-foreground">
            {items.filter((n) => !n.read).length} new
          </span>
        </div>
      </div>
      <ScrollArea className="h-[340px]">
        <div className="flex flex-col">
          {items.map((n) => {
            const Icon = iconMap[n.type] || Info;
            return (
              <Link
                key={n.id}
                href="/findings"
                onClick={() => onOpenChange?.(false)}
                className="flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
              >
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', colorMap[n.type] || colorMap.info)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium leading-tight">{n.title}</span>
                  <span className="text-xs text-muted-foreground mt-0.5 leading-tight">
                    {n.message}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {relativeTime(n.created_at)}
                  </span>
                </div>
                {!n.read && (
                  <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
              </Link>
            );
          })}
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">No notifications.</p>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t border-border p-2">
        <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
          <Link href="/findings" onClick={() => onOpenChange?.(false)}>
            View all findings
          </Link>
        </Button>
      </div>
    </div>
  );
}
