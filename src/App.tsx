import { useState, useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GraduationCap, LayoutDashboard, University, Calendar, Target, FileText, FolderOpen, Download, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Dashboard from "@/pages/Dashboard";
import Universities from "@/pages/Universities";
import CalendarPage from "@/pages/Calendar";
import Goals from "@/pages/Goals";
import CVEditor from "@/pages/CVEditor";
import Documents from "@/pages/Documents";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

const LS_KEYS = ["beasiswa_universities", "beasiswa_goals", "beasiswa_cv", "beasiswa_documents"] as const;

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/universities", label: "Universities", icon: University },
  { path: "/calendar", label: "Calendar", icon: Calendar },
  { path: "/goals", label: "Goals", icon: Target },
  { path: "/berkas", label: "Berkas", icon: FolderOpen },
  { path: "/cv-editor", label: "CV Editor", icon: FileText },
];

function DataActions() {
  const importRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    toast({ title: "Backup berhasil diunduh", description: `beasiswa-backup-${date}.json` });
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
          toast({ title: "File tidak valid", description: "Tidak ada data yang bisa dipulihkan.", variant: "destructive" });
          return;
        }
        toast({ title: "Data berhasil dipulihkan", description: `${restored} kategori dimuat. Halaman akan di-refresh.` });
        setTimeout(() => window.location.reload(), 1200);
      } catch {
        toast({ title: "Gagal membaca file", description: "Pastikan file adalah backup JSON yang valid.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="px-2 pb-4 border-t border-sidebar-border pt-3">
      <p className="text-xs text-sidebar-foreground/50 uppercase tracking-wider px-2 mb-2">Data</p>
      <button
        onClick={handleExport}
        data-testid="btn-export-data"
        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm w-full text-sidebar-foreground/80 hover:bg-white/10 transition-colors mb-0.5"
      >
        <Download className="w-4 h-4 shrink-0" />
        Export Backup
      </button>
      <button
        onClick={() => importRef.current?.click()}
        data-testid="btn-import-data"
        className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm w-full text-sidebar-foreground/80 hover:bg-white/10 transition-colors"
      >
        <Upload className="w-4 h-4 shrink-0" />
        Import Backup
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

function Sidebar() {
  const [location] = useLocation();
  return (
    <aside className="w-52 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col shrink-0 border-r border-sidebar-border">
      <div className="px-4 py-5 flex items-center gap-2 border-b border-sidebar-border">
        <GraduationCap className="w-5 h-5 shrink-0" />
        <span className="font-semibold text-sm">Beasiswa Tracker</span>
      </div>
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
      <DataActions />
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const handler = () => setAuthOpen(true);
    window.addEventListener('auth-error', handler);
    return () => window.removeEventListener('auth-error', handler);
  }, []);

  const handleLogin = () => {
    localStorage.setItem("app_password", password);
    setAuthOpen(false);
    window.location.reload();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto min-h-screen">
              <Router />
            </main>
          </div>
        </WouterRouter>
        <Toaster />

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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
