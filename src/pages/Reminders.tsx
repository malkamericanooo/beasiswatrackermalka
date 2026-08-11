import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlarmClock, BookOpen, CheckCircle2,
  ChevronLeft, ChevronRight, Circle, Clock, Coffee, Dumbbell,
  FileEdit, GraduationCap, Inbox, Plus, Send, Sparkles, Trash2
} from "lucide-react";
import {
  format, addDays, startOfDay, addWeeks, subWeeks,
  parseISO, differenceInMinutes, isToday
} from "date-fns";
import { toast } from "sonner";
import { getReminders, saveReminders } from "@/store/data";
import { ReminderItem } from "@/types";

const CATEGORY_ICONS = [
  { id: "sat", label: "SAT Study", icon: BookOpen, color: "text-amber-500 bg-amber-500/10 border-amber-200" },
  { id: "essay", label: "Essay Writing", icon: FileEdit, color: "text-purple-500 bg-purple-500/10 border-purple-200" },
  { id: "uni", label: "Uni Research", icon: GraduationCap, color: "text-blue-500 bg-blue-500/10 border-blue-200" },
  { id: "mail", label: "Email / Submit", icon: Send, color: "text-emerald-500 bg-emerald-500/10 border-emerald-200" },
  { id: "fitness", label: "Exercise", icon: Dumbbell, color: "text-orange-500 bg-orange-500/10 border-orange-200" },
  { id: "rest", label: "Rest / Break", icon: Coffee, color: "text-rose-500 bg-rose-500/10 border-rose-200" },
  { id: "general", label: "Task / Goal", icon: AlarmClock, color: "text-indigo-500 bg-indigo-500/10 border-indigo-200" },
];

