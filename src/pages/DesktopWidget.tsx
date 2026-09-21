import { useState, useEffect } from "react";
import { getGoals, getUniversities, getReminders, saveGoals, saveReminders } from "@/store/data";
import { getDaysLeft } from "@/lib/scoring";
import type { Goal, University, ReminderItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, Flame, ExternalLink, RefreshCw, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface WidgetItem {
  id: string;
  title: string;
  category: string;
  deadlineStr: string;
  daysLeft: number | null;
  type: "goal" | "uni" | "reminder";
  completed: boolean;
  rawObject: Goal | University | ReminderItem;
}

export default function DesktopWidget() {
  const [items, setItems] = useState<WidgetItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTop8 = () => {
    setLoading(true);
    Promise.all([getGoals(), getUniversities(), getReminders()])
      .then(([rawGoals, rawUnis, rawReminders]) => {
        const goals = Array.isArray(rawGoals) ? rawGoals : [];
        const unis = Array.isArray(rawUnis) ? rawUnis : [];
        const reminders = Array.isArray(rawReminders) ? rawReminders : [];
        const allList: WidgetItem[] = [];

        // Active Goals
        goals.filter(g => g && !g.completed && g.deadline).forEach(g => {
          const d = getDaysLeft(g.deadline);
          allList.push({
            id: `g_${g.id}`,
            title: g.title || "Untitled Goal",
            category: g.category || "Task",
            deadlineStr: typeof g.deadline === 'string' ? g.deadline.slice(0, 10) : "",
            daysLeft: d,
            type: "goal",
            completed: false,
            rawObject: g,
          });
        });

        // University Deadlines
        unis.filter(u => u && u.deadline).forEach(u => {
          const d = getDaysLeft(u.deadline);
          allList.push({
            id: `u_${u.id}`,
            title: `${u.shortName || u.name || "University"} Deadline`,
            category: "Scholarship",
            deadlineStr: typeof u.deadline === 'string' ? u.deadline.slice(0, 10) : "",
            daysLeft: d,
            type: "uni",
            completed: u.status === "Submitted",
            rawObject: u,
          });
        });

        // Reminders
        reminders.filter(r => r && !r.isCompleted && r.date).forEach(r => {
          const d = getDaysLeft(r.date);
          allList.push({
            id: `r_${r.id}`,
            title: r.title || "Untitled Agenda",
            category: "Agenda",
            deadlineStr: typeof r.date === 'string' ? r.date : "",
            daysLeft: d,
            type: "reminder",
            completed: false,
            rawObject: r,
          });
        });

        // Automatic Urgency Sorting: closest deadline first
        allList.sort((a, b) => {
          if (a.daysLeft === null) return 1;
          if (b.daysLeft === null) return -1;
          return a.daysLeft - b.daysLeft;
        });

        setItems(allList.slice(0, 8));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load widget items:", err);
        setItems([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadTop8();
  }, []);

  const toggleComplete = async (item: WidgetItem) => {
    if (item.type === "goal") {
      const gList = (await getGoals()) as Goal[];
      const targetId = String((item.rawObject as Goal).id);
      const updated = gList.map(g => String(g.id) === targetId ? { ...g, completed: !g.completed } : g);
      await saveGoals(updated);
    } else if (item.type === "reminder") {
      const rList = (await getReminders()) as ReminderItem[];
      const targetId = String((item.rawObject as ReminderItem).id);
      const updated = rList.map(r => String(r.id) === targetId ? { ...r, isCompleted: !r.isCompleted } : r);
      await saveReminders(updated);
    }
    loadTop8();
  };

  const popoutWidget = () => {
    window.open(
      "/widget",
      "BeasiswaMacWidget",
      "width=380,height=600,top=100,left=100,resizable=yes,scrollbars=yes"
    );
  };

  return (
    <div className="min-h-screen bg-sidebar text-sidebar-foreground p-4 font-sans select-none overflow-hidden flex flex-col justify-between">
      {/* Widget Header */}
      <div>
        <div className="flex items-center justify-between border-b border-sidebar-border pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <img src="/uoft-crest-clean.png" alt="UofT Crest" className="w-7 h-7 object-contain bg-white/90 p-0.5 rounded shadow-xs" />
            <div>
              <h1 className="eyebrow text-sidebar-foreground flex items-center gap-1.5">
                Top 8 Urgency Widget
              </h1>
              <p className="text-2xs text-sidebar-foreground/55 font-mono">Sorted by closest deadline</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={loadTop8}
              className="p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground/55 hover:text-sidebar-foreground transition-colors"
              title="Refresh"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            </button>
            <button
              onClick={popoutWidget}
              className="p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground/55 hover:text-sidebar-foreground transition-colors"
              title="Popout Floating Window"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Top 8 Items List */}
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="text-center py-10 text-sidebar-foreground/55 text-xs font-mono">
              No active tasks or deadlines! 🎉
            </div>
          ) : (
            items.map((item) => {
              const isOverdue = item.daysLeft !== null && item.daysLeft < 0;
              const isDueToday = item.daysLeft === 0;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "p-2.5 rounded-lg border transition-all flex items-center justify-between gap-2.5 bg-sidebar/90 shadow-xs hover:border-sidebar-border",
                    isDueToday ? "border-urgent/50 bg-urgent/10" : isOverdue ? "border-soon/40" : "border-sidebar-border/80"
                  )}
                >
                  {/* Left: Complete Checkbox & Title */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <button
                      onClick={() => toggleComplete(item)}
                      className="text-sidebar-foreground/55 hover:text-ok transition-colors shrink-0"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-ok" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-sidebar-foreground truncate leading-snug">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="outline" className={cn("text-2xs py-0 px-1 font-semibold border-none",
                          item.category === "Lomba" ? "bg-ok/20 text-ok" :
                          item.category === "Tugas Sekolah" ? "bg-white/10 text-muted-foreground" :
                          item.category === "Project" ? "bg-soon/20 text-soon" :
                          item.category === "Scholarship" ? "bg-urgent/20 text-urgent" :
                          "bg-white/10 text-muted-foreground"
                        )}>
                          {item.category}
                        </Badge>
                        <span className="text-2xs font-mono text-sidebar-foreground/55">{item.deadlineStr}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Days Left Badge */}
                  <div className="shrink-0 text-right">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-2xs font-mono font-semibold px-2 py-0.5 rounded-full border",
                        isOverdue
                          ? "bg-urgent/20 text-urgent border-urgent/40"
                          : isDueToday
                          ? "bg-urgent text-white font-medium border-urgent"
                          : item.daysLeft !== null && item.daysLeft <= 3
                          ? "bg-soon/20 text-soon border-soon/40"
                          : "bg-sidebar-accent text-sidebar-foreground/75 border-sidebar-border"
                      )}
                    >
                      {isOverdue
                        ? `${Math.abs(item.daysLeft!)}d overdue`
                        : isDueToday
                        ? "DUE TODAY"
                        : `${item.daysLeft}d left`}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Widget Footer */}
      <div className="pt-3 border-t border-sidebar-border/80 flex items-center justify-between text-2xs text-sidebar-foreground/55 font-mono">
        <span>UofT Target 2026</span>
        <button onClick={popoutWidget} className="hover:text-sidebar-foreground/75 transition-colors underline">
          Open Desktop Popout Window
        </button>
      </div>
    </div>
  );
}
