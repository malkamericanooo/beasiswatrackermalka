import { useState, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock,
  Filter, Plus, CheckCircle2, Circle, Eye, LayoutGrid, ListFilter,
  ExternalLink, Trash2, CalendarDays, Trophy, BookOpen, Rocket, Award, GraduationCap, FileText
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getUniversities, getGoals, getReminders, saveGoals, saveReminders } from "@/store/data";
import { getDaysLeft } from "@/lib/scoring";
import type { University, Goal, ReminderItem } from "@/types";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

type CalEventType = "deadline" | "opens" | "goal" | "reminder";

export interface UnifiedCalEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: CalEventType;
  category?: string;
  subLabel?: string;
  description?: string;
  completed?: boolean;
  priority?: "High" | "Medium" | "Low";
  time?: string;
  rawObject?: University | Goal | ReminderItem;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function getMonthMatrix(year: number, month: number): (number | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let day = 1 - firstDay;
  for (let w = 0; w < 6; w++) {
    const week: (number | null)[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(day >= 1 && day <= daysInMonth ? day : null);
      day++;
    }
    weeks.push(week);
    if (day > daysInMonth) break;
  }
  return weeks;
}

// Category Color Classifier
export function getCategoryStyle(ev: UnifiedCalEvent) {
  const cat = (ev.category || ev.type || "").toLowerCase();

  // 1. Lomba / Competition -> Emerald Green
  if (cat.includes("lomba") || cat.includes("competition") || cat.includes("challenge")) {
    return {
      chip: "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200",
      border: "border-l-4 border-l-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100",
      label: "Lomba / Competition",
      tag: "Lomba",
    };
  }

  // 2. Tugas Sekolah / School Homework -> Indigo
  if (cat.includes("tugas") || cat.includes("homework") || cat.includes("school")) {
    return {
      chip: "bg-indigo-600 text-white shadow-xs hover:bg-indigo-700",
      badge: "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200",
      border: "border-l-4 border-l-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100",
      label: "Tugas Sekolah",
      tag: "Tugas Sekolah",
    };
  }

  // 3. Projek Akademik / Project -> Amber Orange
  if (cat.includes("project") || cat.includes("projek") || cat.includes("academic")) {
    return {
      chip: "bg-amber-600 text-white shadow-xs hover:bg-amber-700",
      badge: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200",
      border: "border-l-4 border-l-amber-600 bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100",
      label: "Projek Akademik",
      tag: "Projek",
    };
  }

  // 4. Application Opens -> Sky Blue
  if (ev.type === "opens" || cat.includes("opens")) {
    return {
      chip: "bg-sky-600 text-white shadow-xs hover:bg-sky-700",
      badge: "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-200",
      border: "border-l-4 border-l-sky-600 bg-sky-50/70 dark:bg-sky-950/40 text-sky-950 dark:text-sky-100",
      label: "App Opens",
      tag: "App Opens",
    };
  }

  // 5. Scholarship Deadline -> Rose Red
  if (ev.type === "deadline" || cat.includes("deadline") || cat.includes("application")) {
    return {
      chip: "bg-rose-600 text-white shadow-xs hover:bg-rose-700",
      badge: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200",
      border: "border-l-4 border-l-rose-600 bg-rose-50/70 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100",
      label: "Scholarship Apply",
      tag: "Scholarship",
    };
  }

  // 6. Default Agenda & Reminders -> Purple Violet
  return {
    chip: "bg-purple-600 text-white shadow-xs hover:bg-purple-700",
    badge: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-200",
    border: "border-l-4 border-l-purple-600 bg-purple-50/70 dark:bg-purple-950/40 text-purple-950 dark:text-purple-100",
    label: "Agenda Harian",
    tag: "Agenda",
  };
}

