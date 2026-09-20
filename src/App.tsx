import { useState, useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  University,
  Calendar,
  Target,
  FileText,
  FolderOpen,
  Download,
  Upload,
  AlarmClock,
  Menu,
  Key,
  CloudUpload,
  RefreshCw,
  Bell,
  BellRing,
  Laptop,
  Layers,
  Flame,
  MoreHorizontal,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import Dashboard from "@/pages/Dashboard";
import Universities from "@/pages/Universities";
import CalendarPage from "@/pages/Calendar";
import Goals from "@/pages/Goals";
import DrillTracker from "@/pages/DrillTracker";
import CVEditor from "@/pages/CVEditor";
import Documents from "@/pages/Documents";
import Reminders from "@/pages/Reminders";
import DesktopWidget from "@/pages/DesktopWidget";
import NotFound from "@/pages/not-found";
import { syncAllToCloud, restoreDefaultSeeds, getGoals, getOfflineQueueCount } from "@/store/data";
import type { Goal } from "@/types";

const queryClient = new QueryClient();

const LS_KEYS = ["beasiswa_universities", "beasiswa_goals", "beasiswa_cv", "beasiswa_documents", "beasiswa_reminders", "beasiswa_weekly_drills"] as const;

// Grouped so nine destinations read as three decisions, not one long list.
const navGroups = [
  {
    label: "Applications",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard },
      { path: "/universities", label: "Universities", icon: University },
      { path: "/berkas", label: "Berkas", icon: FolderOpen },
      { path: "/cv-editor", label: "CV Editor", icon: FileText },
    ],
  },
  {
    label: "Schedule",
    items: [
      { path: "/calendar", label: "Calendar", icon: Calendar },
      { path: "/reminders", label: "Reminders", icon: AlarmClock },
    ],
  },
  {
    label: "Preparation",
    items: [
      { path: "/goals", label: "Goals", icon: Target },
      { path: "/drills", label: "Drill Tracker", icon: Flame },
      { path: "/widget", label: "Desktop Widget", icon: Layers },
    ],
  },
];

function openWidgetWindow(fallback: () => void) {
  const win = window.open("/widget", "BeasiswaMacWidget", "width=380,height=600,top=100,left=100,resizable=yes,scrollbars=yes");
  if (!win || win.closed || typeof win.closed === "undefined") fallback();
}

/**
 * Everything that is app plumbing rather than navigation lives behind one
 * menu. Previously nine always-visible buttons in five accent colours took
 * more vertical space in the sidebar than the nav itself.
 */
