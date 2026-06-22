import { useState, useEffect } from "react";
import { Plus, Search, CheckCircle2, Circle, MoreHorizontal, Trash2, Edit2 } from "lucide-react";
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

const CATEGORIES = ["Language", "Application", "Financial", "Academic", "Other"];

function formatDeadline(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface GoalFormProps {
  initial?: Partial<Goal>;
  onSave: (g: Omit<Goal, "id">) => void;
  onClose: () => void;
}

function GoalForm({ initial, onSave, onClose }: GoalFormProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [category, setCategory] = useState(initial?.category || "Application");
  const [priority, setPriority] = useState<Priority>(initial?.priority || "Medium");
  const [deadline, setDeadline] = useState(initial?.deadline || "");
  const [description, setDescription] = useState(initial?.description || "");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), category, priority, deadline: deadline || null, description, completed: initial?.completed ?? false });
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="goal-title">Title</Label>
        <Input id="goal-title" data-testid="input-goal-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Goal title..." className="mt-1" />
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
      <div>
        <Label htmlFor="goal-deadline">Deadline (optional)</Label>
        <Input id="goal-deadline" data-testid="input-goal-deadline" type="date" value={deadline || ""} onChange={e => setDeadline(e.target.value)} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="goal-description">Notes (optional)</Label>
        <Textarea id="goal-description" data-testid="input-goal-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Add notes..." className="mt-1 resize-none" rows={3} />
      </div>
      <div className="flex justify-end gap-2">
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
    <Card data-testid={`goal-card-${goal.id}`} className={cn("transition-opacity", goal.completed && "opacity-60")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-xs text-muted-foreground font-medium">{goal.category}</span>
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

        <h3 className={cn("font-semibold text-foreground text-sm mb-1", goal.completed && "line-through text-muted-foreground")}>
          {goal.title}
        </h3>

        {goal.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{goal.description}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-xs", priorityColors[goal.priority])}>
              {goal.priority}
            </Badge>
            {goal.deadline && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className={cn(isOverdue && "text-rose-600 font-medium")}>
                  {isOverdue ? `${Math.abs(days!)}d overdue` : days === 0 ? "Due today" : formatDeadline(goal.deadline)}
                </span>
              </div>
            )}
          </div>
          <button
            data-testid={`btn-toggle-goal-${goal.id}`}
            onClick={onToggle}
            className="p-0.5 rounded-full hover:bg-muted transition-colors"
          >
            {goal.completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
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
    const matchSearch = g.title.toLowerCase().includes(q) || g.category.toLowerCase().includes(q);
    const matchCat = categoryFilter === "all" || g.category === categoryFilter;
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? !g.completed : g.completed);
    return matchSearch && matchCat && matchStatus;
  });

  const activeGoals = filtered.filter(g => !g.completed);
  const mostUrgent = sortByComposite(activeGoals).slice(0, 3);
  const highPriority = sortByPriorityThenDeadline(activeGoals.filter(g => !mostUrgent.find(m => m.id === g.id))).slice(0, 6);
  const completed = filtered.filter(g => g.completed);

  const categories = [...new Set(goals.map(g => g.category))];

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Goals & Targets</h1>
          <p className="text-muted-foreground text-sm">Keep track of your preparation milestones.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} data-testid="btn-add-goal">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Goal
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="input-search-goals"
            className="pl-9"
            placeholder="Search goals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40" data-testid="select-goal-category-filter">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36" data-testid="select-goal-status-filter">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Most Urgent */}
      {mostUrgent.length > 0 && statusFilter !== "completed" && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-foreground mb-3">
            Most Urgent
            <span className="text-xs font-normal text-muted-foreground ml-2">Ranked by deadline proximity + priority</span>
          </h2>
          <div className="grid grid-cols-3 gap-4">
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

      {/* High Priority */}
      {highPriority.length > 0 && statusFilter !== "completed" && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-foreground mb-3">
            High Priority
            <span className="text-xs font-normal text-muted-foreground ml-2">Ranked by priority then deadline</span>
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {highPriority.map(g => (
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

      {/* Completed */}
      {completed.length > 0 && statusFilter !== "active" && (
        <div className="mb-6">
          <h2 className="text-base font-semibold text-foreground mb-3">Completed</h2>
          <div className="grid grid-cols-3 gap-4">
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

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No goals found. Add one to get started!
        </div>
      )}

      {/* Add Goal Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Goal</DialogTitle>
          </DialogHeader>
          <GoalForm onSave={addGoal} onClose={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={!!editGoal} onOpenChange={v => !v && setEditGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          {editGoal && (
            <GoalForm
              initial={editGoal}
              onSave={data => { updateGoal(editGoal.id, data); setEditGoal(null); }}
              onClose={() => setEditGoal(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
