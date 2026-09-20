import { useState, useEffect } from "react";
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
  Languages
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
  High: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

export default function DrillTracker() {
  const [drills, setDrills] = useState<WeeklyDrillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        title: "Target Selesai! 🎉",
        description: `${changedItem.title} telah mencapai kuota mingguan (${changedItem.target}/${changedItem.target}). Mantap!`,
      });
    }
  };

  const resetWeekly = async () => {
    if (confirm("Reset seluruh checklist mingguan menjadi 0 untuk memulai minggu baru?")) {
      const reset = drills.map((d) => ({ ...d, completed: 0 }));
      setDrills(reset);
      await saveWeeklyDrills(reset);
      toast({
        title: "Minggu Baru Dimulai! 🚀",
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
              WEEKLY DRILLS & MILESTONES
            </span>
            <Badge variant="outline" className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20 py-0">
              UofT Prep
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-serif">
            SAT & TIMO Drill Tracker
          </h1>
          <p className="text-sm text-muted-foreground">
            Checklist kuota mingguan terukur agar porsi latihan SAT & Olimpiade TIMO kamu merata dan teratur.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={resetWeekly}
            className="text-xs font-semibold hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Minggu Baru
          </Button>
        </div>
      </div>

      {/* Progress Overview Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-secondary/10 shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Flame className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Total Progres Latihan Mingguan</h2>
                <p className="text-xs text-muted-foreground">
                  Target total: {totalTarget} sesi (~1030 menit SAT + drill TIMO terbagi rata)
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-3xl font-extrabold font-mono text-primary">
                {totalCompleted}/{totalTarget}
              </span>
              <span className="text-xs text-muted-foreground block font-mono">Sesi Selesai ({overallPercentage}%)</span>
            </div>
          </div>

          <Progress value={overallPercentage} className="h-3 rounded-full" />
        </CardContent>
      </Card>

      {/* Drills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drills.map((drill) => {
          const Icon = iconMap[drill.id] || Target;
          const isDone = drill.completed >= drill.target;
          const pct = Math.round((drill.completed / drill.target) * 100);

          return (
            <Card
              key={drill.id}
              className={cn(
                "border transition-all duration-200 hover:shadow-md flex flex-col justify-between",
                isDone
                  ? "bg-emerald-500/5 border-emerald-500/30 dark:bg-emerald-950/10"
                  : "bg-card border-border hover:border-primary/40"
              )}
            >
              <CardContent className="p-5 space-y-4 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-secondary/80 text-foreground shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5", priorityStyles[drill.priority])}>
                        {drill.priority}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] font-mono">
                        <Clock className="w-2.5 h-2.5 mr-1 inline" /> {drill.durationPerSession}
                      </Badge>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-foreground flex items-center gap-1.5">
                    {drill.title}
                    {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {drill.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-muted-foreground">Kuota Mingguan:</span>
                    <span className="font-mono font-bold text-sm text-foreground">
                      <span className={cn(isDone ? "text-emerald-400 font-extrabold" : "text-primary")}>
                        {drill.completed}
                      </span>
                      /{drill.target} {drill.unit}
                    </span>
                  </div>

                  <Progress value={pct} className="h-2 rounded-full" />

                  {/* Counter Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCount(drill.id, -1)}
                      disabled={drill.completed <= 0}
                      className="h-8 flex-1 text-xs font-bold"
                    >
                      <Minus className="w-3.5 h-3.5 mr-1" /> -1
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => updateCount(drill.id, 1)}
                      disabled={drill.completed >= drill.target}
                      className={cn(
                        "h-8 flex-1 text-xs font-bold",
                        isDone
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground"
                      )}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> +1 Selesai
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Proportions & Guidelines Info */}
      <Card className="border-border bg-card/60 shadow-xs">
        <CardContent className="p-5 text-xs text-muted-foreground space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <HelpCircle className="w-4 h-4 text-primary" /> Panduan Proporsi Belajar Harian & Mingguan
          </div>
          <ul className="list-disc list-inside space-y-1 pl-1">
            <li><strong>Pagi (07:30 - 09:00)</strong>: TIMO (07:30-08:00) ➔ SAT Prep (08:00-08:40) ➔ School Prep (08:40-09:00).</li>
            <li><strong>Sore (15:10 - 15:40)</strong>: TIMO Preparation drill soal-soal tahun lalu (Senin - Jumat).</li>
            <li><strong>Malam (20:30 - 22:15)</strong>: SAT Prep utama (20:30-22:00) ➔ Persiapan mapel sekolah seperti ENGWA / PPKN (22:00-22:15).</li>
            <li><strong>PTLN Research</strong>: 4 sesi riset kampus luar negeri per minggu.</li>
            <li><strong>Weekend (Sabtu & Minggu 16:30 - 18:30)</strong>: Full Practice Test / evaluasi kesalahan.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
