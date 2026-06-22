import type { Goal } from "@/types";

export function getDaysLeft(deadline: string | null): number | null {
  if (!deadline) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(deadline);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getCompositeScore(priority: string, deadline: string | null): number {
  const priorityWeight = priority === "High" ? 3 : priority === "Medium" ? 2 : 1;
  const daysLeft = getDaysLeft(deadline);
  const urgencyWeight = daysLeft === null ? 0 : daysLeft < 7 ? 3 : daysLeft < 30 ? 2 : 1;
  return priorityWeight * 0.4 + urgencyWeight * 0.6;
}

export function sortByComposite(goals: Goal[]): Goal[] {
  return [...goals].sort((a, b) => getCompositeScore(b.priority, b.deadline) - getCompositeScore(a.priority, a.deadline));
}

export function sortByPriorityThenDeadline(goals: Goal[]): Goal[] {
  const pw = (p: string) => (p === "High" ? 3 : p === "Medium" ? 2 : 1);
  return [...goals].sort((a, b) => {
    const pd = pw(b.priority) - pw(a.priority);
    if (pd !== 0) return pd;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}
