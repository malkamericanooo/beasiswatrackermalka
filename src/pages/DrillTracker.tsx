import { useState, useEffect, useRef, useCallback } from "react";
import { getWeeklyDrills, saveWeeklyDrills } from "@/store/data";
import type { WeeklyDrillCategory } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  CheckCircle2, 
  RotateCcw, 
  Clock, 
  Flame, 
  Sparkles, 
  Target, 
  Plus, 
  Minus,
  CheckCircle,
  HelpCircle,
  Calculator,
  Compass,
  Globe,
  Languages,
  Play,
  Pause,
  Square
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { parseDurationMinutes, formatClock } from "@/lib/duration";

const TIMER_KEY = "beasiswa_drill_timer";

type RunningSession = {
  drillId: string;
  /** Wall-clock epoch ms. The countdown is derived from this, never accumulated
   *  by an interval — so a reload, a sleeping tab or a throttled background
   *  timer cannot make it drift. */
  endsAt: number;
  durationMs: number;
  /** Set while paused; the remaining span is frozen here. */
  pausedRemaining?: number;
};

function loadSession(): RunningSession | null {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as RunningSession;
    if (!s || typeof s.drillId !== "string" || typeof s.durationMs !== "number") return null;
    return s;
  } catch {
    return null;
  }
}

function storeSession(s: RunningSession | null) {
  try {
    if (s) localStorage.setItem(TIMER_KEY, JSON.stringify(s));
    else localStorage.removeItem(TIMER_KEY);
  } catch {
    /* private mode / blocked storage — the timer still works for this tab */
  }
}

/** Remaining time, honouring a paused session. */
function remainingOf(s: RunningSession | null): number {
  if (!s) return 0;
  if (s.pausedRemaining != null) return Math.max(0, s.pausedRemaining);
  return Math.max(0, s.endsAt - Date.now());
}

/** The countdown ring. Progress is drawn as stroke offset on a circle. */
function TimerRing({ remaining, total, paused }: { remaining: number; total: number; paused: boolean }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  const frac = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  return (
    <div className="relative shrink-0" style={{ width: 128, height: 128 }}>
      <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
        <circle cx="64" cy="64" r={R} fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
        <circle
          cx="64" cy="64" r={R} fill="none"
          stroke={paused ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))"}
          strokeWidth="6" strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C * (1 - frac)}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 200ms" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-mono text-xl tabular-nums text-foreground">{formatClock(remaining)}</span>
      </div>
    </div>
  );
}

const iconMap: Record<string, any> = {
  reading: BookOpen,
  grammar: Sparkles,
  practice_test: Target,
  math: Calculator,
  evaluation: CheckCircle,
  timo: Compass,
  ptln: Globe,
  vocab: Languages,
};

const priorityStyles: Record<string, string> = {
  High: "bg-urgent/15 text-urgent border-urgent/30",
  Medium: "bg-soon/15 text-soon border-soon/30",
  Low: "bg-ok/15 text-ok border-ok/30",
};