function pickCategoryIcon(iconId?: string, title: string = "") {
  if (iconId) {
    const found = CATEGORY_ICONS.find(c => c.id === iconId);
    if (found) return found;
  }
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return CATEGORY_ICONS[Math.abs(hash) % CATEGORY_ICONS.length];
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.warn("Audio Context sound failed:", e);
  }
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: format(today, "yyyy-MM-dd"),
    startTime: "",
    durationHours: 1,
    iconId: "general"
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  // Query all reminders
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

  // Smart suggestions logic
  const suggestions = allReminders
    .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .map(r => ({ id: r.id, activityName: r.title, lastDuration: r.durationHours, iconId: r.iconId }))
    .filter((v, i, a) => a.findIndex(t => (t.activityName === v.activityName)) === i);

  const todayStr = format(today, "yyyy-MM-dd");
  const todayReminders = allReminders.filter(r => r.date === todayStr);

  // Notification and chime check
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
          playNotificationSound();
          toast(`Reminder: ${r.title}`, {
            description: `Waktunya dimulai! (${r.startTime}) — Duration: ${r.durationHours}h`,
            icon: "🔔"
          });
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`UofT Target Reminder: ${r.title}`, {
              body: `${r.description || 'Agenda'} - ${r.startTime} (${r.durationHours}h)`,
              icon: "/uoft-logo.svg"
            });
          }
          updateRem.mutate({ id: r.id, data: { isNotified: true } });
        }
      }
    });
  }, [todayReminders, updateRem]);

  const openDialog = (date?: string, time?: string, existing?: ReminderItem) => {
    if (existing) {
      setFormData({
        title: existing.title,
        description: existing.description || "",
        date: existing.date,
        startTime: existing.startTime || "",
        durationHours: existing.durationHours || 1,
        iconId: existing.iconId || "general",
      });
      setEditingId(existing.id);
    } else {
      setFormData({
        title: "",
        description: "",
        date: date || format(selectedDay, "yyyy-MM-dd"),
        startTime: time || "",
        durationHours: 1,
        iconId: "general",
      });
      setEditingId(null);
    }
    setSearchQuery("");
    setShowSuggestions(false);
    setDialogOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingId) {
      updateRem.mutate({
        id: editingId,
        data: {
          title: formData.title.trim(),
          description: formData.description || undefined,
          date: formData.date,
          startTime: formData.startTime || null,
          durationHours: formData.durationHours,
          iconId: formData.iconId,
        }
      }, {
        onSuccess: () => {
          setDialogOpen(false);
          toast.success("Task updated");
        }
      });
    } else {
      createRem.mutate({
        title: formData.title.trim(),
        description: formData.description || undefined,
        date: formData.date,
        startTime: formData.startTime || null,
        endTime: null,
        durationHours: formData.durationHours,
        reminderMinutesBefore: 15,
        iconId: formData.iconId,
      }, {
        onSuccess: () => {
          setDialogOpen(false);
          toast.success("Task added");
        }
      });
    }
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

  const startStr = format(weekStart, "yyyy-MM-dd");
  const endStr = format(days[6], "yyyy-MM-dd");

  const allWeekUnscheduled = allReminders.filter(r =>
    !r.startTime &&
    r.date >= startStr &&
    r.date <= endStr
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] overflow-hidden bg-background">
      {/* Main Timeline Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Week Header */}
        <div className="border-b bg-card px-3 md:px-5 py-3 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg md:text-xl text-foreground">
                {format(weekStart, "MMMM")}
              </span>
              <span className="font-serif font-bold text-lg md:text-xl text-primary">
                {format(weekStart, "yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8"
                onClick={() => { setWeekStart(subWeeks(weekStart, 1)); }}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-xs h-8 px-2 md:px-3"
                onClick={() => { setWeekStart(today); setSelectedDay(today); }}>
                Today
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"
                onClick={() => { setWeekStart(addWeeks(weekStart, 1)); }}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 7 Day pills selector bar */}
          <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
            {days.map((day) => {
              const dStr = format(day, "yyyy-MM-dd");
              const hasItems = allReminders.some(r => r.date === dStr);
              const isSel = dStr === selectedDateStr;
              const isTdy = isToday(day);
              return (
                <button
                  key={dStr}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 min-w-[42px] flex flex-col items-center py-1.5 px-1 rounded-lg transition-all cursor-pointer ${
                    isSel
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : isTdy
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider font-medium mb-0.5">
                    {format(day, "EEE")}
                  </span>
                  <span className={`text-sm md:text-base font-bold leading-none ${isTdy && !isSel ? "text-primary" : ""}`}>
                    {format(day, "d")}
                  </span>
                  {hasItems && (
                    <div className={`flex gap-0.5 mt-1 ${isSel ? "opacity-90" : ""}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isSel ? "bg-primary-foreground" : "bg-primary"}`} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline scroll area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
              Loading reminders...
            </div>
          ) : timedReminders.length === 0 && unscheduled.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground py-16">
              <Clock className="w-12 h-12 opacity-20" />
              <p className="text-sm font-medium">Belum ada agenda untuk {format(selectedDay, "EEEE, d MMM")}</p>
              <Button variant="outline" size="sm" onClick={() => openDialog(selectedDateStr)}>
                <Plus className="w-4 h-4 mr-1.5" /> Tambah Agenda Baru
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Timed tasks timeline */}
              {timedReminders.length > 0 && (
                <div className="relative">
                  {timedReminders.map((rem, idx) => {
                    const iconConfig = pickCategoryIcon(rem.iconId, rem.title);
                    const CategoryIcon = iconConfig.icon;
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
                        <div className="flex items-start gap-3 md:gap-4 group">
                          {/* Time label */}
                          <div className="w-12 shrink-0 text-right pt-2">
                            <span className="text-xs font-mono font-semibold text-muted-foreground leading-none">
                              {rem.startTime?.slice(0, 5) ?? "—"}
                            </span>
                          </div>

                          {/* Spine + Icon */}
                          <div className="flex flex-col items-center shrink-0 relative pt-1">
                            {idx > 0 && (
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-6 border-l-2 border-dashed border-muted-foreground/25" />
                            )}
                            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm ring-2 shrink-0 z-10 ${
                              rem.isCompleted
                                ? "bg-slate-800 ring-slate-700 text-slate-300"
                                : `${iconConfig.color} ring-primary/20`
                            }`}>
                              <CategoryIcon className="w-4 h-4" />
                            </div>
                          </div>

                          {/* Card */}
                          <div
                            onClick={() => openDialog(undefined, undefined, rem)}
                            className={`flex-1 mb-2 rounded-xl border px-3 md:px-4 py-3 transition-all cursor-pointer ${
                              rem.isCompleted
                                ? "bg-slate-900 text-white border-slate-800 opacity-90 shadow-sm"
                                : "bg-card border-border shadow-sm hover:border-primary/40 hover:shadow-md"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                                    rem.isCompleted ? "bg-slate-800 text-slate-300" : "bg-muted text-muted-foreground"
                                  }`}>
                                    {rem.startTime?.slice(0, 5)} · {rem.durationHours} jam
                                  </span>
                                  {rem.iconId && (
                                    <span className="text-[10px] font-medium text-primary/80">
                                      {iconConfig.label}
                                    </span>
                                  )}
                                </div>
                                <p className={`font-semibold text-sm leading-tight ${rem.isCompleted ? "line-through text-slate-300" : "text-foreground"}`}>
                                  {rem.title}
                                </p>
                                {rem.description && (
                                  <p className={`text-xs mt-1 leading-snug ${rem.isCompleted ? "text-slate-400" : "text-muted-foreground"}`}>{rem.description}</p>
                                )}
                              </div>

                              <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={() => handleDelete(rem.id)}
                                  className={`p-1 rounded transition-opacity ${rem.isCompleted ? "opacity-100 text-slate-400 hover:text-red-400" : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleComplete(rem.id)}
                                  className={`p-0.5 rounded-full transition-colors ${
                                    rem.isCompleted ? "text-emerald-400" : "text-muted-foreground/40 hover:text-primary"
                                  }`}
                                >
                                  {rem.isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Gap between tasks */}
                        {(gapText || idx < timedReminders.length - 1) && (
                          <div className="flex items-center gap-3 md:gap-4 my-1">
                            <div className="w-12 shrink-0" />
                            <div className="flex flex-col items-center shrink-0 w-10">
                              <div className="w-px h-6 border-l-2 border-dashed border-muted-foreground/25" />
                            </div>
                            <div className="flex-1 flex items-center gap-3">
                              {gapText && (
                                <span className="text-xs text-muted-foreground/70 flex items-center gap-1 font-mono">
                                  <Clock className="w-3 h-3" />
                                  {gapText}
                                </span>
                              )}
                              <button
                                onClick={() => openDialog(selectedDateStr)}
                                className="text-xs text-primary/80 hover:text-primary flex items-center gap-1 transition-colors ml-auto py-0.5 px-2 rounded hover:bg-primary/5"
                              >
                                <Plus className="w-3 h-3" />
                                Tambah Task
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Unscheduled for selected day */}
              {unscheduled.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Unscheduled Tasks</p>
                  <div className="space-y-2">
                    {unscheduled.map(rem => {
                      const iconConfig = pickCategoryIcon(rem.iconId, rem.title);
                      const CategoryIcon = iconConfig.icon;
                      return (
                        <div
                          key={rem.id}
                          onClick={() => openDialog(undefined, undefined, rem)}
                          className={`group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                            rem.isCompleted ? "bg-slate-900 text-white border-slate-800 opacity-95 shadow-sm" : "bg-card border-border hover:border-primary/40 hover:shadow-sm"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            rem.isCompleted ? "bg-slate-800 text-slate-300" : `${iconConfig.color}`
                          }`}>
                            <CategoryIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold leading-tight ${rem.isCompleted ? "line-through text-slate-300" : ""}`}>
                              {rem.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleDelete(rem.id)}
                              className={`p-1 transition-opacity ${rem.isCompleted ? "opacity-100 text-slate-400 hover:text-red-400" : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleComplete(rem.id)}
                              className={`p-0.5 transition-colors ${rem.isCompleted ? "text-emerald-400" : "text-muted-foreground/40 hover:text-primary"}`}
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

      {/* Inbox Panel (Side panel for desktop / Bottom panel for mobile) */}
      <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l bg-card/50 flex flex-col shrink-0">
        <div className="px-4 md:px-5 py-3 md:py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-sm text-foreground">Weekly Inbox</span>
            {allWeekUnscheduled.length > 0 && (
              <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                {allWeekUnscheduled.length}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => openDialog(selectedDateStr)} className="text-xs gap-1">
            <Plus className="w-3.5 h-3.5" /> Task
          </Button>
        </div>

        <div className="max-h-48 lg:max-h-none flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {allWeekUnscheduled.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 text-muted-foreground/50 gap-1.5">
              <Inbox className="w-6 h-6 opacity-30" />
              <p className="text-xs text-center">Semua task minggu ini sudah terjadwal</p>
            </div>
          ) : (
            allWeekUnscheduled.map(rem => {
              const iconConfig = pickCategoryIcon(rem.iconId, rem.title);
              const CategoryIcon = iconConfig.icon;
              return (
                <div
                  key={rem.id}
                  onClick={() => openDialog(undefined, undefined, rem)}
                  className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all cursor-pointer ${
                    rem.isCompleted ? "bg-slate-900 text-white border-slate-800 opacity-90 shadow-sm" : "bg-background border-border hover:border-primary/40 hover:shadow-sm"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    rem.isCompleted ? "bg-slate-800 text-slate-300" : `${iconConfig.color}`
                  }`}>
                    <CategoryIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold leading-tight truncate ${rem.isCompleted ? "line-through text-slate-300" : ""}`}>
                      {rem.title}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${rem.isCompleted ? "text-slate-400" : "text-muted-foreground/70"}`}>
                      {format(parseISO(rem.date), "EEE, d MMM")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleDelete(rem.id)}
                      className={`p-1 transition-opacity ${rem.isCompleted ? "opacity-100 text-slate-400 hover:text-red-400" : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleComplete(rem.id)}
                      className={`p-0.5 ${rem.isCompleted ? "text-emerald-400" : "text-muted-foreground/40 hover:text-primary"}`}
                    >
                      {rem.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating add button (mobile) */}
      <button
        onClick={() => openDialog(selectedDateStr)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95 z-50 ring-4 ring-background"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* Add / Edit Agenda Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {editingId ? "Edit Agenda" : "Tambah Agenda Structured"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-3">
              {/* Category / Icon Picker */}
              <div className="space-y-1.5">
                <Label className="text-xs">Category / Icon</Label>
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {CATEGORY_ICONS.map(c => {
                    const IconComponent = c.icon;
                    const isSelected = formData.iconId === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, iconId: c.id })}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium shrink-0 transition-all ${
                          isSelected ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm" : "bg-card border-border hover:bg-muted text-muted-foreground"
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                        <span>{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title with Smart Autocomplete & Remembered Duration */}
              <div className="space-y-1.5 relative">
                <Label htmlFor="title" className="text-xs">Nama Agenda / Kegiatan</Label>
                <Input
                  id="title"
                  ref={titleInputRef}
                  required
                  autoFocus
                  autoComplete="off"
                  placeholder="Contoh: Mau belajar SAT, Draft SOP, dsb."
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {showSuggestions && suggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-xl overflow-hidden divide-y divide-border/40">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 py-1.5 bg-muted/50">
                      Rekomendasi dari riwayat
                    </p>
                    {suggestions.slice(0, 5).map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setFormData({
                            ...formData,
                            title: s.activityName,
                            durationHours: s.lastDuration || 1,
                            iconId: s.iconId || formData.iconId
                          });
                          setSearchQuery("");
                          setShowSuggestions(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-accent text-sm text-left transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="font-medium text-foreground">{s.activityName}</span>
                        </div>
                        <span className="text-xs font-mono font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {s.lastDuration} jam (auto)
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc" className="text-xs">Catatan (opsional)</Label>
                <Input
                  id="desc"
                  placeholder="Detail agenda..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-xs">Tanggal</Label>
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
                  <Label htmlFor="time" className="text-xs">Jam Mulai (opsional)</Label>
                  <Input
                    type="time"
                    id="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="duration" className="text-xs">Durasi (jam, bisa diedit)</Label>
                  <Input
                    type="number"
                    id="duration"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={formData.durationHours}
                    onChange={(e) => setFormData({ ...formData, durationHours: parseFloat(e.target.value) || 1 })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={createRem.isPending || updateRem.isPending}>
                {createRem.isPending || updateRem.isPending ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Agenda"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
