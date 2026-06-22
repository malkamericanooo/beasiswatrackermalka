import { useState, useEffect } from "react";
import { Link } from "wouter";
import { GraduationCap, Clock, Target, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getUniversities, getGoals } from "@/store/data";
import { getDaysLeft, sortByComposite } from "@/lib/scoring";
import type { University, Goal } from "@/types";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    Promise.all([getUniversities(), getGoals()]).then(([u, g]) => {
      setUniversities(u as University[]);
      setGoals(g as Goal[]);
    });
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

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard</h1>
      <p className="text-muted-foreground text-sm mb-8">Track your scholarship application progress.</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
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
      <div className="grid grid-cols-4 gap-3 mb-8">
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
      <div className="grid grid-cols-2 gap-6">
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