export default function DrillTracker() {
  const [drills, setDrills] = useState<WeeklyDrillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [session, setSession] = useState<RunningSession | null>(() => loadSession());
  const [now, setNow] = useState(() => Date.now());
  // Guards the completion handler: an interval tick and a visibility change can
  // both observe zero, and the session must only ever be logged once.
  const firedRef = useRef<string | null>(null);

  // Tick only drives the re-render; the value always comes from wall clock.
  useEffect(() => {
    if (!session || session.pausedRemaining != null) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [session]);

  // A backgrounded tab throttles intervals, so re-sync the moment it returns.
  useEffect(() => {
    const sync = () => setNow(Date.now());
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("focus", sync);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);

  useEffect(() => {
    getWeeklyDrills().then((data) => {
      setDrills(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  const updateCount = async (id: string, delta: number) => {
    const updated = drills.map((d) => {
      if (d.id === id) {
        const next = Math.max(0, Math.min(d.target, d.completed + delta));
        return { ...d, completed: next };
      }
      return d;
    });
    setDrills(updated);
    await saveWeeklyDrills(updated);

    const changedItem = updated.find((d) => d.id === id);
    if (changedItem && changedItem.completed === changedItem.target) {
      toast({
        title: "Target Selesai",
        description: `${changedItem.title} telah mencapai kuota mingguan (${changedItem.target}/${changedItem.target}).`,
      });
    }
  };

  const activeDrill = session ? drills.find((d) => d.id === session.drillId) ?? null : null;
  const remaining = remainingOf(session);
  const isPaused = !!session && session.pausedRemaining != null;

  const clearSession = useCallback(() => {
    firedRef.current = null;
    storeSession(null);
    setSession(null);
  }, []);

  const startSession = (drill: WeeklyDrillCategory) => {
    const mins = parseDurationMinutes(drill.durationPerSession);
    if (mins == null) {
      toast({
        title: "Durasi tidak terbaca",
        description: `"${drill.durationPerSession}" bukan durasi yang bisa dipakai timer. Gunakan format seperti "45 mins" atau "1h 30m".`,
        variant: "destructive",
      });
      return;
    }
    const durationMs = mins * 60_000;
    const next: RunningSession = { drillId: drill.id, endsAt: Date.now() + durationMs, durationMs };
    firedRef.current = null;
    storeSession(next);
    setSession(next);
    setNow(Date.now());
  };

  const pauseSession = () => {
    if (!session || session.pausedRemaining != null) return;
    const next = { ...session, pausedRemaining: Math.max(0, session.endsAt - Date.now()) };
    storeSession(next);
    setSession(next);
  };

  const resumeSession = () => {
    if (!session || session.pausedRemaining == null) return;
    const next: RunningSession = {
      drillId: session.drillId,
      durationMs: session.durationMs,
      endsAt: Date.now() + session.pausedRemaining,
    };
    storeSession(next);
    setSession(next);
    setNow(Date.now());
  };

  // Finishing the countdown logs the session. Stopping early deliberately does
  // not — an abandoned session is not a completed one.
  useEffect(() => {
    if (!session || session.pausedRemaining != null) return;
    if (session.endsAt - now > 0) return;
    // A session restored from storage can already be expired on mount, while
    // drills is still the empty initial state. Completing here would find no
    // drill to credit and clear the session anyway — silently losing a session
    // that finished while the app was closed. Wait for the real data first.
    if (loading) return;

    const key = `${session.drillId}:${session.endsAt}`;
    if (firedRef.current === key) return;
    firedRef.current = key;

    const drill = drills.find((d) => d.id === session.drillId);
    if (!drill) {
      // The drill was removed while the timer ran; nothing to credit.
      clearSession();
      return;
    }
    const title = drill.title;

    // Quiet on purpose: a silent system notification, no audio. Matches the
    // decision already made in this repo to strip notification sound.
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Sesi selesai", {
          body: `${title} — ${drill.durationPerSession} selesai. Sesi sudah dicatat.`,
          icon: "/uoft-logo.png",
          tag: "drill-session",
          silent: true,
        });
      }
    } catch {
      /* notification unavailable — the toast below still reports it */
    }

    updateCount(drill.id, 1);
    toast({ title: "Sesi selesai", description: `${title} dicatat +1. Gunakan -1 kalau sesi ini tidak jadi dihitung.` });
    clearSession();
  }, [session, now, drills, loading, toast, clearSession]);

  const resetWeekly = async () => {
    if (confirm("Reset seluruh checklist mingguan menjadi 0 untuk memulai minggu baru?")) {
      const reset = drills.map((d) => ({ ...d, completed: 0 }));
      setDrills(reset);
      await saveWeeklyDrills(reset);
      toast({
        title: "Minggu Baru Dimulai",
        description: "Seluruh kuota drill SAT & TIMO telah di-reset ke 0.",
      });
    }
  };

  const totalTarget = drills.reduce((sum, d) => sum + d.target, 0);
  const totalCompleted = drills.reduce((sum, d) => sum + d.completed, 0);
  const overallPercentage = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/90 backdrop-blur-xs border border-border/80 p-6 rounded-lg shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-2xs font-mono font-semibold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-0.5 rounded-sm border border-primary/20">
              Academic Drill System
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Weekly Quotas & Milestones
            </span>
          </div>
          <h1 className="text-2xl text-foreground">
            SAT, TIMO & University Milestones
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground max-w-2xl leading-relaxed">
            Pantau dan selesaikan kuota mingguan secara terukur agar ritme latihan SAT, TIMO, dan riset kampus luar negeri tetap konsisten.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={resetWeekly}
            className="text-xs font-semibold hover:bg-urgent/10 hover:text-urgent hover:border-urgent/30 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Minggu Baru
          </Button>
        </div>
      </div>

      {/* Running session. Replaces the overview while a drill is in progress. */}
      {session && activeDrill && (
        <Card className="border-border/80 shadow-xs">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">
            <TimerRing remaining={remaining} total={session.durationMs} paused={isPaused} />

            <div className="min-w-0 flex-1">
              <p className="eyebrow">{isPaused ? "Dijeda" : "Sesi berjalan"}</p>
              <h2 className="mt-1 text-lg text-foreground truncate">{activeDrill.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {activeDrill.durationPerSession} · sesi ke-{Math.min(activeDrill.completed + 1, activeDrill.target)} dari {activeDrill.target}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {isPaused ? (
                  <Button size="sm" onClick={resumeSession} className="h-8 text-xs font-semibold">
                    <Play className="w-3.5 h-3.5 mr-1.5" /> Lanjutkan
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={pauseSession} className="h-8 text-xs font-semibold">
                    <Pause className="w-3.5 h-3.5 mr-1.5" /> Jeda
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearSession}
                  className="h-8 text-xs font-semibold hover:bg-urgent/10 hover:text-urgent hover:border-urgent/30"
                >
                  <Square className="w-3.5 h-3.5 mr-1.5" /> Batalkan
                </Button>
              </div>

              <p className="mt-2.5 text-2xs text-muted-foreground">
                Sesi dicatat otomatis saat timer habis. Membatalkan tidak menambah hitungan.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Overview Card */}
      <Card className="border-border/80 shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                <Flame className="w-6 h-6 text-soon" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">Total Progres Kuota Mingguan</h2>
                <p className="text-xs text-muted-foreground">
                  Target total: {totalTarget} sesi terbagi rata (SAT, TIMO, PTLN & Vocab)
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-border/60 sm:pl-6">
              <div className="text-3xl md:text-4xl font-semibold font-mono tracking-tight text-primary">
                {totalCompleted}<span className="text-muted-foreground font-light text-2xl">/{totalTarget}</span>
              </div>
              <span className="text-xs text-muted-foreground block font-mono">
                {overallPercentage}% Selesai
              </span>
            </div>
          </div>

          <Progress value={overallPercentage} className="h-2.5 rounded-full bg-secondary/80" />
        </CardContent>
      </Card>

      {/* Drills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drills.map((drill) => {
          const Icon = iconMap[drill.id] || Target;
          const isDone = drill.completed >= drill.target;
          const isActive = session?.drillId === drill.id;
          const pct = Math.round((drill.completed / drill.target) * 100);

          return (
            <Card
              key={drill.id}
              className={cn(
                "border transition-all duration-200 hover:shadow-xs flex flex-col justify-between",
                isActive
                  ? "bg-card border-foreground/40 ring-1 ring-foreground/15"
                  : isDone
                    ? "bg-ok/[0.04] border-ok/30 dark:bg-ok/10"
                    : "bg-card border-border/70 hover:border-primary/40"
              )}
            >
              <CardContent className="p-5 space-y-4 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className={cn(
                      "p-2.5 rounded-lg shrink-0 border",
                      isDone
                        ? "bg-ok/15 text-ok border-ok/30"
                        : "bg-secondary/80 text-primary border-border/60"
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={cn("text-2xs font-semibold px-2 py-0.5", priorityStyles[drill.priority])}>
                        {drill.priority}
                      </Badge>
                      <Badge variant="secondary" className="text-2xs font-mono text-muted-foreground">
                        <Clock className="w-2.5 h-2.5 mr-1 inline" /> {drill.durationPerSession}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="font-semibold text-base text-foreground flex items-center gap-1.5">
                    {drill.title}
                    {isDone && <CheckCircle2 className="w-4 h-4 text-ok shrink-0" />}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                    {drill.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-muted-foreground">Progres Pekan Ini:</span>
                    <span className="font-mono font-semibold text-sm text-foreground">
                      <span className={cn(isDone ? "text-ok font-semibold" : "text-primary")}>
                        {drill.completed}
                      </span>
                      <span className="text-muted-foreground font-normal">/{drill.target} {drill.unit}</span>
                    </span>
                  </div>

                  <Progress value={pct} className="h-2 rounded-full bg-secondary/80" />

                  {/* Counter Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCount(drill.id, -1)}
                      disabled={drill.completed <= 0}
                      className="h-8 flex-1 text-xs font-semibold border-border/70 hover:bg-muted"
                    >
                      <Minus className="w-3.5 h-3.5 mr-1" /> -1
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => updateCount(drill.id, 1)}
                      disabled={drill.completed >= drill.target}
                      className={cn(
                        "h-8 flex-1 text-xs font-semibold transition-colors",
                        isDone
                          ? "bg-ok hover:bg-ok/90 text-white"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground"
                      )}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> +1 Selesai
                    </Button>
                  </div>

                  {/* One session runs at a time — starting a second would make
                      "which drill am I doing" ambiguous. */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startSession(drill)}
                    disabled={!!session || isDone}
                    className="h-8 w-full text-xs font-semibold border-border/70 hover:border-foreground/40"
                  >
                    {isActive ? (
                      <>Sedang berjalan</>
                    ) : session ? (
                      <>Timer lain berjalan</>
                    ) : (
                      <><Play className="w-3.5 h-3.5 mr-1.5" /> Mulai sesi · {drill.durationPerSession}</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Proportions & Guidelines Info */}
      <Card className="border-border/70 bg-card/50 shadow-xs">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <HelpCircle className="w-4 h-4 text-primary" /> Panduan Proporsi Belajar Harian & Mingguan
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg border border-border/60 bg-card/80 space-y-1">
              <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-primary block">
                Pagi (07:30 - 09:00)
              </span>
              <p className="text-xs text-muted-foreground leading-snug">
                TIMO (07:30) ➔ SAT Prep (08:00) ➔ School Prep (08:40).
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-border/60 bg-card/80 space-y-1">
              <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-soon block">
                Sore (15:10 - 15:40)
              </span>
              <p className="text-xs text-muted-foreground leading-snug">
                TIMO Preparation drill latihan soal kompetisi (Senin - Jumat).
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-border/60 bg-card/80 space-y-1">
              <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-muted-foreground block">
                Malam (20:30 - 22:15)
              </span>
              <p className="text-xs text-muted-foreground leading-snug">
                SAT Prep utama (~90m) ➔ Persiapan mapel sekolah (ENGWA / PPKN).
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-border/60 bg-card/80 space-y-1">
              <span className="text-2xs font-mono font-semibold uppercase tracking-wider text-ok block">
                PTLN & Weekend
              </span>
              <p className="text-xs text-muted-foreground leading-snug">
                4 sesi riset kampus LN + Weekend SAT Practice Test (16:30 - 18:30).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
