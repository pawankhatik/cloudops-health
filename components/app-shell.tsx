'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cloud,
  ClipboardCheck,
  AlertTriangle,
  ShieldCheck,
  Wrench,
  Zap,
  FileText,
  History,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  X,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useApp } from './app-provider';
import { CommandPalette } from './command-palette';
import { NotificationPanel } from './notification-panel';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth-provider';
import { apiFetch } from '@/lib/api-client';
import { toast } from 'sonner';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'AWS Accounts', href: '/accounts', icon: Cloud },
  { label: 'Assessments', href: '/assessments', icon: ClipboardCheck },
  { label: 'Findings', href: '/findings', icon: AlertTriangle },
  { label: 'Controls', href: '/controls', icon: ShieldCheck },
  { label: 'Remediation', href: '/remediation', icon: Wrench },
  { label: 'Automation', href: '/automation', icon: Zap },
  { label: 'Reports', href: '/reports', icon: FileText },
  { label: 'Audit Log', href: '/audit-log', icon: History },
  { label: 'Settings', href: '/settings', icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {navItems.map((item) => {
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-sidebar-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function DemoBanner() {
  const { resetDemoData } = useApp();
  return (
    <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-2.5">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="flex h-2 w-2 shrink-0 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-xs font-medium text-sidebar-muted-foreground truncate">
          Demo Data — AWS not connected
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-xs text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
        onClick={() => {
          resetDemoData();
          toast.success('Demo data has been reset.');
        }}
      >
        Reset
      </Button>
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-9 w-9" />;
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function ViewModeToggle() {
  const { viewMode, setViewMode } = useApp();
  return (
    <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
      <button
        className={cn(
          'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
          viewMode === 'engineering'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => setViewMode('engineering')}
      >
        Engineering
      </button>
      <button
        className={cn(
          'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
          viewMode === 'executive'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => setViewMode('executive')}
      >
        Executive
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifList, setNotifList] = useState<Array<{ id: string; title: string; message: string; read: boolean; type: string; created_at: string }>>([]);

  React.useEffect(() => {
    if (!user) return;
    apiFetch('/api/notifications').then((data) => {
      setNotifList(data || []);
      setUnreadCount((data || []).filter((n: { read: boolean }) => !n.read).length);
    }).catch(() => {});
  }, [user]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col sidebar-bg shrink-0">
        <div className="flex h-14 items-center gap-2.5 px-5 border-b border-sidebar-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Activity className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground leading-tight">
              CloudOps Health
            </span>
            <span className="text-[10px] text-sidebar-muted-foreground leading-tight">
              AWS Platform Monitoring
            </span>
          </div>
        </div>
        <DemoBanner />
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <SidebarContent />
        </div>
        <div className="border-t border-sidebar-border px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-sidebar-muted-foreground">
            <span className="flex h-1.5 w-1.5 rounded-full bg-success" />
            <span>All systems operational</span>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative flex w-64 flex-col sidebar-bg animate-fade-in">
            <div className="flex h-14 items-center justify-between px-5 border-b border-sidebar-border">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Activity className="h-4.5 w-4.5" />
                </div>
                <span className="text-sm font-semibold text-sidebar-foreground">
                  CloudOps Health
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DemoBanner />
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top nav */}
        <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4 lg:px-6 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search trigger */}
          <button
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 w-full max-w-md rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:border-input hover:bg-background transition-colors"
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search findings, accounts, controls…</span>
            <kbd className="hidden sm:flex items-center gap-0.5 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
          </button>

          <div className="flex-1" />

          <div className="hidden md:block">
            <ViewModeToggle />
          </div>

          <ThemeToggle />

          {/* Notifications */}
          <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-destructive" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <NotificationPanel onOpenChange={setNotifOpen} />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Account selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden sm:flex items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-sm hover:bg-muted/50 transition-colors">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary">
                  CO
                </span>
                <span className="font-medium">CloudOps Platform</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Organizations</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                CloudOps Platform
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 opacity-50">
                <Cloud className="h-4 w-4" />
                Add Organization (Phase 2)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-lg hover:bg-muted/50 transition-colors p-1 pr-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {user?.name?.split(' ').map((n) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium">
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{user?.name || 'Unknown'}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {user?.email || ''}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <span className="text-xs text-muted-foreground">Role:</span>
                <Badge variant="secondary" className="text-xs">
                  {user?.role?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) || 'Viewer'}
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Link href="/settings" className="block">
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 cursor-pointer text-destructive"
                onClick={async () => {
                  await signOut();
                  window.location.href = '/login';
                }}
              >
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="animate-content-in">{children}</div>
        </main>
      </div>

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  );
}
