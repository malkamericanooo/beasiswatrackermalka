import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlarmClock, Bell, BookOpen, BriefcaseBusiness, CheckCircle2,
  ChevronLeft, ChevronRight, Circle, Clock, FileEdit, Inbox,
  Plus, Send, Trash2
} from "lucide-react";
import {
  format, addDays, startOfDay, addWeeks, subWeeks,
  parseISO, differenceInMinutes, isToday
} from "date-fns";
import { toast } from "sonner";
import { getReminders, saveReminders } from "@/store/data";
import { ReminderItem } from "@/types";

const TASK_ICONS = [AlarmClock, BookOpen, BriefcaseBusiness, FileEdit, Send, Bell];

function pickIcon(title: string) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  const Icon = TASK_ICONS[Math.abs(hash) % TASK_ICONS.length];
  return Icon;
}

function formatGap(minutes: number) {
  if (minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m gap until next task`;
  if (m === 0) return `${h}h gap until next task`;
  return `${h}h ${m}m gap until next task`;
}

export default function Reminders() {
  const queryClient = useQueryClient();
  const today = startOfDay(new Date());
  const [weekStart, setWeekStart] = useState(today);
  const [selectedDay, setSelectedDay] = useState(today);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", date: format(today, "yyyy-MM-dd"),
    startTime: "", durationHours: 1,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  
  // Use React Query for all reminders
  const { data: allReminders = [], isLoading } = useQuery<ReminderItem[]>({
    queryKey: ["reminders"],
    queryFn: getReminders,
  });

  const createRem = useMutation({
    mutationFn: async (newReminder: Omit<ReminderItem, "id" | "createdAt" | "isCompleted" | "isNotified">) => {
      const reminder: ReminderItem = {
        ...newReminder,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        isCompleted: false,
        isNotified: false,
      };
      const updated = [...allReminders, reminder];
      await saveReminders(updated);
      return reminder;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] })
  });

  const completeRem = useMutation({
    mutationFn: async (id: number) => {
      const updated = allReminders.map(r => r.id === id ? { ...r, isCompleted: !r.isCompleted } : r);
      await saveReminders(updated);
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] })
  });

  const deleteRem = useMutation({
    mutationFn: async (id: number) => {
      const updated = allReminders.filter(r => r.id !== id);
      await saveReminders(updated);
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] })
  });

  const updateRem = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<ReminderItem> }) => {
      const updated = allReminders.map(r => r.id === id ? { ...r, ...data } : r);
      await saveReminders(updated);
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders"] })
  });

  // Suggestions logic (simple local search of past tasks)
  const suggestions = allReminders
    .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(r => ({ id: r.id, activityName: r.title, lastDuration: r.durationHours }))
    .filter((v, i, a) => a.findIndex(t => (t.activityName === v.activityName)) === i);

  const todayStr = format(today, "yyyy-MM-dd");
  const todayReminders = allReminders.filter(r => r.date === todayStr);

  // Notification check
  useEffect(() => {
    if (!todayReminders.length) return;
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    const now = new Date();
    todayReminders.forEach(r => {
      if (!r.isCompleted && !r.isNotified && r.startTime) {
        const remTime = parseISO(`${r.date}T${r.startTime}`);
        const diffMinutes = (remTime.getTime() - now.getTime()) / (1000 * 60);
        if (diffMinutes > 0 && diffMinutes <= (r.reminderMinutesBefore || 15)) {
          toast(`Reminder: ${r.title}`, { description: r.description || "Upcoming task", icon: "🔔" });
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`Reminder: ${r.title}`, { body: r.description || "Upcoming scholarship task" });
          }
          updateRem.mutate({ id: r.id, data: { isNotified: true } });
        }
      }
    });
  }, [todayReminders, updateRem]);

  const openDialog = (date?: string, time?: string) => {
    setFormData({
      title: "", description: "",
      date: date || format(selectedDay, "yyyy-MM-dd"),
      startTime: time || "",
      durationHours: 1,
    });
    setSearchQuery("");
    setShowSuggestions(false);
    setDialogOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    createRem.mutate({
      title: formData.title.trim(),
      description: formData.description || undefined,
      date: formData.date,
      startTime: formData.startTime || null,
      endTime: null,
      durationHours: formData.durationHours,
      reminderMinutesBefore: 15,
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        toast.success("Task added");
      }
    });
  };


  const handleComplete = (id: number) => {
    completeRem.mutate(id);
  };

  const handleDelete = (id: number) => {
    deleteRem.mutate(id, {
      onSuccess: () => { toast.success("Task deleted"); }
    });
  };

  const selectedDateStr = format(selectedDay, "yyyy-MM-dd");
  const selectedReminders = allReminders
    .filter(r => r.date === selectedDateStr)
    .sort((a, b) => (a.startTime || "99:99").localeCompare(b.startTime || "99:99"));

  const timedReminders = selectedReminders.filter(r => r.startTime);
  const unscheduled = selectedReminders.filter(r => !r.startTime);

  // Filter unscheduled for the currently viewed week
  const startStr = format(weekStart, "yyyy-MM-dd");
  const endStr = format(days[6], "yyyy-MM-dd");
  
  const allWeekUnscheduled = allReminders.filter(r => 
    !r.startTime && 
    r.date >= startStr && 
    r.date <= endStr
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] overflow-hidden bg-background">
      {/* Main Timeline Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Week Header */}
        <div className="border-b bg-card px-4 py-3 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-xl text-foreground">
                {format(weekStart, "MMMM")}
              </span>
              <span className="font-serif font-bold text-xl text-primary">
                {format(weekStart, "yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8"
                onClick={() => { setWeekStart(subWeeks(weekStart, 1)); }}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-xs h-8 px-3"
                onClick={() => { setWeekStart(today); setSelectedDay(today); }}>
                Today
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"
                onClick={() => { setWeekStart(addWeeks(weekStart, 1)); }}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Day pills */}
          <div className="flex gap-1">
            {days.map((day) => {
              const dStr = format(day, "yyyy-MM-dd");
              const hasItems = allReminders.some(r => r.date === dStr);
              const isSel = dStr === selectedDateStr;
              const isTdy = isToday(day);
              return (
                <button
                  key={dStr}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 flex flex-col items-center py-1.5 px-1 rounded-lg transition-all cursor-pointer ${
                    isSel
                      ? "bg-primary text-primary-foreground"
                      : isTdy
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider font-medium mb-0.5">
                    {format(day, "EEE")}
                  </span>
                  <span className={`text-base font-bold leading-none ${isTdy && !isSel ? "text-primary" : ""}`}>
                    {format(day, "d")}
                  </span>
                  {hasItems && (
                    <div className={`flex gap-0.5 mt-1 ${isSel ? "opacity-70" : ""}`}>
                      <span className={`w-1 h-1 rounded-full ${isSel ? "bg-primary-foreground" : "bg-primary"}`} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline scroll area */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
              Loading...
            </div>
          ) : timedReminders.length === 0 && unscheduled.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground py-16">
              <Clock className="w-10 h-10 opacity-20" />
              <p className="text-sm">No tasks for {format(selectedDay, "EEEE, MMM d")}</p>
              <Button variant="outline" size="sm" onClick={() => openDialog(selectedDateStr)}>
                <Plus className="w-4 h-4 mr-1.5" /> Add task
              </Button>
            </div>
          ) : (
            <div className="px-6 py-6">
              {/* Timed tasks — timeline */}
              {timedReminders.length > 0 && (
                <div className="relative">
                  {timedReminders.map((rem, idx) => {
                    const TaskIcon = pickIcon(rem.title);
                    const nextRem = timedReminders[idx + 1];
                    let gapText: string | null = null;
                    if (nextRem && rem.startTime && nextRem.startTime) {
                      const endMin = parseISO(`${rem.date}T${rem.startTime}`);
                      const startMin = parseISO(`${rem.date}T${nextRem.startTime}`);
                      const gap = differenceInMinutes(startMin, endMin) - ((rem.durationHours ?? 1) * 60);
                      gapText = formatGap(Math.max(0, gap));
                    }

                    return (
                      <div key={rem.id}>
                        {/* Task row */}
                        <div className="flex items-start gap-4 group">
                          {/* Time label */}
                          <div className="w-12 shrink-0 text-right">
                            <span className="text-xs font-mono text-muted-foreground leading-none">
                              {rem.startTime?.slice(0, 5) ?? "—"}
                            </span>
                          </div>

                          {/* Timeline spine + icon */}
                          <div className="flex flex-col items-center shrink-0 relative">
                            {/* Dot / line from previous */}
                            {idx > 0 && (
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-6 border-l-2 border-dashed border-muted-foreground/25" />
                            )}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ring-2 shrink-0 z-10 ${
                              rem.isCompleted
                                ? "bg-muted ring-muted text-muted-foreground"
                                : "bg-primary/10 ring-primary/20 text-primary"
                            }`}>
                              <TaskIcon className="w-4 h-4" />
                            </div>
                          </div>

                          {/* Card */}
                          <div className={`flex-1 mb-1 rounded-xl border px-4 py-3 transition-all ${
                            rem.isCompleted
                              ? "bg-muted/30 border-muted opacity-60"
                              : "bg-card border-border shadow-sm"
                          }`}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[10px] font-mono text-muted-foreground">
                                    {rem.startTime?.slice(0, 5)}
                                    {rem.durationHours ? ` · ${rem.durationHours}h` : ""}
                                  </span>
                                </div>
                                <p className={`font-semibold text-sm leading-tight ${rem.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                                  {rem.title}
                                </p>
                                {rem.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{rem.description}</p>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleDelete(rem.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleComplete(rem.id)}
                                  className={`p-0.5 rounded-full transition-colors ${
                                    rem.isCompleted
                                      ? "text-emerald-500"
                                      : "text-muted-foreground/40 hover:text-primary"
                                  }`}
                                >
                                  {rem.isCompleted
                                    ? <CheckCircle2 className="w-6 h-6" />
                                    : <Circle className="w-6 h-6" />
                                  }
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Gap + Add Task between events */}
                        {(gapText || idx < timedReminders.length - 1) && (
                          <div className="flex items-center gap-4 my-1">
                            <div className="w-12 shrink-0" />
                            <div className="flex flex-col items-center shrink-0">
                              <div className="w-px h-6 border-l-2 border-dashed border-muted-foreground/25" />
                            </div>
                            <div className="flex-1 flex items-center gap-3">
                              {gapText && (
                                <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {gapText}
                                </span>
                              )}
                              <button
                                onClick={() => openDialog(selectedDateStr)}
                                className="text-xs text-primary/70 hover:text-primary flex items-center gap-1 transition-colors ml-auto"
                              >
                                <Plus className="w-3 h-3" />
                                Add Task
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add after last timed task */}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="w-12 shrink-0" />
                    <div className="flex-col items-center shrink-0 w-10 flex">
                      <div className="w-px h-4 border-l-2 border-dashed border-muted-foreground/20" />
                    </div>
                    <button
                      onClick={() => openDialog(selectedDateStr)}
                      className="text-xs text-muted-foreground/50 hover:text-primary flex items-center gap-1.5 transition-colors py-1 px-2 rounded-lg hover:bg-primary/5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Task
                    </button>
                  </div>
                </div>
              )}

              {/* Unscheduled for this day */}
              {unscheduled.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Unscheduled</p>
                  <div className="space-y-2">
                    {unscheduled.map(rem => {
                      const TaskIcon = pickIcon(rem.title);
                      return (
                        <div key={rem.id} className={`group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                          rem.isCompleted ? "bg-muted/30 border-muted opacity-50" : "bg-card border-border shadow-sm"
                        }`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            rem.isCompleted ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                          }`}>
                            <TaskIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium leading-tight ${rem.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                              {rem.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleDelete(rem.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleComplete(rem.id)}
                              className={`p-0.5 transition-colors ${rem.isCompleted ? "text-emerald-500" : "text-muted-foreground/40 hover:text-primary"}`}
                            >
                              {rem.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Inbox Panel — right side, hidden on mobile */}
      <div className="hidden lg:flex w-72 border-l bg-card/50 flex-col shrink-0">
        <div className="px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-sm text-foreground">Inbox</span>
            {allWeekUnscheduled.length > 0 && (
              <span className="ml-auto text-xs bg-primary/10 text-primary font-medium px-1.5 py-0.5 rounded-full">
                {allWeekUnscheduled.length}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-snug">
            Tasks without a scheduled time this week.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {allWeekUnscheduled.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground/50 gap-2">
              <Inbox className="w-7 h-7 opacity-30" />
              <p className="text-xs text-center">All tasks are scheduled</p>
            </div>
          ) : (
            allWeekUnscheduled.map(rem => {
              const TaskIcon = pickIcon(rem.title);
              return (
                <div key={rem.id} className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-lg border bg-background transition-all ${
                  rem.isCompleted ? "opacity-40 border-muted" : "border-border/60 hover:border-border"
                }`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    rem.isCompleted ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                  }`}>
                    <TaskIcon className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium leading-tight truncate ${rem.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                      {rem.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {format(parseISO(rem.date), "EEE, MMM d")}
                    </p>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    <button
                      onClick={() => handleDelete(rem.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleComplete(rem.id)}
                      className={`p-0.5 ${rem.isCompleted ? "text-emerald-500" : "text-muted-foreground/40 hover:text-primary"}`}
                    >
                      {rem.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 py-4 border-t">
          <button
            onClick={() => openDialog(selectedDateStr)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-border text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            New Inbox Task
          </button>
        </div>
      </div>

      {/* Floating add button (mobile) */}
      <button
        onClick={() => openDialog(selectedDateStr)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95 z-50"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">New Task</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Title with autocomplete */}
              <div className="space-y-1.5 relative">
                <Label htmlFor="title">Task</Label>
                <Input
                  id="title"
                  ref={titleInputRef}
                  required
                  autoFocus
                  autoComplete="off"
                  placeholder="e.g. Write SOP draft"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                />
                {showSuggestions && suggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
                    {suggestions.slice(0, 5).map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setFormData({ ...formData, title: s.activityName, durationHours: s.lastDuration || 1 });
                          setSearchQuery("");
                          setShowSuggestions(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent text-sm text-left transition-colors"
                      >
                        <span>{s.activityName}</span>
                        <span className="text-xs text-muted-foreground">{s.lastDuration}h</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc">Notes (optional)</Label>
                <Input
                  id="desc"
                  placeholder="Any extra detail"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                  type="date"
                  id="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="time">Start time (optional)</Label>
                  <Input
                    type="time"
                    id="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="duration">Duration (hrs)</Label>
                  <Input
                    type="number"
                    id="duration"
                    step="0.5"
                    min="0.5"
                    value={formData.durationHours}
                    onChange={(e) => setFormData({ ...formData, durationHours: parseFloat(e.target.value) || 1 })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createRem.isPending}>
                {createRem.isPending ? "Saving..." : "Add Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
