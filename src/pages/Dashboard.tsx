import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ChevronRight, Check } from "lucide-react";
import { getUniversities, getGoals, getReminders, saveGoals, saveReminders, getWeeklyDrills } from "@/store/data";
import { getDaysLeft, sortByComposite } from "@/lib/scoring";
import type { University, Goal, ReminderItem, WeeklyDrillCategory } from "@/types";
import { cn } from "@/lib/utils";

type Urgency = "urgent" | "soon" | "ok" | "idle";

function getAppStatus(uni: University): "Ready to Submit" | "Submitted" | "Researching" | "Missing Data" {
  if (uni.status === "Submitted") return "Submitted";
  const total = uni.documents.length;
  const done = uni.documents.filter((d) => d.completed).length;
  if (total > 0 && done === total) return "Ready to Submit";
  const daysLeft = getDaysLeft(uni.deadline);
  if (done === 0 && daysLeft !== null && daysLeft <= 60) return "Missing Data";
  return "Researching";
}

/** One rule for how far away something is. Every deadline in the app reads
 *  through this, so a colour always means the same number of days. */
function urgencyOf(days: number | null): Urgency {
  if (days === null) return "idle";
  if (days <= 3) return "urgent";   // includes overdue
  if (days <= 14) return "soon";
  return "ok";
}