export default function CalendarPage() {
  const [, setLocation] = useLocation();
  const today = new Date();
  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewMode, setViewMode] = useState<"month" | "list">("month");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [events, setEvents] = useState<UnifiedCalEvent[]>([]);
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<UnifiedCalEvent | null>(null);

  // Dialog state for adding/editing a Goal/Event
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addGoalTitle, setAddGoalTitle] = useState("");
  const [addGoalCategory, setAddGoalCategory] = useState("Tugas Sekolah");
  const [addGoalPriority, setAddGoalPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [addGoalStartDate, setAddGoalStartDate] = useState("");
  const [addGoalDeadline, setAddGoalDeadline] = useState("");
  const [addGoalTime, setAddGoalTime] = useState("09:00");
  const [addGoalDescription, setAddGoalDescription] = useState("");

  // Load all events (Universities, Goals, Reminders)
  const loadEvents = () => {
    Promise.all([getUniversities(), getGoals(), getReminders()]).then(([unis, goals, reminders]) => {
      const unified: UnifiedCalEvent[] = [];

      // Universities deadlines and application opens
      (unis as University[]).forEach((u) => {
        if (u.deadline) {
          unified.push({
            id: `uni_dl_${u.id}`,
            date: u.deadline.slice(0, 10),
            title: `${u.shortName || u.name} Deadline`,
            type: "deadline",
            category: "Scholarship",
            subLabel: u.program,
            priority: u.priority,
            description: `Official application deadline for ${u.name} (${u.program}, ${u.country}).`,
            rawObject: u,
          });
        }
        if (u.applicationOpens) {
          unified.push({
            id: `uni_op_${u.id}`,
            date: u.applicationOpens.slice(0, 10),
            title: `${u.shortName || u.name} Opens`,
            type: "opens",
            category: "App Opens",
            subLabel: u.program,
            description: `Application portals open for ${u.name} (${u.program}).`,
            rawObject: u,
          });
        }
      });

      // Goals (supports multi-day continuous spans from startDate to deadline)
      (goals as Goal[]).filter((g) => g.deadline || g.startDate).forEach((g) => {
        const endStr = g.deadline ? g.deadline.slice(0, 10) : g.startDate!.slice(0, 10);
        const startStr = g.startDate ? g.startDate.slice(0, 10) : endStr;

        if (startStr && endStr && startStr < endStr) {
          // Multi-day continuous range! Render daily event on every day from startStr to endStr
          const cur = new Date(startStr + "T00:00:00");
          const endDate = new Date(endStr + "T00:00:00");
          while (cur <= endDate) {
            const dateKey = cur.toISOString().slice(0, 10);
            unified.push({
              id: `goal_${g.id}_${dateKey}`,
              date: dateKey,
              title: g.title,
              type: "goal",
              category: g.category || "Goal",
              subLabel: g.category,
              time: g.time || undefined,
              description: g.description || "Goal preparation milestone.",
              completed: g.completed,
              priority: g.priority,
              rawObject: g,
            });
            cur.setDate(cur.getDate() + 1);
          }
        } else {
          unified.push({
            id: `goal_${g.id}`,
            date: endStr,
            title: g.title,
            type: "goal",
            category: g.category || "Goal",
            subLabel: g.category,
            time: g.time || undefined,
            description: g.description || "Goal preparation milestone.",
            completed: g.completed,
            priority: g.priority,
            rawObject: g,
          });
        }
      });

      // Structured Reminders
      (reminders as ReminderItem[]).forEach((r) => {
        unified.push({
          id: `rem_${r.id}`,
          date: r.date,
          title: r.title,
          type: "reminder",
          category: "Agenda",
          time: r.startTime || undefined,
          completed: r.isCompleted,
          subLabel: `${r.durationHours}h task`,
          description: r.description || "Structured Agenda task.",
          rawObject: r,
        });
      });

      setEvents(unified);
    });
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Filtering
  const filteredEvents = events.filter((e) => {
    if (categoryFilter === "all") return true;
    const catStyle = getCategoryStyle(e);
    if (categoryFilter === "lomba") return catStyle.tag === "Lomba";
    if (categoryFilter === "tugas") return catStyle.tag === "Tugas Sekolah";
    if (categoryFilter === "projek") return catStyle.tag === "Projek";
    if (categoryFilter === "scholarship") return catStyle.tag === "Scholarship";
    if (categoryFilter === "agenda") return catStyle.tag === "Agenda";
    return true;
  });

  const eventsByDate: Record<string, UnifiedCalEvent[]> = {};
  filteredEvents.forEach((e) => {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
    eventsByDate[e.date].push(e);
  });

  // Navigation handlers
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDayKey(todayKey);
  };

  const openAddDialog = (dayKey?: string) => {
    const targetDate = dayKey || selectedDayKey || todayKey;
    setAddGoalTitle("");
    setAddGoalCategory("Tugas Sekolah");
    setAddGoalPriority("Medium");
    setAddGoalStartDate(targetDate);
    setAddGoalDeadline(targetDate);
    setAddGoalTime("09:00");
    setAddGoalDescription("");
    setAddDialogOpen(true);
  };

  // Adding quick goal
  const handleAddGoal = async () => {
    if (!addGoalTitle.trim()) return;
    const existingGoals = (await getGoals()) as Goal[];
    const newGoal: Goal = {
      id: `g_${Date.now()}`,
      title: addGoalTitle.trim(),
      category: addGoalCategory,
      priority: addGoalPriority,
      startDate: addGoalStartDate || addGoalDeadline || todayKey,
      deadline: addGoalDeadline || addGoalStartDate || todayKey,
      time: addGoalTime.trim() || null,
      description: addGoalDescription.trim(),
      completed: false,
    };
    await saveGoals([...existingGoals, newGoal]);
    setAddGoalTitle("");
    setAddDialogOpen(false);
    loadEvents();
  };

  // Toggle Goal completion from popover
  const handleToggleGoal = async (g: Goal) => {
    const existingGoals = (await getGoals()) as Goal[];
    const updated = existingGoals.map((x) => (x.id === g.id ? { ...x, completed: !x.completed } : x));
    await saveGoals(updated);
    if (activeEvent) {
      setActiveEvent({ ...activeEvent, completed: !activeEvent.completed });
    }
    loadEvents();
  };

  // Toggle Reminder completion from popover
  const handleToggleReminder = async (r: ReminderItem) => {
    const existingRems = (await getReminders()) as ReminderItem[];
    const updated = existingRems.map((x) => (x.id === r.id ? { ...x, isCompleted: !x.isCompleted } : x));
    await saveReminders(updated);
    if (activeEvent) {
      setActiveEvent({ ...activeEvent, completed: !activeEvent.completed });
    }
    loadEvents();
  };

  const weeks = getMonthMatrix(viewYear, viewMonth);
  const selectedDayEvents = selectedDayKey ? eventsByDate[selectedDayKey] || [] : [];

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-sm">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Calendar Overview</h1>
            <p className="text-muted-foreground text-sm">Visual schedule for deadlines, tasks, projects, competitions, and daily agendas.</p>
          </div>
        </div>

        {/* View Switcher & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Today Button */}
          <Button variant="outline" size="sm" onClick={goToday} className="text-xs font-bold px-3">
            Today
          </Button>

          {/* Month Nav */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden bg-card shadow-xs">
            <button onClick={prevMonth} className="p-2 hover:bg-muted transition-colors">
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            <span className="px-3.5 text-xs font-bold font-serif text-foreground min-w-[130px] text-center">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} className="p-2 hover:bg-muted transition-colors">
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* Category Classification Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44 h-9 text-xs font-semibold" data-testid="select-calendar-type-filter">
              <Filter className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              <SelectItem value="lomba">Lomba & Kompetisi</SelectItem>
              <SelectItem value="tugas">Tugas Sekolah</SelectItem>
              <SelectItem value="projek">Projek Akademik</SelectItem>
              <SelectItem value="scholarship">Scholarship Apply</SelectItem>
              <SelectItem value="agenda">Agenda Harian</SelectItem>
            </SelectContent>
          </Select>

          {/* View Modes */}
          <div className="flex items-center bg-muted/70 p-1 rounded-lg gap-1 border border-border">
            <button
              onClick={() => setViewMode("month")}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                viewMode === "month" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5 inline mr-1.5" />
              Month Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-md transition-all",
                viewMode === "list" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ListFilter className="w-3.5 h-3.5 inline mr-1.5" />
              Agenda List
            </button>
          </div>
        </div>
      </div>

      {/* Color Classification Legend Bar */}
      <div className="flex flex-wrap items-center gap-4 text-xs bg-muted/30 p-3 rounded-lg border border-border">
        <span className="text-muted-foreground font-bold uppercase tracking-wider text-[10px]">Category Classification:</span>
        
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-emerald-600 shadow-xs" />
          <span className="text-foreground font-bold flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-emerald-600" /> Lomba / Competition
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-indigo-600 shadow-xs" />
          <span className="text-foreground font-bold flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Tugas Sekolah
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-amber-600 shadow-xs" />
          <span className="text-foreground font-bold flex items-center gap-1">
            <Rocket className="w-3.5 h-3.5 text-amber-600" /> Projek Akademik
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-rose-600 shadow-xs" />
          <span className="text-foreground font-bold flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-rose-600" /> Scholarship Apply
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-purple-600 shadow-xs" />
          <span className="text-foreground font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-purple-600" /> Agenda Harian
          </span>
        </div>
      </div>

      {/* View Mode: Month Grid */}
      {viewMode === "month" && (
        <Card className="border border-border shadow-sm overflow-hidden bg-card">
          <CardContent className="p-0">
            {/* Day Header row */}
            <div className="grid grid-cols-7 border-b border-border bg-muted/40">
              {DAY_NAMES.map((d) => (
                <div key={d} className="py-2.5 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {d}
                </div>
              ))}
            </div>

            {/* Month Grid Weeks */}
            <div className="divide-y divide-border">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 divide-x divide-border min-h-[120px] md:min-h-[140px]">
                  {week.map((day, di) => {
                    if (day === null) {
                      return <div key={di} className="bg-muted/10 p-1.5" />;
                    }

                    const key = formatDateKey(viewYear, viewMonth, day);
                    const isToday = key === todayKey;
                    const isSelected = key === selectedDayKey;
                    const dayEvents = eventsByDate[key] || [];

                    return (
                      <div
                        key={di}
                        onClick={() => setSelectedDayKey(key)}
                        className={cn(
                          "p-1.5 md:p-2 flex flex-col justify-start transition-all cursor-pointer group relative hover:bg-muted/30",
                          isToday && "bg-primary/5",
                          isSelected && "ring-2 ring-primary ring-inset bg-primary/10"
                        )}
                      >
                        {/* Day Number Header */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={cn(
                              "inline-flex items-center justify-center text-xs font-bold w-6 h-6 rounded-full transition-all",
                              isToday
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : isSelected
                                ? "bg-primary/20 text-primary"
                                : "text-foreground group-hover:bg-muted"
                            )}
                          >
                            {day}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDayKey(key);
                              openAddDialog(key);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary p-0.5 rounded transition-all"
                            title="Add event for this date"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Classified Event Chips */}
                        <div className="space-y-1 overflow-hidden flex-1">
                          {dayEvents.slice(0, 3).map((ev) => {
                            const style = getCategoryStyle(ev);
                            return (
                              <div
                                key={ev.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveEvent(ev);
                                }}
                                className={cn(
                                  "px-2 py-1 rounded text-xs font-semibold leading-tight truncate transition-all flex items-center justify-between gap-1 shadow-2xs cursor-pointer active:scale-98",
                                  style.chip,
                                  ev.completed && "line-through opacity-70"
                                )}
                                title={`${ev.title} (${style.label})`}
                              >
                                <span className="truncate">{ev.title}</span>
                                {ev.time && <span className="text-[10px] font-mono shrink-0 opacity-90">{ev.time}</span>}
                              </div>
                            );
                          })}

                          {dayEvents.length > 3 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDayKey(key);
                              }}
                              className="text-[10px] font-bold text-primary hover:underline px-1 block"
                            >
                              +{dayEvents.length - 3} more agendas
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Mode: Agenda List */}
      {viewMode === "list" && (
        <Card className="border border-border shadow-sm bg-card">
          <CardContent className="p-4 md:p-6 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Agenda Chronological List</h2>
            {Object.keys(eventsByDate).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No events scheduled.</p>
            ) : (
              Object.keys(eventsByDate)
                .sort()
                .map((dKey) => (
                  <div key={dKey} className="border-b border-border last:border-0 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold font-mono bg-muted text-foreground px-2 py-0.5 rounded">
                        {new Date(dKey + "T00:00:00").toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="space-y-2 pl-2">
                      {eventsByDate[dKey].map((ev) => {
                        const style = getCategoryStyle(ev);
                        return (
                          <div
                            key={ev.id}
                            onClick={() => setActiveEvent(ev)}
                            className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border/60 hover:bg-muted/40 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Badge variant="outline" className={cn("text-[10px] shrink-0 font-bold", style.badge)}>
                                {style.label}
                              </Badge>
                              <span className={cn("text-sm font-semibold text-foreground truncate", ev.completed && "line-through text-muted-foreground")}>
                                {ev.title}
                              </span>
                              {ev.subLabel && <span className="text-xs text-muted-foreground truncate">&bull; {ev.subLabel}</span>}
                            </div>
                            {ev.time && <span className="text-xs font-mono text-muted-foreground shrink-0">{ev.time}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected Day Event Summary Drawer */}
      {selectedDayKey && (
        <Card className="border border-primary/30 bg-primary/5 shadow-sm">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                {new Date(selectedDayKey + "T00:00:00").toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedDayEvents.length} event/target scheduled for this date.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => openAddDialog(selectedDayKey)} className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Task / Event
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedDayKey(null)} className="text-xs">
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Detail Modal Popover */}
      <Dialog open={!!activeEvent} onOpenChange={(v) => !v && setActiveEvent(null)}>
        {activeEvent && (
          <DialogContent className="sm:max-w-md">
            <div className={cn("p-4 -mx-6 -mt-6 border-b rounded-t-lg", getCategoryStyle(activeEvent).border)}>
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline" className={cn("text-xs font-bold", getCategoryStyle(activeEvent).badge)}>
                  {getCategoryStyle(activeEvent).label}
                </Badge>
                <span className="text-xs font-mono font-bold text-muted-foreground">{activeEvent.date}</span>
              </div>
              <h2 className={cn("text-lg font-bold text-foreground", activeEvent.completed && "line-through opacity-70")}>
                {activeEvent.title}
              </h2>
            </div>

            <div className="space-y-4 py-3 text-sm">
              {activeEvent.time && (
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-mono">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Time: {activeEvent.time}</span>
                </div>
              )}

              {activeEvent.subLabel && (
                <div>
                  <Label className="text-xs text-muted-foreground">Category / Program</Label>
                  <p className="font-semibold text-foreground">{activeEvent.subLabel}</p>
                </div>
              )}

              {activeEvent.description && (
                <div>
                  <Label className="text-xs text-muted-foreground">Description / Notes</Label>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed bg-muted/40 p-2.5 rounded-lg border border-border whitespace-pre-wrap">
                    {activeEvent.description}
                  </p>
                </div>
              )}

              {activeEvent.priority && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Priority:</span>
                  <Badge variant="outline" className="text-xs font-semibold">
                    {activeEvent.priority}
                  </Badge>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0 border-t pt-3">
              {activeEvent.type === "goal" && activeEvent.rawObject && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleGoal(activeEvent.rawObject as Goal)}
                >
                  {activeEvent.completed ? (
                    <>
                      <Circle className="w-4 h-4 mr-1.5" /> Mark Uncompleted
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> Mark Completed
                    </>
                  )}
                </Button>
              )}

              {activeEvent.type === "reminder" && activeEvent.rawObject && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleReminder(activeEvent.rawObject as ReminderItem)}
                >
                  {activeEvent.completed ? (
                    <>
                      <Circle className="w-4 h-4 mr-1.5" /> Mark Uncompleted
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" /> Mark Completed
                    </>
                  )}
                </Button>
              )}

              {activeEvent.type === "deadline" && (
                <Button
                  size="sm"
                  onClick={() => {
                    setActiveEvent(null);
                    setLocation("/universities");
                  }}
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View Universities
                </Button>
              )}

              <Button variant="ghost" size="sm" onClick={() => setActiveEvent(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Comprehensive Add Event / Task / Goal Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Event / Task / Goal</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div>
              <Label htmlFor="quick-goal-title">Title</Label>
              <Input
                id="quick-goal-title"
                placeholder="e.g. Tugas Miss Lydia PPKN SWOT / Lomba Gebyar ULM"
                value={addGoalTitle}
                onChange={(e) => setAddGoalTitle(e.target.value)}
                className="mt-1"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={addGoalCategory} onValueChange={setAddGoalCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tugas Sekolah">Tugas Sekolah</SelectItem>
                    <SelectItem value="Lomba">Lomba / Competition</SelectItem>
                    <SelectItem value="Project">Projek Akademik</SelectItem>
                    <SelectItem value="Application">Scholarship Apply</SelectItem>
                    <SelectItem value="Language">Language / Test Prep</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select value={addGoalPriority} onValueChange={(v) => setAddGoalPriority(v as any)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={addGoalStartDate}
                  onChange={(e) => setAddGoalStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="end-date">Deadline Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={addGoalDeadline}
                  onChange={(e) => setAddGoalDeadline(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="time-input">Time (Optional)</Label>
                <Input
                  id="time-input"
                  type="time"
                  value={addGoalTime}
                  onChange={(e) => setAddGoalTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="desc-notes">Notes / Description</Label>
              <Textarea
                id="desc-notes"
                placeholder="Additional notes, instructions, or sub-tasks..."
                value={addGoalDescription}
                onChange={(e) => setAddGoalDescription(e.target.value)}
                className="mt-1 min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddGoal} disabled={!addGoalTitle.trim()}>
              Save Event / Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
