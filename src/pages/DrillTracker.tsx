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
  High: "bg-urgent/15 text-urgent border-urgent/30",
  Medium: "bg-soon/15 text-soon border-soon/30",
  Low: "bg-ok/15 text-ok border-ok/30",
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
        title: "Target Selesai",
        description: `${changedItem.title} telah mencapai kuota mingguan (${changedItem.target}/${changedItem.target}).`,
      });
    }
  };

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
          const pct = Math.round((drill.completed / drill.target) * 100);

          return (
            <Card
              key={drill.id}
              className={cn(
                "border transition-all duration-200 hover:shadow-xs flex flex-col justify-between",
                isDone
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
