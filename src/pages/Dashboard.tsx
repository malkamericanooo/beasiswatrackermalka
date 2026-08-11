import { useState, useEffect } from "react";
import { Link } from "wouter";
import { GraduationCap, Clock, Target, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getUniversities, getGoals, getReminders, saveGoals } from "@/store/data";
import { getDaysLeft, sortByComposite } from "@/lib/scoring";
import type { University, Goal, ReminderItem } from "@/types";
import { cn } from "@/lib/utils";
import { CalendarDays, Sparkles, Flame, CheckCircle, AlertTriangle } from "lucide-react";

function getAppStatus(uni: University): "Ready to Submit" | "Submitted" | "Researching" | "Missing Data" {
  if (uni.status === "Submitted") return "Submitted";
  const total = uni.documents.length;
  const done = uni.documents.filter((d) => d.completed).length;
  if (total > 0 && done === total) return "Ready to Submit";
  const daysLeft = getDaysLeft(uni.deadline);
  if (done === 0 && daysLeft !== null && daysLeft <= 60) return "Missing Data";
  return "Researching";
}

const priorityColors: Record<string, string> = {
  High: "bg-rose-100 text-rose-700 border-rose-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function Dashboard() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);

  const reloadData = () => {
    Promise.all([getUniversities(), getGoals(), getReminders()]).then(([u, g, r]) => {
      setUniversities(u as University[]);
      setGoals(g as Goal[]);
      setReminders(r as ReminderItem[]);
    });
  };

  useEffect(() => {
    reloadData();
  }, []);

  const today = new Date();
  const thirtyDaysOut = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const totalUnis = universities.length;
  const deadlines30 = universities.filter((u) => {
    const d = new Date(u.deadline);
    return d >= today && d <= thirtyDaysOut;
  }).length;

  const totalGoals = goals.length;
  const doneGoals = goals.filter((g) => g.completed).length;
  const goalProgress = totalGoals > 0 ? Math.round((doneGoals / totalGoals) * 100) : 0;

  const statusCounts = {
    "Ready to Submit": 0,
    Submitted: 0,
    Researching: 0,
    "Missing Data": 0,
  };
  universities.forEach((u) => {
    statusCounts[getAppStatus(u)]++;
  });

  const upcoming = [...universities]
    .filter((u) => {
      const dl = getDaysLeft(u.deadline);
      return dl !== null && dl >= 0;
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  const recentGoals = sortByComposite(goals.filter((g) => !g.completed)).slice(0, 6);

  // Compute 3-Day Focus Items (Deadlines, Tasks, Agendas due in <= 3 days)
  const items3Days: { id?: string; title: string; category: string; deadline: string; daysLeft: number; type: "goal" | "uni" | "reminder"; priority?: string; completed?: boolean; raw?: Goal }[] = [];

  goals.forEach((g) => {
    if (g.deadline) {
      const days = getDaysLeft(g.deadline);
      if (days !== null && days >= 0 && days <= 3) {
        items3Days.push({
          id: g.id,
          title: g.title,
          category: g.category || "Goal",
          deadline: g.deadline,
          daysLeft: days,
          type: "goal",
          priority: g.priority,
          completed: g.completed,
          raw: g,
        });
      }
    }
  });

  reminders.forEach((r) => {
    const days = getDaysLeft(r.date);
    if (days !== null && days >= 0 && days <= 3) {
      items3Days.push({
        title: r.title,
        category: "Agenda",
        deadline: r.date,
        daysLeft: days,
        type: "reminder",
        completed: r.isCompleted,
      });
    }
  });

  universities.forEach((u) => {
    const days = getDaysLeft(u.deadline);
    if (days !== null && days >= 0 && days <= 3) {
      items3Days.push({
        title: `${u.shortName || u.name} Deadline`,
        category: u.program || "Scholarship",
        deadline: u.deadline,
        daysLeft: days,
        type: "uni",
        priority: u.priority,
      });
    }
  });

  items3Days.sort((a, b) => a.daysLeft - b.daysLeft);

  const handleToggleGoal = async (g: Goal) => {
    const updated = goals.map((x) => (x.id === g.id ? { ...x, completed: !x.completed } : x));
    await saveGoals(updated);
    reloadData();
  };

  return (
    <div className="p-4 md:p-8">
      {/* Official University of Toronto Header Banner */}
      <div className="mb-6 bg-card text-foreground rounded-xl p-4 md:p-5 shadow-sm border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src="/uoft-logo.png" alt="University of Toronto Official Logo" className="h-12 md:h-14 w-auto object-contain shrink-0 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-mono font-bold px-3 py-1">
            Target Admission 2026/2027
          </Badge>
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Dashboard</h1>
      <p className="text-muted-foreground text-sm mb-6 md:mb-8">Track your scholarship application progress & deadlines.</p>

      {/* 3-Day Focus Widget Banner */}
      <Card className="mb-6 md:mb-8 border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-purple-500/10 shadow-sm">
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-500/20 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500 text-white shadow-xs">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                  Target & Deadline 3 Hari Kedepan
                </h2>
                <p className="text-xs text-muted-foreground">Focus view untuk tugas, deadline, dan agenda mendesak.</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 self-start sm:self-auto text-xs font-bold">
              {items3Days.length} Mendadak / Urgent
            </Badge>
          </div>

          {items3Days.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">Tidak ada deadline atau tugas sekolah mendesak dalam 3 hari kedepan.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {items3Days.map((item, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-3 rounded-lg border bg-card/80 transition-all flex items-start justify-between gap-2 shadow-2xs",
                    item.daysLeft === 0 ? "border-rose-500/50 ring-1 ring-rose-500/30" : "border-border"
                  )}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={cn("text-[10px] py-0 px-1.5 font-bold shrink-0",
                        item.category === "Lomba" ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                        item.category === "Tugas Sekolah" ? "bg-indigo-100 text-indigo-800 border-indigo-300" :
                        item.category === "Project" ? "bg-amber-100 text-amber-800 border-amber-300" :
                        item.type === "uni" ? "bg-rose-100 text-rose-800 border-rose-300" :
                        "bg-purple-100 text-purple-800 border-purple-300"
                      )}>
                        {item.category}
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground">{item.deadline}</span>
                    </div>

                    <p className={cn("text-xs font-bold text-foreground leading-snug truncate", item.completed && "line-through text-muted-foreground")}>
                      {item.title}
                    </p>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <Badge variant="outline" className={cn("text-[10px] font-mono font-bold",
                      item.daysLeft === 0 ? "bg-rose-600 text-white border-0" :
                      item.daysLeft === 1 ? "bg-amber-500 text-white border-0" : "bg-sky-100 text-sky-700 border-sky-200"
                    )}>
                      {item.daysLeft === 0 ? "Hari ini!" : item.daysLeft === 1 ? "Besok" : `${item.daysLeft} hari`}
                    </Badge>

                    {item.raw && (
                      <button
                        onClick={() => handleToggleGoal(item.raw!)}
                        className="text-muted-foreground hover:text-emerald-600 transition-colors p-0.5"
                        title="Tandai selesai"
                      >
                        {item.completed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 md:mb-8">
        <Card className="bg-primary text-primary-foreground border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium opacity-80">Universities Tracked</span>
              <GraduationCap className="w-5 h-5 opacity-70" />
            </div>
            <div className="text-4xl font-bold" data-testid="stat-universities-count">{totalUnis}</div>
            <div className="text-xs opacity-70 mt-1">
              {statusCounts["Submitted"]} application{statusCounts["Submitted"] !== 1 ? "s" : ""} submitted
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-500 text-white border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium opacity-90">30-Day Deadlines</span>
              <Clock className="w-5 h-5 opacity-80" />
            </div>
            <div className="text-4xl font-bold" data-testid="stat-deadlines-count">{deadlines30}</div>
            <div className="text-xs opacity-80 mt-1">Approaching fast</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Goals Progress</span>
              <Target className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-3xl font-bold text-foreground" data-testid="stat-goals-progress">
              {doneGoals} / {totalGoals}
            </div>
            <Progress value={goalProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 md:mb-8">
        {(["Researching", "Ready to Submit", "Submitted", "Missing Data"] as const).map((s) => (
          <Card key={s}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-foreground" data-testid={`status-${s.toLowerCase().replace(/\s+/g, "-")}`}>
                {statusCounts[s]}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{s}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Upcoming Deadlines</h2>
              <Link href="/calendar">
                <span className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors">
                  View Calendar <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
            <div className="space-y-3">
              {upcoming.length === 0 && (
                <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
              )}
              {upcoming.map((u) => {
                const days = getDaysLeft(u.deadline);
                return (
                  <div key={u.id} className="flex items-center justify-between py-2 border-b border-border last:border-0" data-testid={`deadline-${u.id}`}>
                    <div>
                      <div className="text-sm font-medium text-foreground">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.program}</div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs font-medium shrink-0",
                        days !== null && days <= 30
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-sky-50 text-sky-700 border-sky-200"
                      )}
                    >
                      {days !== null ? (days === 0 ? "Today" : `${days}d`) : "—"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Goals */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Recent Goals</h2>
              <Link href="/goals">
                <span className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground cursor-pointer transition-colors">
                  View All <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
            <div className="space-y-2">
              {recentGoals.length === 0 && (
                <p className="text-sm text-muted-foreground">No active goals.</p>
              )}
              {recentGoals.map((g) => (
                <div key={g.id} className="flex items-center justify-between py-2 border-b border-border last:border-0" data-testid={`goal-${g.id}`}>
                  <div className="flex items-center gap-2 min-w-0">
                    {g.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className={cn("text-sm font-medium truncate", g.completed && "line-through text-muted-foreground")}>
                        {g.title}
                      </div>
                      <div className="text-xs text-muted-foreground">{g.category}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("text-xs shrink-0 ml-2", priorityColors[g.priority])}>
                    {g.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
