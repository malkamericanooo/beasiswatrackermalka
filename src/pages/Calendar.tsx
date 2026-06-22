import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUniversities, getGoals } from "@/store/data";
import { getDaysLeft } from "@/lib/scoring";
import type { University, Goal } from "@/types";
import { cn } from "@/lib/utils";

type CalEvent = {
  date: string;
  label: string;
  type: "deadline" | "goal" | "opens";
  subLabel?: string;
};

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

function formatDateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CalendarPage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [events, setEvents] = useState<CalEvent[]>([]);

  useEffect(() => {
    Promise.all([getUniversities(), getGoals()]).then(([unis, goals]) => {
      const evs: CalEvent[] = [];

      (unis as University[]).forEach((u) => {
        evs.push({ date: u.deadline.slice(0, 10), label: u.shortName, subLabel: "Deadline", type: "deadline" });
        if (u.applicationOpens) {
          evs.push({ date: u.applicationOpens.slice(0, 10), label: u.shortName, subLabel: "Opens", type: "opens" });
        }
      });

      (goals as Goal[]).filter((g) => g.deadline && !g.completed).forEach((g) => {
        evs.push({ date: g.deadline!, label: g.title, type: "goal" });
      });

      setEvents(evs);
    });
  }, []);

  const eventsByDate: Record<string, CalEvent[]> = {};
  events.forEach((e) => {
    if (!eventsByDate[e.date]) eventsByDate[e.date] = [];
    eventsByDate[e.date].push(e);
  });

  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const weeks = getMonthMatrix(viewYear, viewMonth);
  const selectedEvents = selectedDay ? (eventsByDate[selectedDay] || []) : [];

  const upcomingEvents = events
    .filter((e) => {
      const d = new Date(e.date);
      return d >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-foreground mb-1">Calendar</h1>
      <p className="text-muted-foreground text-sm mb-8">Track all your application deadlines and goals.</p>

      <div className="grid grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="col-span-2">
          <CardContent className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <button
                data-testid="btn-prev-month"
                onClick={prevMonth}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="font-semibold text-foreground">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h2>
              <button
                data-testid="btn-next-month"
                onClick={nextMonth}
                className="p-1.5 rounded-md hover:bg-muted transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_NAMES.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7">
                {week.map((day, di) => {
                  if (day === null) return <div key={di} className="h-12" />;
                  const key = formatDateKey(viewYear, viewMonth, day);
                  const hasEvents = !!eventsByDate[key];
                  const isToday = key === todayKey;
                  const isSelected = key === selectedDay;
                  const evs = eventsByDate[key] || [];
                  const hasDeadline = evs.some(e => e.type === "deadline");
                  const hasGoal = evs.some(e => e.type === "goal");

                  return (
                    <button
                      key={di}
                      data-testid={`calendar-day-${key}`}
                      onClick={() => setSelectedDay(isSelected ? null : key)}
                      className={cn(
                        "h-12 flex flex-col items-center justify-start pt-1.5 rounded-lg text-sm transition-colors relative",
                        isToday && !isSelected && "border-2 border-primary font-bold",
                        isSelected && "bg-primary text-primary-foreground",
                        !isSelected && "hover:bg-muted"
                      )}
                    >
                      <span>{day}</span>
                      {hasEvents && (
                        <div className="flex gap-0.5 mt-0.5">
                          {hasDeadline && (
                            <span className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-white" : "bg-rose-500")} />
                          )}
                          {hasGoal && (
                            <span className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-white/70" : "bg-amber-500")} />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Legend */}
            <div className="flex gap-4 mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Deadline
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Goal
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Selected Day Events */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3">
                {selectedDay
                  ? new Date(selectedDay + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                  : "Select a date"}
              </h3>
              {!selectedDay && (
                <p className="text-xs text-muted-foreground">Click on a day to see events.</p>
              )}
              {selectedDay && selectedEvents.length === 0 && (
                <p className="text-xs text-muted-foreground">No deadlines or goals scheduled for this date.</p>
              )}
              <div className="space-y-2">
                {selectedEvents.map((e, i) => (
                  <div key={i} className="text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("w-2 h-2 rounded-full shrink-0",
                        e.type === "deadline" ? "bg-rose-500" : e.type === "opens" ? "bg-sky-500" : "bg-amber-500"
                      )} />
                      <span className="font-medium text-foreground">{e.label}</span>
                    </div>
                    {e.subLabel && <p className="text-xs text-muted-foreground ml-3.5">{e.subLabel}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Upcoming</h3>
              </div>
              <div className="space-y-2.5">
                {upcomingEvents.length === 0 && (
                  <p className="text-xs text-muted-foreground">No upcoming events.</p>
                )}
                {upcomingEvents.map((e, i) => {
                  const days = getDaysLeft(e.date);
                  return (
                    <div key={i} className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-1.5 min-w-0">
                        <span className={cn("w-2 h-2 rounded-full shrink-0 mt-1",
                          e.type === "deadline" ? "bg-rose-500" : e.type === "opens" ? "bg-sky-500" : "bg-amber-500"
                        )} />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{e.label}</p>
                          <p className="text-xs text-muted-foreground">{e.subLabel || "Goal"}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn("text-xs shrink-0",
                        days !== null && days <= 30 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-sky-50 text-sky-700 border-sky-200"
                      )}>
                        {days === 0 ? "Today" : days !== null ? `${days}d` : "—"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
