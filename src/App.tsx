import { useState, useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { 
  GraduationCap, 
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
  Smartphone,
  Laptop,
  Wifi,
  WifiOff
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import Dashboard from "@/pages/Dashboard";
import Universities from "@/pages/Universities";
import CalendarPage from "@/pages/Calendar";
import Goals from "@/pages/Goals";
import CVEditor from "@/pages/CVEditor";
import Documents from "@/pages/Documents";
import Reminders from "@/pages/Reminders";
import NotFound from "@/pages/not-found";
import { syncAllToCloud, restoreDefaultSeeds, getGoals } from "@/store/data";
import type { Goal } from "@/types";

const queryClient = new QueryClient();

const LS_KEYS = ["beasiswa_universities", "beasiswa_goals", "beasiswa_cv", "beasiswa_documents", "beasiswa_reminders"] as const;

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/universities", label: "Universities", icon: University },
  { path: "/calendar", label: "Calendar", icon: Calendar },
  { path: "/goals", label: "Goals", icon: Target },
  { path: "/berkas", label: "Berkas", icon: FolderOpen },
  { path: "/cv-editor", label: "CV Editor", icon: FileText },
  { path: "/reminders", label: "Reminders", icon: AlarmClock },
];

function DataActions({ onOpenAuth, onOpenMacInstall }: { onOpenAuth: () => void; onOpenMacInstall: () => void }) {
  const importRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [notifGranted, setNotifGranted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
      const handleOn = () => {
        setIsOnline(true);
        toast({ title: "Connected Online", description: "Network restored. Auto-syncing offline data to Supabase." });
      };
      const handleOff = () => {
        setIsOnline(false);
        toast({ title: "Offline Mode", description: "Changes will be saved locally and synced when back online." });
      };
      window.addEventListener("online", handleOn);
      window.addEventListener("offline", handleOff);

      if ("Notification" in window) {
        setNotifGranted(Notification.permission === "granted");
      }

      return () => {
        window.removeEventListener("online", handleOn);
        window.removeEventListener("offline", handleOff);
      };
    }
  }, [toast]);

  async function handleEnableNotif() {
    if (!("Notification" in window)) {
      toast({ title: "Not Supported", description: "This browser does not support system notifications.", variant: "destructive" });
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setNotifGranted(true);
      new Notification("Beasiswa Tracker", {
        body: "System notifications are active. Daily tasks & deadlines will alert you natively.",
        icon: "/favicon.svg"
      });
      toast({ title: "Notifications Active", description: "Native daily reminders enabled." });
    } else {
      toast({ title: "Permission Denied", description: "Allow notifications in browser settings.", variant: "destructive" });
    }
  }

  async function handleCloudSync() {
    toast({ title: "Syncing to Cloud...", description: "Uploading local data to Supabase database." });
    await syncAllToCloud();
    toast({ title: "Cloud Sync Complete", description: "All local data saved to Supabase cloud." });
  }

  async function handleResetSample() {
    if (confirm("Restore initial sample data? Your local data will be reset to default seeds.")) {
      await restoreDefaultSeeds();
      toast({ title: "Sample Data Restored", description: "Reloading page..." });
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
    toast({ title: "Backup Exported", description: `beasiswa-backup-${date}.json` });
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
          toast({ title: "Invalid File", description: "No valid backup data found.", variant: "destructive" });
          return;
        }
        toast({ title: "Data Restored", description: `${restored} categories loaded. Reloading...` });
        setTimeout(() => window.location.reload(), 1200);
      } catch {
        toast({ title: "Failed to read file", description: "Ensure valid JSON backup file.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="px-2 pb-4 border-t border-sidebar-border pt-3 space-y-0.5">
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider font-bold">App Status</span>
        <Badge variant="outline" className={cn("text-[10px] py-0 px-1.5 font-mono font-semibold",
          isOnline ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-amber-500/15 text-amber-300 border-amber-500/30"
        )}>
          {isOnline ? (
            <span className="flex items-center gap-1"><Wifi className="w-2.5 h-2.5" /> Online (Supabase)</span>
          ) : (
            <span className="flex items-center gap-1"><WifiOff className="w-2.5 h-2.5" /> Offline (Local)</span>
          )}
        </Badge>
      </div>
      
      <button
        onClick={onOpenMacInstall}
        data-testid="btn-mac-install"
        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm w-full text-sidebar-foreground/80 hover:bg-white/10 transition-colors"
      >
        <Laptop className="w-4 h-4 shrink-0 text-sky-400" />
        Install Mac Desktop App
      </button>

      <button
        onClick={handleEnableNotif}
        data-testid="btn-enable-notif"
        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm w-full text-sidebar-foreground/80 hover:bg-white/10 transition-colors"
      >
        {notifGranted ? (
          <BellRing className="w-4 h-4 shrink-0 text-emerald-400" />
        ) : (
          <Bell className="w-4 h-4 shrink-0 text-indigo-400" />
        )}
        {notifGranted ? "Notifications Active" : "Enable Notifications"}
      </button>

      <button
        onClick={onOpenAuth}
        data-testid="btn-open-auth"
        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm w-full text-sidebar-foreground/80 hover:bg-white/10 transition-colors"
      >
        <Key className="w-4 h-4 shrink-0 text-amber-400" />
        Set Database Password
      </button>

      <button
        onClick={handleCloudSync}
        data-testid="btn-cloud-sync"
        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm w-full text-sidebar-foreground/80 hover:bg-white/10 transition-colors"
      >
        <CloudUpload className="w-4 h-4 shrink-0 text-purple-400" />
        Sync to Supabase
      </button>

      <button
        onClick={handleExport}
        data-testid="btn-export-data"
        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm w-full text-sidebar-foreground/80 hover:bg-white/10 transition-colors mb-0.5"
      >
        <Download className="w-4 h-4 shrink-0" />
        Export Backup JSON
      </button>
      <button
        onClick={() => importRef.current?.click()}
        data-testid="btn-import-data"
        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm w-full text-sidebar-foreground/80 hover:bg-white/10 transition-colors"
      >
        <Upload className="w-4 h-4 shrink-0" />
        Import Backup JSON
      </button>
      <button
        onClick={handleResetSample}
        data-testid="btn-restore-sample"
        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs w-full text-sidebar-foreground/60 hover:bg-white/10 transition-colors pt-2 border-t border-sidebar-border/40 mt-1"
      >
        <RefreshCw className="w-3.5 h-3.5 shrink-0" />
        Restore Sample Data
      </button>
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
    <nav className="flex-1 px-2 pt-4">
      <p className="text-xs text-sidebar-foreground/50 uppercase tracking-wider px-2 mb-2">Menu</p>
      {navItems.map(({ path, label, icon: Icon }) => {
        const isActive = path === "/" ? location === "/" : location.startsWith(path);
        return (
          <Link key={path} href={path}>
            <div
              data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm mb-0.5 cursor-pointer transition-colors",
                isActive
                  ? "bg-white/15 text-white font-medium"
                  : "hover:bg-white/10 text-sidebar-foreground/80"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

function Sidebar({ onOpenAuth, onOpenMacInstall }: { onOpenAuth: () => void; onOpenMacInstall: () => void }) {
  return (
    <aside className="hidden md:flex flex-col w-52 bg-sidebar text-sidebar-foreground shrink-0 border-r border-sidebar-border min-h-screen sticky top-0">
      <div className="px-4 py-5 flex items-center gap-2 border-b border-sidebar-border">
        <GraduationCap className="w-5 h-5 shrink-0" />
        <span className="font-semibold text-sm">Beasiswa Tracker</span>
      </div>
      <NavLinks />
      <DataActions onOpenAuth={onOpenAuth} onOpenMacInstall={onOpenMacInstall} />
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
      <Route path="/berkas" component={Documents} />
      <Route path="/cv-editor" component={CVEditor} />
      <Route path="/reminders" component={Reminders} />
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
    window.addEventListener('auth-error', handler);
    return () => window.removeEventListener('auth-error', handler);
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
            new Notification("Daily Task Reminder", {
              body: `${first.title} is active today! (${activeContinuous.length} continuous tasks in progress)`,
              icon: "/favicon.svg",
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
            <div className="md:hidden flex items-center justify-between p-4 border-b bg-sidebar text-sidebar-foreground">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                <span className="font-semibold text-sm">Beasiswa Tracker</span>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-white/10">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground border-r-sidebar-border">
                  <div className="flex flex-col h-full">
                    <div className="px-4 py-5 flex items-center gap-2 border-b border-sidebar-border">
                      <GraduationCap className="w-5 h-5 shrink-0" />
                      <span className="font-semibold text-sm">Beasiswa Tracker</span>
                    </div>
                    <NavLinks />
                    <DataActions onOpenAuth={openAuth} onOpenMacInstall={openMacInstall} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Sidebar onOpenAuth={openAuth} onOpenMacInstall={openMacInstall} />
            <main className="flex-1 overflow-y-auto min-h-0 md:min-h-screen">
              <Router />
            </main>
          </div>
        </WouterRouter>
        <Toaster />

        {/* Database Auth Dialog */}
        <Dialog open={authOpen} onOpenChange={setAuthOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Authentication Required</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">Please enter the application password to access the database.</p>
              <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
              <Button onClick={handleLogin} className="w-full">Login</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Mac Desktop App Installation Modal */}
        <Dialog open={macInstallOpen} onOpenChange={setMacInstallOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Laptop className="w-5 h-5 text-sky-500" />
                Install Desktop App on macOS
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 text-sm">
              <p className="text-xs text-muted-foreground">
                You can install <strong>Beasiswa Tracker</strong> as a native Mac app directly on your Dock and Launchpad!
              </p>

              <div className="space-y-3 bg-muted/40 p-3 rounded-lg border border-border text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-foreground block">Option 1: Safari (macOS Sonoma / Sequoia)</span>
                  <p className="text-muted-foreground">
                    1. Click <strong>File</strong> in the top macOS menu bar.<br />
                    2. Click <strong>Add to Dock...</strong><br />
                    3. Launch directly from your macOS Dock or Launchpad!
                  </p>
                </div>

                <div className="space-y-1 border-t pt-2">
                  <span className="font-bold text-foreground block">Option 2: Google Chrome / Brave</span>
                  <p className="text-muted-foreground">
                    1. Look at the right side of the address bar for the <strong>Install Icon (⤓)</strong>.<br />
                    2. Or click the <strong>⋮ Menu</strong> -&gt; <strong>Save and Share</strong> -&gt; <strong>Install Beasiswa Tracker</strong>.
                  </p>
                </div>
              </div>

              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 p-2.5 rounded border border-emerald-500/20">
                ✓ Full offline support (works without internet)<br />
                ✓ Auto-syncs to Supabase whenever online<br />
                ✓ Native macOS desktop notifications
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
