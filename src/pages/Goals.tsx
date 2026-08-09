import { useState, useEffect } from "react";
import { Plus, Search, CheckCircle2, Circle, MoreHorizontal, Trash2, Edit2, Clock, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getGoals, saveGoals } from "@/store/data";
import { sortByComposite, sortByPriorityThenDeadline, getDaysLeft } from "@/lib/scoring";
import type { Goal, Priority } from "@/types";
import { cn } from "@/lib/utils";

const priorityColors: Record<Priority, string> = {
  High: "bg-rose-100 text-rose-700 border-rose-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-slate-100 text-slate-600 border-slate-200",
};

const CATEGORIES = ["Tugas Sekolah", "Lomba", "Project", "Application", "Language", "Financial", "Other"];

function formatDeadline(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getCategoryBadgeStyle(cat: string) {
  const c = cat.toLowerCase();
  if (c.includes("lomba") || c.includes("competition")) return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200";
  if (c.includes("tugas") || c.includes("school")) return "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200";
  if (c.includes("project") || c.includes("projek")) return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200";
  if (c.includes("application") || c.includes("scholarship")) return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-200";
  if (c.includes("language")) return "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-200";
  return "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200";
}

interface GoalFormProps {
  initial?: Partial<Goal>;
  onSave: (g: Omit<Goal, "id">) => void;
  onClose: () => void;
}

function GoalForm({ initial, onSave, onClose }: GoalFormProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [category, setCategory] = useState(initial?.category || "Tugas Sekolah");
  const [priority, setPriority] = useState<Priority>(initial?.priority || "Medium");
  const [startDate, setStartDate] = useState(initial?.startDate || "");
  const [deadline, setDeadline] = useState(initial?.deadline || "");
  const [time, setTime] = useState(initial?.time || "");
  const [description, setDescription] = useState(initial?.description || "");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      category,
      priority,
      startDate: startDate || deadline || null,
      deadline: deadline || startDate || null,
      time: time.trim() || null,
      description: description.trim(),
      completed: initial?.completed ?? false
    });
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="goal-title">Title</Label>
        <Input id="goal-title" data-testid="input-goal-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Tugas Miss Lydia PPKN SWOT..." className="mt-1" autoFocus />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="mt-1" data-testid="select-goal-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Priority</Label>
          <Select value={priority} onValueChange={v => setPriority(v as Priority)}>
            <SelectTrigger className="mt-1" data-testid="select-goal-priority">
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
          <Input id="start-date" type="date" value={startDate || ""} onChange={e => setStartDate(e.target.value)} className="mt-1 text-xs" />
        </div>

        <div>
          <Label htmlFor="goal-deadline">Deadline Date</Label>
          <Input id="goal-deadline" data-testid="input-goal-deadline" type="date" value={deadline || ""} onChange={e => setDeadline(e.target.value)} className="mt-1 text-xs" />
        </div>

        <div>
          <Label htmlFor="goal-time">Time (Optional)</Label>
          <Input id="goal-time" type="time" value={time || ""} onChange={e => setTime(e.target.value)} className="mt-1 text-xs" />
        </div>
      </div>

      <div>
        <Label htmlFor="goal-description">Notes & Description</Label>
        <Textarea id="goal-description" data-testid="input-goal-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Add detailed instructions or notes..." className="mt-1 resize-none min-h-[70px]" rows={3} />
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="outline" onClick={onClose} data-testid="btn-cancel-goal">Cancel</Button>
        <Button onClick={handleSubmit} disabled={!title.trim()} data-testid="btn-save-goal">Save Goal</Button>
      </div>
    </div>
  );
}

interface GoalCardProps {
  goal: Goal;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onChangePriority: (p: Priority) => void;
}