function SidebarFooter({ onOpenAuth, onOpenMacInstall }: { onOpenAuth: () => void; onOpenMacInstall: () => void }) {
  const importRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [notifGranted, setNotifGranted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      setQueueCount(getOfflineQueueCount());

      const handleOn = () => {
        setIsOnline(true);
        toast({ title: "Back online", description: "Syncing queued changes to Supabase." });
      };
      const handleOff = () => {
        setIsOnline(false);
        toast({ title: "Offline", description: "Changes are saved locally and queued for sync." });
      };
      const handleQueue = () => {
        setQueueCount(getOfflineQueueCount());
      };
      const handlePrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      const handleMigrated = () => {
        toast({
          title: "Jadwal & target diperbarui",
          description: "Target aktif screenshot & jadwal harian SAT/TIMO telah dimuat.",
        });
      };

      window.addEventListener("online", handleOn);
      window.addEventListener("offline", handleOff);
      window.addEventListener("offline-queue-updated", handleQueue);
      window.addEventListener("beforeinstallprompt", handlePrompt);
      window.addEventListener("app-data-migrated", handleMigrated);

      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  toast({
                    title: "Update available",
                    description: "Open the sidebar menu and choose Check for updates to load it.",
                  });
                }
              });
            }
          });
        });
      }

      if ("Notification" in window) {
        setNotifGranted(Notification.permission === "granted");
      }

      return () => {
        window.removeEventListener("online", handleOn);
        window.removeEventListener("offline", handleOff);
        window.removeEventListener("offline-queue-updated", handleQueue);
        window.removeEventListener("beforeinstallprompt", handlePrompt);
        window.removeEventListener("app-data-migrated", handleMigrated);
      };
    }
  }, [toast]);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === "accepted") {
          toast({ title: "App installed", description: "Beasiswa Tracker is now on your Mac." });
        }
        setDeferredPrompt(null);
      });
    } else {
      onOpenMacInstall();
    }
  };

  async function handleEnableNotif() {
    if (!("Notification" in window)) {
      toast({ title: "Not supported", description: "This browser does not support system notifications.", variant: "destructive" });
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setNotifGranted(true);
      new Notification("Beasiswa Tracker", {
        body: "Notifications are on. You'll get a daily nudge for active targets.",
        icon: "/uoft-logo.png",
        silent: true,
      });
      toast({ title: "Notifications on", description: "Daily reminders enabled." });
    } else {
      toast({ title: "Permission denied", description: "Allow notifications in browser settings.", variant: "destructive" });
    }
  }

  async function handleCloudSync() {
    toast({ title: "Syncing…", description: "Uploading local data to Supabase." });
    await syncAllToCloud();
    toast({ title: "Sync complete", description: "All local data saved to the cloud." });
  }

  async function handleResetSample() {
    if (confirm("Restore initial sample data? Your local data will be reset to default seeds.")) {
      await restoreDefaultSeeds();
      toast({ title: "Sample data restored", description: "Reloading…" });
      setTimeout(() => window.location.reload(), 1000);
    }
  }

  function handleExport() {
    const backup: Record<string, unknown> = {
      _version: 1,
      _exportedAt: new Date().toISOString(),
    };
    for (const key of LS_KEYS) {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          backup[key] = JSON.parse(raw);
        } catch {
          backup[key] = raw;
        }
      }
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    const link = document.createElement("a");
    link.href = url;
    link.download = `beasiswa-backup-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Backup exported", description: `beasiswa-backup-${date}.json` });
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!importRef.current) return;
    importRef.current.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as Record<string, unknown>;
        let restored = 0;
        for (const key of LS_KEYS) {
          if (key in data) {
            localStorage.setItem(key, JSON.stringify(data[key]));
            restored++;
          }
        }
        if (restored === 0) {
          toast({ title: "Invalid file", description: "No valid backup data found.", variant: "destructive" });
          return;
        }
        toast({ title: "Data restored", description: `${restored} categories loaded. Reloading…` });
        setTimeout(() => window.location.reload(), 1200);
      } catch {
        toast({ title: "Could not read file", description: "Make sure it is a valid JSON backup.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  }

  const handleForceUpdateApp = async () => {
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        await reg.unregister();
      }
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      for (const k of keys) {
        await caches.delete(k);
      }
    }
    toast({ title: "Updating", description: "Cleared cache, reloading latest deployment…" });
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const [, setLocation] = useLocation();

  return (
    <div className="border-t border-sidebar-border px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            aria-hidden
            className={cn("size-1.5 rounded-full shrink-0", isOnline ? "bg-ok" : "bg-soon")}
          />
          <span className="text-xs text-sidebar-foreground/60 truncate">
            {isOnline ? "Synced" : `Offline · ${queueCount} queued`}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              data-testid="btn-sidebar-menu"
              aria-label="App settings and data"
              className="shrink-0 rounded-sm p-1.5 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-white/10 transition-colors"
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel className="eyebrow">Widget</DropdownMenuLabel>
            <DropdownMenuItem data-testid="btn-open-widget" onSelect={() => openWidgetWindow(() => setLocation("/widget"))}>
              <Layers className="size-4" /> Pop out desktop widget
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="eyebrow">Data</DropdownMenuLabel>
            <DropdownMenuItem data-testid="btn-cloud-sync" onSelect={handleCloudSync}>
              <CloudUpload className="size-4" /> Sync to Supabase
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="btn-export-data" onSelect={handleExport}>
              <Download className="size-4" /> Export backup
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="btn-import-data" onSelect={() => importRef.current?.click()}>
              <Upload className="size-4" /> Import backup
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="btn-open-auth" onSelect={onOpenAuth}>
              <Key className="size-4" /> Database password
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="eyebrow">App</DropdownMenuLabel>
            <DropdownMenuItem data-testid="btn-enable-notif" onSelect={handleEnableNotif}>
              {notifGranted ? <BellRing className="size-4" /> : <Bell className="size-4" />}
              {notifGranted ? "Notifications on" : "Enable notifications"}
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="btn-mac-install" onSelect={handleInstallClick}>
              <Laptop className="size-4" /> Install as Mac app
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="btn-force-update" onSelect={handleForceUpdateApp}>
              <RefreshCw className="size-4" /> Check for updates
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              data-testid="btn-restore-sample"
              onSelect={handleResetSample}
              className="text-destructive focus:text-destructive"
            >
              <RefreshCw className="size-4" /> Restore sample data
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <input
        ref={importRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleImport}
        data-testid="input-import-file"
      />
    </div>
  );
}

function NavLinks() {
  const [location] = useLocation();
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="eyebrow px-2 mb-1.5 text-sidebar-foreground/40">{group.label}</p>
          {group.items.map(({ path, label, icon: Icon }) => {
            const isActive = path === "/" ? location === "/" : location.startsWith(path);
            return (
              <Link key={path} href={path}>
                <div
                  data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-sm cursor-pointer transition-colors",
                    isActive
                      ? "bg-white/10 text-sidebar-foreground font-medium"
                      : "text-sidebar-foreground/65 hover:text-sidebar-foreground hover:bg-white/5"
                  )}
                >
                  {/* Active state reads as a margin rule, not a filled pill. */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full transition-colors",
                      isActive ? "bg-sidebar-foreground/70" : "bg-transparent"
                    )}
                  />
                  <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                  {label}
                </div>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function SidebarBrand() {
  return (
    <div className="px-4 py-4 border-b border-sidebar-border">
      <span className="block text-sm font-medium tracking-tight text-sidebar-foreground">Beasiswa Tracker</span>
      <span className="block text-2xs tracking-[0.08em] uppercase text-sidebar-foreground/40 mt-0.5">
        Admission 2026/27
      </span>
    </div>
  );
}

function Sidebar({ onOpenAuth, onOpenMacInstall }: { onOpenAuth: () => void; onOpenMacInstall: () => void }) {
  return (
    <aside className="hidden md:flex flex-col w-56 bg-sidebar text-sidebar-foreground shrink-0 border-r border-sidebar-border h-screen sticky top-0">
      <SidebarBrand />
      <NavLinks />
      <SidebarFooter onOpenAuth={onOpenAuth} onOpenMacInstall={onOpenMacInstall} />
    </aside>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/universities" component={Universities} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/goals" component={Goals} />
      <Route path="/drills" component={DrillTracker} />
      <Route path="/berkas" component={Documents} />
      <Route path="/cv-editor" component={CVEditor} />
      <Route path="/reminders" component={Reminders} />
      <Route path="/widget" component={DesktopWidget} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [macInstallOpen, setMacInstallOpen] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const handler = () => setAuthOpen(true);
    window.addEventListener("auth-error", handler);
    return () => window.removeEventListener("auth-error", handler);
  }, []);

  // Daily Continuous Task Notification Checker
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      const todayStr = new Date().toISOString().slice(0, 10);
      const notifKey = `daily_notif_sent_${todayStr}`;

      if (!localStorage.getItem(notifKey)) {
        getGoals().then((goals) => {
          const activeContinuous = (goals as Goal[]).filter((g) => {
            if (g.completed) return false;
            const start = g.startDate ? g.startDate.slice(0, 10) : g.deadline?.slice(0, 10);
            const end = g.deadline ? g.deadline.slice(0, 10) : start;
            return start && end && start <= todayStr && todayStr <= end;
          });

          if (activeContinuous.length > 0) {
            const first = activeContinuous[0];
            new Notification("Active today", {
              body: `${first.title} is active today.`,
              icon: "/uoft-logo.png",
              silent: true,
            });
            localStorage.setItem(notifKey, "true");
          }
        });
      }
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem("app_password", password);
    setAuthOpen(false);
    window.location.reload();
  };

  const openAuth = () => setAuthOpen(true);
  const openMacInstall = () => setMacInstallOpen(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="flex flex-col md:flex-row min-h-screen bg-background">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-sidebar text-sidebar-foreground">
              <span className="text-sm font-medium tracking-tight">Beasiswa Tracker</span>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-white/10">
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground border-r-sidebar-border">
                  <div className="flex flex-col h-full">
                    <SidebarBrand />
                    <NavLinks />
                    <SidebarFooter onOpenAuth={openAuth} onOpenMacInstall={openMacInstall} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Sidebar onOpenAuth={openAuth} onOpenMacInstall={openMacInstall} />
            <main className="flex-1 min-w-0 overflow-y-auto min-h-0 md:min-h-screen">
              <Router />
            </main>
          </div>
        </WouterRouter>
        <Toaster />

        {/* Database Auth Dialog */}
        <Dialog open={authOpen} onOpenChange={setAuthOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Authentication required</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-1">
              <p className="text-sm text-muted-foreground">Enter the application password to access the database.</p>
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
              <Button onClick={handleLogin} className="w-full">Log in</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Mac Desktop App Installation Modal */}
        <Dialog open={macInstallOpen} onOpenChange={setMacInstallOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Install as a Mac app</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-1">
              <ol className="space-y-3 text-sm">
                <li className="grid grid-cols-[auto_1fr] gap-3">
                  <span className="font-mono text-xs text-muted-foreground pt-0.5">01</span>
                  <span>
                    <span className="font-medium block">Safari</span>
                    <span className="text-muted-foreground">File → Add to Dock…</span>
                  </span>
                </li>
                <li className="grid grid-cols-[auto_1fr] gap-3">
                  <span className="font-mono text-xs text-muted-foreground pt-0.5">02</span>
                  <span>
                    <span className="font-medium block">Chrome or Brave</span>
                    <span className="text-muted-foreground">Install icon in the address bar, or ⋮ → Save and Share → Install.</span>
                  </span>
                </li>
              </ol>

              <div className="border-t pt-3 space-y-1 text-xs text-muted-foreground">
                <p>Works offline, syncs to Supabase when back online, and sends native notifications.</p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={() => setMacInstallOpen(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