function dayLabel(days: number | null): string {
  if (days === null) return "—";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days`;
}

/** Small hairline-separated figure. Replaces the seven coloured stat cards. */
function Figure({ label, value, sub, testId }: { label: string; value: string | number; sub?: string; testId?: string }) {
  return (
    <div className="px-5 py-4 min-w-0">
      <p className="eyebrow">{label}</p>
      <p className="mt-1.5 font-mono text-2xl leading-none text-foreground" data-testid={testId}>
        {value}
      </p>
      {sub && <p className="mt-1.5 text-xs text-muted-foreground truncate">{sub}</p>}
    </div>
  );
}

function SectionHeader({ title, href, action }: { title: string; href?: string; action?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 mb-3">
      <h2 className="text-lg text-foreground">{title}</h2>
      {href && (
        <Link href={href}>
          <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors inline-flex items-center gap-0.5 shrink-0">
            {action ?? "View all"} <ChevronRight className="size-3" />
          </span>
        </Link>
      )}
    </div>
  );
}

function Tick({ done, onClick, label }: { done?: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "grid place-items-center size-4 shrink-0 rounded-sm border transition-colors cursor-pointer",
        done
          ? "bg-ok border-ok text-background"
          : "border-border hover:border-foreground/40 text-transparent"
      )}
    >
      <Check className="size-3" strokeWidth={3} />
    </button>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [universities, setUniversities] = useState<University[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [drills, setDrills] = useState<WeeklyDrillCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const reloadData = () => {
    Promise.all([getUniversities(), getGoals(), getReminders(), getWeeklyDrills()])
      .then(([u, g, r, d]) => {
        setUniversities(Array.isArray(u) ? (u as University[]) : []);
        setGoals(Array.isArray(g) ? (g as Goal[]) : []);
        setReminders(Array.isArray(r) ? (r as ReminderItem[]) : []);
        setDrills(Array.isArray(d) ? (d as WeeklyDrillCategory[]) : []);
      })
      .catch((err) => {
        console.error("Failed to load dashboard data:", err);
        setUniversities([]);
        setGoals([]);
        setReminders([]);
        setDrills([]);
      })
      .finally(() => setLoading(false));
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
    .slice(0, 6);

  const recentGoals = sortByComposite(goals.filter((g) => !g.completed)).slice(0, 6);

  const drillDone = drills.reduce((sum, d) => sum + d.completed, 0);
  const drillTarget = drills.reduce((sum, d) => sum + d.target, 0);
  const drillPct = drillTarget > 0 ? Math.round((drillDone / drillTarget) * 100) : 0;

  // 3-day focus: goals, agendas and deadlines landing within 72 hours.
  const items3Days: {
    id?: string;
    title: string;
    category: string;
    deadline: string;
    daysLeft: number;
    type: "goal" | "uni" | "reminder";
    priority?: string;
    completed?: boolean;
    raw?: Goal;
    rawReminder?: ReminderItem;
  }[] = [];

  goals.forEach((g) => {
    if (g.deadline) {
      const days = getDaysLeft(g.deadline);
      if (days !== null && days <= 3) {
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

  // Daily routine is stored as one dated row per day (161 rows over 25 days
  // for six repeating titles), so every day you do not tick it leaves another
  // permanent "overdue" entry. A missed habit on Thursday is not a deadline
  // that passed — surfacing it as one buries the scholarship deadlines that
  // genuinely are. Agenda rows therefore only appear from today forward.
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
        rawReminder: r,
      });
    }
  });

  universities.forEach((u) => {
    const days = getDaysLeft(u.deadline);
    if (days !== null && days <= 3) {
      items3Days.push({
        title: `${u.shortName || u.name} deadline`,
        category: u.program || "Scholarship",
        deadline: u.deadline,
        daysLeft: days,
        type: "uni",
        priority: u.priority,
      });
    }
  });

  // Open work first, then by how overdue. Recurring daily agendas can pile
  // up into dozens of overdue rows, so the panel shows a readable slice and
  // says how many it is holding back.
  items3Days.sort((a, b) => {
    if (!!a.completed !== !!b.completed) return a.completed ? 1 : -1;
    return a.daysLeft - b.daysLeft;
  });
  const openToday = items3Days.filter((i) => !i.completed).length;
  const FOCUS_LIMIT = 8;
  const focusItems = items3Days.slice(0, FOCUS_LIMIT);
  const focusHidden = items3Days.length - focusItems.length;

  const handleToggleGoal = async (g: Goal) => {
    const updated = goals.map((x) => (String(x.id) === String(g.id) ? { ...x, completed: !x.completed } : x));
    setGoals(updated);
    await saveGoals(updated);
    reloadData();
  };

  const handleToggleReminder = async (r: ReminderItem) => {
    const updated = reminders.map((x) => (String(x.id) === String(r.id) ? { ...x, isCompleted: !x.isCompleted } : x));
    setReminders(updated);
    await saveReminders(updated);
    reloadData();
  };

  const dateLine = today.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-[1180px] px-6 md:px-10 py-8 md:py-10">
      {/* ── Header. The target is a byline, not a billboard. ───────────── */}
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pb-5 border-b border-border">
        <div>
          <p className="eyebrow">{dateLine}</p>
          <h1 className="mt-1 text-2xl text-foreground">Dashboard</h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/uoft-crest-clean.png"
            alt=""
            aria-hidden
            className="h-9 w-auto object-contain opacity-90"
          />
          <div className="leading-tight">
            <p className="eyebrow">Target institution</p>
            <p className="text-sm font-medium text-foreground">University of Toronto</p>
            <p className="text-xs text-muted-foreground">Data Science HBSc · Admission 2026/27</p>
          </div>
        </div>
      </header>

      {/* ── Figures. One band, hairline-separated. Was 7 coloured cards. ─ */}
      <section className="mt-6 panel grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y lg:divide-y-0 divide-border overflow-hidden">
        <Figure label="Tracked" value={totalUnis} sub="universities" testId="stat-universities-count" />
        <Figure
          label="Due ≤ 30d"
          value={deadlines30}
          sub={deadlines30 === 0 ? "nothing imminent" : "approaching"}
          testId="stat-deadlines-count"
        />
        <Figure label="Researching" value={statusCounts["Researching"]} sub="in progress" testId="status-researching" />
        <Figure label="Ready" value={statusCounts["Ready to Submit"]} sub="docs complete" testId="status-ready-to-submit" />
        <Figure label="Submitted" value={statusCounts["Submitted"]} sub="sent off" testId="status-submitted" />
        <Figure
          label="Goals"
          value={`${doneGoals}/${totalGoals}`}
          sub={`${statusCounts["Missing Data"]} apps need docs`}
          testId="stat-goals-progress"
        />
      </section>

      {/* ── Today. First thing on the page, because it is the only part
             that asks you to do something. ────────────────────────────── */}
      <section className="mt-9">
        <SectionHeader title="Needs attention" href="/calendar" action="Calendar" />

        <div className="panel divide-y divide-border">
          {loading ? (
            <div className="px-5 py-8">
              <div className="h-3 w-40 rounded-sm bg-muted animate-pulse" />
              <div className="mt-3 h-3 w-64 rounded-sm bg-muted animate-pulse" />
            </div>
          ) : items3Days.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-foreground">Nothing overdue or due in the next three days.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your nearest deadline is {upcoming[0] ? `${upcoming[0].shortName || upcoming[0].name} in ${getDaysLeft(upcoming[0].deadline)} days` : "not set yet"}.
              </p>
            </div>
          ) : (
            focusItems.map((item, idx) => {
              const u = urgencyOf(item.daysLeft);
              const toggle = item.raw
                ? () => handleToggleGoal(item.raw!)
                : item.rawReminder
                  ? () => handleToggleReminder(item.rawReminder!)
                  : null;

              return (
                <div key={idx} className="group flex items-center gap-4 px-5 py-2.5">
                  {/* Urgency rail — the only colour in the row. */}
                  <span
                    aria-hidden
                    className={cn(
                      "h-7 w-0.5 rounded-full shrink-0",
                      u === "urgent" ? "bg-urgent" : u === "soon" ? "bg-soon" : "bg-border"
                    )}
                  />

                  {toggle ? (
                    <Tick done={item.completed} onClick={toggle} label={item.completed ? "Mark not done" : "Mark done"} />
                  ) : (
                    <span className="size-4 shrink-0" />
                  )}

                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm truncate",
                        item.completed ? "line-through text-muted-foreground" : "text-foreground"
                      )}
                    >
                      {item.title}
                    </p>
                  </div>

                  <span className="hidden sm:block text-xs text-muted-foreground truncate max-w-[180px] shrink-0">
                    {item.category}
                  </span>

                  <span className="font-mono text-xs text-muted-foreground shrink-0 w-[5.5rem] text-right">
                    {item.deadline}
                  </span>

                  <span
                    className={cn(
                      "chip shrink-0 w-[4.75rem] justify-center",
                      u === "urgent" ? "chip-urgent" : u === "soon" ? "chip-soon" : "chip-idle"
                    )}
                  >
                    {dayLabel(item.daysLeft)}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {items3Days.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            {openToday} of {items3Days.length} still open
            {focusHidden > 0 && (
              <>
                {" · "}
                <Link href="/calendar">
                  <span className="underline underline-offset-2 decoration-border hover:decoration-foreground cursor-pointer">
                    {focusHidden} more not shown
                  </span>
                </Link>
              </>
            )}
            .
          </p>
        )}
      </section>

      {/* ── Two columns: what is coming, and what you are doing about it. ─ */}
      <div className="mt-9 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-9">
        <section>
          <SectionHeader title="Upcoming deadlines" href="/universities" action="All universities" />
          <div className="panel divide-y divide-border">
            {upcoming.length === 0 && !loading && (
              <p className="px-5 py-8 text-sm text-muted-foreground text-center">No upcoming deadlines.</p>
            )}
            {upcoming.map((u) => {
              const days = getDaysLeft(u.deadline);
              const urg = urgencyOf(days);
              const done = u.documents.filter((d) => d.completed).length;
              return (
                <Link key={u.id} href="/universities">
                  <div
                    className="flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-accent/40 transition-colors"
                    data-testid={`deadline-${u.id}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.program}</p>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground shrink-0">
                      {done}/{u.documents.length}
                    </span>
                    <span
                      className={cn(
                        "chip shrink-0 w-[4.75rem] justify-center",
                        urg === "urgent" ? "chip-urgent" : urg === "soon" ? "chip-soon" : "chip-idle"
                      )}
                    >
                      {days !== null ? `${days}d` : "—"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <SectionHeader title="Active goals" href="/goals" />
          <div className="panel divide-y divide-border">
            {recentGoals.length === 0 && !loading && (
              <p className="px-5 py-8 text-sm text-muted-foreground text-center">No active goals.</p>
            )}
            {recentGoals.map((g) => {
              const days = getDaysLeft(g.deadline);
              const urg = urgencyOf(days);
              return (
                <div key={g.id} className="flex items-center gap-3 px-5 py-3" data-testid={`goal-${g.id}`}>
                  <Tick
                    done={g.completed}
                    onClick={() => handleToggleGoal(g)}
                    label={g.completed ? "Mark not done" : "Mark done"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-sm truncate", g.completed && "line-through text-muted-foreground")}>
                      {g.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{g.category}</p>
                  </div>
                  {g.deadline && (
                    <span
                      className={cn(
                        "chip shrink-0",
                        urg === "urgent" ? "chip-urgent" : urg === "soon" ? "chip-soon" : "chip-idle"
                      )}
                    >
                      {dayLabel(days)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── Weekly prep. A progress figure, not a gradient billboard. ──── */}
      <section className="mt-9">
        <SectionHeader title="Weekly prep" href="/drills" action="Drill tracker" />

        <div className="panel p-5">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-mono text-2xl leading-none text-foreground">
              {drillDone}
              <span className="text-muted-foreground text-lg">/{drillTarget}</span>
            </p>
            <p className="text-xs text-muted-foreground">{drillPct}% of this week's sessions</p>
          </div>

          <div className="mt-3 h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-foreground/70 rounded-full transition-[width] duration-500"
              style={{ width: `${drillPct}%` }}
            />
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {drills.map((d) => {
              const hit = d.completed >= d.target;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setLocation("/drills")}
                  className="rounded-sm border border-border bg-card hover:bg-accent/50 hover:border-foreground/25 transition-colors px-3 py-2 text-left cursor-pointer"
                >
                  <span className="block text-xs text-muted-foreground truncate">
                    {d.title.replace(" Drills", "").replace(" Preparation", "")}
                  </span>
                  <span className={cn("block mt-0.5 font-mono text-sm", hit ? "text-ok" : "text-foreground")}>
                    {d.completed}
                    <span className="text-muted-foreground">/{d.target}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