function GoalCard({ goal, onToggle, onEdit, onDelete, onChangePriority }: GoalCardProps) {
  const days = getDaysLeft(goal.deadline);
  const isOverdue = days !== null && days < 0;

  return (
    <Card data-testid={`goal-card-${goal.id}`} className={cn("transition-opacity border border-border/80 shadow-2xs", goal.completed && "opacity-60")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="outline" className={cn("text-xs font-semibold", getCategoryBadgeStyle(goal.category))}>
            {goal.category}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button data-testid={`btn-goal-menu-${goal.id}`} className="p-0.5 rounded hover:bg-muted transition-colors">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit} data-testid={`btn-edit-goal-${goal.id}`}>
                <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangePriority("High")} data-testid={`btn-priority-high-${goal.id}`}>
                Set High Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangePriority("Medium")} data-testid={`btn-priority-medium-${goal.id}`}>
                Set Medium Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangePriority("Low")} data-testid={`btn-priority-low-${goal.id}`}>
                Set Low Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive" data-testid={`btn-delete-goal-${goal.id}`}>
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className={cn("font-bold text-foreground text-sm mb-1 leading-snug", goal.completed && "line-through text-muted-foreground")}>
          {goal.title}
        </h3>

        {goal.description && (
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed line-clamp-2 bg-muted/30 p-2 rounded border border-border/50">
            {goal.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn("text-[10px] font-semibold", priorityColors[goal.priority])}>
              {goal.priority}
            </Badge>

            {goal.time && (
              <span className="text-[10px] font-mono font-semibold text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3 text-primary" /> {goal.time}
              </span>
            )}

            {goal.deadline && (
              <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                <CalendarIcon className="w-3 h-3" />
                <span className={cn(isOverdue && "text-rose-600 font-bold")}>
                  {isOverdue ? `${Math.abs(days!)}d overdue` : days === 0 ? "Due today" : formatDeadline(goal.deadline)}
                </span>
              </div>
            )}
          </div>

          <button
            data-testid={`btn-toggle-goal-${goal.id}`}
            onClick={onToggle}
            className="p-0.5 rounded-full hover:bg-muted transition-colors shrink-0"
            title={goal.completed ? "Mark uncompleted" : "Mark completed"}
          >
            {goal.completed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [addOpen, setAddOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);

  useEffect(() => {
    getGoals().then(data => setGoals(data as Goal[]));
  }, []);

  const persist = (updated: Goal[]) => {
    setGoals(updated);
    saveGoals(updated);
  };

  const addGoal = (data: Omit<Goal, "id">) => {
    const newGoal: Goal = { ...data, id: `g${Date.now()}` };
    persist([...goals, newGoal]);
  };

  const updateGoal = (id: string, data: Partial<Goal>) => {
    persist(goals.map(g => g.id === id ? { ...g, ...data } : g));
  };

  const deleteGoal = (id: string) => {
    persist(goals.filter(g => g.id !== id));
  };

  const toggleGoal = (id: string) => {
    updateGoal(id, { completed: !goals.find(g => g.id === id)?.completed });
  };

  const filtered = goals.filter(g => {
    const q = search.toLowerCase();
    const matchSearch = g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q) || (g.description && g.description.toLowerCase().includes(q));
    const matchCat = categoryFilter === "all" || g.category === categoryFilter;
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? !g.completed : g.completed);
    return matchSearch && matchCat && matchStatus;
  });

  const activeGoals = filtered.filter(g => !g.completed);
  const mostUrgent = sortByComposite(activeGoals).slice(0, 3);
  const highPriority = sortByPriorityThenDeadline(activeGoals.filter(g => !mostUrgent.find(m => m.id === g.id))).slice(0, 6);
  const completed = filtered.filter(g => g.completed);

  const categories = [...new Set(["Tugas Sekolah", "Lomba", "Project", "Application", "Language", ...goals.map(g => g.category)])];

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Goals & Tasks</h1>
          <p className="text-muted-foreground text-sm">Keep track of your preparation milestones, school tasks, and competitions.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} data-testid="btn-add-goal" className="self-start sm:self-auto">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Goal / Task
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="input-search-goals"
            className="pl-9 text-xs"
            placeholder="Search goals or tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 text-xs" data-testid="select-filter-category">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 text-xs" data-testid="select-filter-status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active font-semibold">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards Sections */}
      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground text-sm">No goals found. Add a new goal to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {mostUrgent.length > 0 && statusFilter !== "completed" && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-3 flex items-center gap-1.5">
                Urgent Milestones
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mostUrgent.map(g => (
                  <GoalCard
                    key={g.id}
                    goal={g}
                    onToggle={() => toggleGoal(g.id)}
                    onEdit={() => setEditGoal(g)}
                    onDelete={() => deleteGoal(g.id)}
                    onChangePriority={p => updateGoal(g.id, { priority: p })}
                  />
                ))}
              </div>
            </div>
          )}

          {highPriority.length > 0 && statusFilter !== "completed" && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                All Active Targets ({activeGoals.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeGoals.map(g => (
                  <GoalCard
                    key={g.id}
                    goal={g}
                    onToggle={() => toggleGoal(g.id)}
                    onEdit={() => setEditGoal(g)}
                    onDelete={() => deleteGoal(g.id)}
                    onChangePriority={p => updateGoal(g.id, { priority: p })}
                  />
                ))}
              </div>
            </div>
          )}

          {completed.length > 0 && statusFilter !== "active" && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Completed ({completed.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completed.map(g => (
                  <GoalCard
                    key={g.id}
                    goal={g}
                    onToggle={() => toggleGoal(g.id)}
                    onEdit={() => setEditGoal(g)}
                    onDelete={() => deleteGoal(g.id)}
                    onChangePriority={p => updateGoal(g.id, { priority: p })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Goal / Task</DialogTitle>
          </DialogHeader>
          <GoalForm onSave={addGoal} onClose={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editGoal} onOpenChange={v => !v && setEditGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goal / Task</DialogTitle>
          </DialogHeader>
          {editGoal && (
            <GoalForm
              initial={editGoal}
              onSave={data => updateGoal(editGoal.id, data)}
              onClose={() => setEditGoal(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
