import { useState, useEffect } from "react";
import { Search, MoreHorizontal, CheckCircle2, Circle, ChevronRight, Plus, Pencil, Trash2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { getUniversities, saveUniversities } from "@/store/data";
import { getDaysLeft } from "@/lib/scoring";
import type { University, UniStatus, Priority, DocCategory, UniversityDocument } from "@/types";
import { cn } from "@/lib/utils";

const statusColors: Record<UniStatus, string> = {
  Researching: "bg-sky-100 text-sky-700 border-sky-200",
  Applying: "bg-amber-100 text-amber-700 border-amber-200",
  Applied: "bg-violet-100 text-violet-700 border-violet-200",
  Submitted: "bg-green-100 text-green-700 border-green-200",
};

const priorityColors: Record<Priority, string> = {
  High: "bg-rose-100 text-rose-700 border-rose-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Low: "bg-slate-100 text-slate-600 border-slate-200",
};

const categoryColors: Record<DocCategory, string> = {
  Academic: "bg-green-100 text-green-700 border-green-200",
  Document: "bg-rose-100 text-rose-700 border-rose-200",
  Language: "bg-amber-100 text-amber-700 border-amber-200",
};

const STATUS_ORDER: UniStatus[] = ["Researching", "Applying", "Applied", "Submitted"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatFee(fee: { amount: number; currency: string; source: string }) {
  if (fee.amount === 0) return `Free`;
  return `${fee.currency} ${fee.amount.toLocaleString()}`;
}

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

// ────────────────────────────────────────────────────────────────────────────
// Add University Dialog
// ────────────────────────────────────────────────────────────────────────────

interface AddDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (uni: University) => void;
}

function AddUniversityDialog({ open, onClose, onAdd }: AddDialogProps) {
  const blank = {
    name: "", shortName: "", country: "", program: "", department: "",
    language: "English", applicationOpens: "", deadline: "",
    status: "Researching" as UniStatus, priority: "Medium" as Priority,
    feeAmount: "0", feeCurrency: "USD",
  };
  const [form, setForm] = useState(blank);
  const [docs, setDocs] = useState<UniversityDocument[]>([]);
  const [newDocName, setNewDocName] = useState("");
  const [newDocCat, setNewDocCat] = useState<DocCategory>("Document");
  const [error, setError] = useState("");

  function reset() {
    setForm(blank);
    setDocs([]);
    setNewDocName("");
    setError("");
  }

  function addDoc() {
    const name = newDocName.trim();
    if (!name) return;
    setDocs((prev) => [...prev, { id: genId(), name, category: newDocCat, completed: false }]);
    setNewDocName("");
  }

  function removeDoc(id: string) {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }

  function handleSubmit() {
    if (!form.name.trim()) { setError("University name is required."); return; }
    if (!form.deadline) { setError("Deadline is required."); return; }
    if (!form.applicationOpens) { setError("Application open date is required."); return; }
    const uni: University = {
      id: genId(),
      name: form.name.trim(),
      shortName: form.shortName.trim() || form.name.trim().split(" ").map(w => w[0]).join("").toUpperCase(),
      country: form.country.trim(),
      program: form.program.trim(),
      department: form.department.trim(),
      language: form.language.trim(),
      applicationOpens: form.applicationOpens,
      deadline: form.deadline,
      status: form.status,
      priority: form.priority,
      registrationFee: {
        amount: Math.max(0, Number(form.feeAmount) || 0),
        currency: form.feeCurrency.trim() || "USD",
        source: "user-provided",
      },
      documents: docs,
    };
    onAdd(uni);
    reset();
    onClose();
  }

  function handleClose() {
    reset();
    onClose();
  }

  const set = (k: keyof typeof blank) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add University</DialogTitle>
        </DialogHeader>

        {error && <p className="text-sm text-destructive mb-2">{error}</p>}

        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>University Name *</Label>
              <Input data-testid="add-uni-name" value={form.name} onChange={set("name")} placeholder="e.g. MIT" className="mt-1" />
            </div>
            <div>
              <Label>Short Name</Label>
              <Input data-testid="add-uni-short" value={form.shortName} onChange={set("shortName")} placeholder="e.g. MIT" className="mt-1" />
            </div>
            <div>
              <Label>Country</Label>
              <Input data-testid="add-uni-country" value={form.country} onChange={set("country")} placeholder="e.g. USA" className="mt-1" />
            </div>
            <div>
              <Label>Program</Label>
              <Input data-testid="add-uni-program" value={form.program} onChange={set("program")} placeholder="e.g. Computer Science" className="mt-1" />
            </div>
            <div>
              <Label>Department</Label>
              <Input data-testid="add-uni-dept" value={form.department} onChange={set("department")} placeholder="e.g. School of Engineering" className="mt-1" />
            </div>
            <div>
              <Label>Language</Label>
              <Input data-testid="add-uni-lang" value={form.language} onChange={set("language")} placeholder="English" className="mt-1" />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v as Priority }))}>
                <SelectTrigger className="mt-1" data-testid="add-uni-priority"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as UniStatus }))}>
                <SelectTrigger className="mt-1" data-testid="add-uni-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>App. Opens *</Label>
              <Input type="date" data-testid="add-uni-opens" value={form.applicationOpens} onChange={set("applicationOpens")} className="mt-1" />
            </div>
            <div>
              <Label>Deadline *</Label>
              <Input type="date" data-testid="add-uni-deadline" value={form.deadline} onChange={set("deadline")} className="mt-1" />
            </div>
            <div>
              <Label>Fee Amount</Label>
              <Input type="number" min="0" data-testid="add-uni-fee" value={form.feeAmount} onChange={set("feeAmount")} placeholder="0" className="mt-1" />
            </div>
            <div>
              <Label>Currency</Label>
              <Input data-testid="add-uni-currency" value={form.feeCurrency} onChange={set("feeCurrency")} placeholder="USD" className="mt-1" />
            </div>
          </div>

          {/* Documents */}
          <div className="border rounded-lg p-3 mt-1">
            <p className="text-sm font-semibold mb-2">Required Documents</p>
            <div className="space-y-1.5 mb-3 max-h-36 overflow-y-auto">
              {docs.length === 0 && <p className="text-xs text-muted-foreground">No documents added yet.</p>}
              {docs.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-2 text-sm px-2 py-1 rounded bg-muted/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className={cn("text-xs shrink-0", categoryColors[d.category])}>{d.category}</Badge>
                    <span className="truncate">{d.name}</span>
                  </div>
                  <button onClick={() => removeDoc(d.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Select value={newDocCat} onValueChange={(v) => setNewDocCat(v as DocCategory)}>
                <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Document">Document</SelectItem>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Language">Language</SelectItem>
                </SelectContent>
              </Select>
              <Input
                className="h-8 text-xs flex-1"
                placeholder="Document name..."
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDoc()}
                data-testid="add-doc-name-input"
              />
              <Button size="sm" variant="outline" onClick={addDoc} className="h-8" data-testid="add-doc-btn">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} data-testid="btn-confirm-add-uni">Add University</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// University Detail Sheet (view + edit mode)
// ────────────────────────────────────────────────────────────────────────────

interface DetailPanelProps {
  university: University | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (uni: University) => void;
  onDelete: (id: string) => void;
}

function UniversityDetail({ university, open, onClose, onUpdate, onDelete }: DetailPanelProps) {
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<University | null>(null);
  const [newDocName, setNewDocName] = useState("");
  const [newDocCat, setNewDocCat] = useState<DocCategory>("Document");

  useEffect(() => {
    if (university) {
      setDraft(university);
      setEditMode(false);
    }
  }, [university]);

  if (!university || !draft) return null;

  const view = editMode ? draft : university;
  const total = view.documents.length;
  const done = view.documents.filter((d) => d.completed).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const grouped: Record<DocCategory, typeof view.documents> = { Academic: [], Document: [], Language: [] };
  view.documents.forEach((doc) => { grouped[doc.category].push(doc); });

  // ── View mode actions ──
  const toggleDoc = (docId: string) => {
    const updated = { ...university, documents: university.documents.map((d) => d.id === docId ? { ...d, completed: !d.completed } : d) };
    onUpdate(updated);
  };

  const nextStatus = () => {
    const idx = STATUS_ORDER.indexOf(university.status);
    if (idx < STATUS_ORDER.length - 1) onUpdate({ ...university, status: STATUS_ORDER[idx + 1] });
  };

  const opensDate = new Date(university.applicationOpens);
  const deadlineDate = new Date(university.deadline);
  const now = new Date();
  const totalRange = deadlineDate.getTime() - opensDate.getTime();
  const elapsed = now.getTime() - opensDate.getTime();
  const progressPct = Math.max(0, Math.min(100, Math.round((elapsed / totalRange) * 100)));

  // ── Edit mode helpers ──
  const setField = <K extends keyof University>(k: K, v: University[K]) =>
    setDraft((d) => d ? { ...d, [k]: v } : d);

  const setFeeField = (k: "amount" | "currency" | "source", v: string | number) =>
    setDraft((d) => d ? { ...d, registrationFee: { ...d.registrationFee, [k]: v } } : d);

  const toggleDraftDoc = (docId: string) =>
    setDraft((d) => d ? { ...d, documents: d.documents.map((doc) => doc.id === docId ? { ...doc, completed: !doc.completed } : doc) } : d);

  const deleteDraftDoc = (docId: string) =>
    setDraft((d) => d ? { ...d, documents: d.documents.filter((doc) => doc.id !== docId) } : d);

  const addDraftDoc = () => {
    const name = newDocName.trim();
    if (!name) return;
    setDraft((d) => d ? { ...d, documents: [...d.documents, { id: genId(), name, category: newDocCat, completed: false }] } : d);
    setNewDocName("");
  };

  const saveEdit = () => {
    if (draft) { onUpdate(draft); setEditMode(false); }
  };

  const cancelEdit = () => {
    setDraft(university);
    setEditMode(false);
    setNewDocName("");
  };

  const handleDelete = () => {
    if (confirm(`Delete "${university.name}"? This cannot be undone.`)) {
      onDelete(university.id);
      onClose();
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) { cancelEdit(); onClose(); } }}>
      <SheetContent className="w-[500px] overflow-y-auto" side="right">
        <SheetHeader className="mb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {editMode ? (
                <Input
                  className="font-semibold text-base mb-1"
                  value={draft.name}
                  onChange={(e) => setField("name", e.target.value)}
                  data-testid="edit-uni-name"
                />
              ) : (
                <SheetTitle className="text-lg leading-tight">{university.name}</SheetTitle>
              )}
              {editMode ? (
                <Input
                  className="text-sm mt-1"
                  value={draft.department}
                  onChange={(e) => setField("department", e.target.value)}
                  placeholder="Department"
                  data-testid="edit-uni-dept"
                />
              ) : (
                <p className="text-sm text-muted-foreground mt-0.5">{university.department}</p>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  data-testid="btn-edit-uni"
                  title="Edit"
                  className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleDelete}
                data-testid="btn-delete-uni"
                title="Delete university"
                className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {editMode ? (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label className="text-xs">Country</Label>
                <Input className="mt-0.5 h-8 text-sm" value={draft.country} onChange={(e) => setField("country", e.target.value)} data-testid="edit-uni-country" />
              </div>
              <div>
                <Label className="text-xs">Language</Label>
                <Input className="mt-0.5 h-8 text-sm" value={draft.language} onChange={(e) => setField("language", e.target.value)} data-testid="edit-uni-lang" />
              </div>
              <div>
                <Label className="text-xs">Program</Label>
                <Input className="mt-0.5 h-8 text-sm" value={draft.program} onChange={(e) => setField("program", e.target.value)} data-testid="edit-uni-program" />
              </div>
              <div>
                <Label className="text-xs">Short Name</Label>
                <Input className="mt-0.5 h-8 text-sm" value={draft.shortName} onChange={(e) => setField("shortName", e.target.value)} data-testid="edit-uni-short" />
              </div>
            </div>
          ) : (
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className={statusColors[university.status]}>{university.status}</Badge>
              <Badge variant="outline" className={priorityColors[university.priority]}>{university.priority} Priority</Badge>
              <span className="text-xs text-muted-foreground self-center">{university.country} &bull; {university.language}</span>
            </div>
          )}

          {editMode && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={draft.status} onValueChange={(v) => setField("status", v as UniStatus)}>
                  <SelectTrigger className="mt-0.5 h-8 text-sm" data-testid="edit-uni-status"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_ORDER.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Priority</Label>
                <Select value={draft.priority} onValueChange={(v) => setField("priority", v as Priority)}>
                  <SelectTrigger className="mt-0.5 h-8 text-sm" data-testid="edit-uni-priority"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </SheetHeader>

        {/* Application Window */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold mb-2">Application Window</h3>
          {editMode ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Opens</Label>
                <Input type="date" className="mt-0.5 h-8 text-sm" value={draft.applicationOpens} onChange={(e) => setField("applicationOpens", e.target.value)} data-testid="edit-uni-opens" />
              </div>
              <div>
                <Label className="text-xs">Deadline</Label>
                <Input type="date" className="mt-0.5 h-8 text-sm" value={draft.deadline} onChange={(e) => setField("deadline", e.target.value)} data-testid="edit-uni-deadline" />
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Opens {formatDate(university.applicationOpens)}</span>
                <span>Deadline {formatDate(university.deadline)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {getDaysLeft(university.deadline) !== null && getDaysLeft(university.deadline)! > 0
                  ? `${getDaysLeft(university.deadline)} days remaining`
                  : "Deadline passed"}
              </p>
            </>
          )}
        </div>

        {/* Registration Fee */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold mb-2">Registration Fee</h3>
          {editMode ? (
            <div className="flex gap-2">
              <div className="flex-1">
                <Label className="text-xs">Amount</Label>
                <Input
                  type="number" min="0" className="mt-0.5 h-8 text-sm"
                  value={draft.registrationFee.amount}
                  onChange={(e) => setFeeField("amount", Math.max(0, Number(e.target.value)))}
                  data-testid="edit-uni-fee"
                />
              </div>
              <div className="w-24">
                <Label className="text-xs">Currency</Label>
                <Input
                  className="mt-0.5 h-8 text-sm"
                  value={draft.registrationFee.currency}
                  onChange={(e) => setFeeField("currency", e.target.value)}
                  data-testid="edit-uni-currency"
                />
              </div>
              <div className="w-32">
                <Label className="text-xs">Source</Label>
                <Select
                  value={draft.registrationFee.source}
                  onValueChange={(v) => setFeeField("source", v)}
                >
                  <SelectTrigger className="mt-0.5 h-8 text-xs" data-testid="edit-uni-fee-source"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user-provided">Verified</SelectItem>
                    <SelectItem value="agent-estimated">Agent est.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-base font-medium">{formatFee(university.registrationFee)}</span>
              {university.registrationFee.source === "agent-estimated" ? (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs" data-testid="badge-agent-estimated">Agent est.</Badge>
              ) : (
                <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-xs" data-testid="badge-verified">Verified</Badge>
              )}
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Documents</h3>
            <span className="text-xs text-muted-foreground">{done}/{total} complete</span>
          </div>
          <Progress value={pct} className="h-2 mb-4" />

          {(["Academic", "Document", "Language"] as DocCategory[]).map((cat) => {
            const docs = grouped[cat];
            if (docs.length === 0) return null;
            return (
              <div key={cat} className="mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Badge variant="outline" className={cn("text-xs", categoryColors[cat])}>{cat}</Badge>
                </div>
                <div className="space-y-1">
                  {docs.map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2 group">
                      <button
                        data-testid={`doc-toggle-${doc.id}`}
                        onClick={() => editMode ? toggleDraftDoc(doc.id) : toggleDoc(doc.id)}
                        className="flex items-center gap-2.5 flex-1 text-left p-2 rounded-md hover:bg-muted transition-colors"
                      >
                        {doc.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                        <span className={cn("text-sm", doc.completed && "line-through text-muted-foreground")}>
                          {doc.name}
                        </span>
                      </button>
                      {editMode && (
                        <button
                          onClick={() => deleteDraftDoc(doc.id)}
                          data-testid={`btn-delete-doc-${doc.id}`}
                          title="Remove"
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {editMode && (
            <div className="flex gap-2 mt-3 border-t pt-3">
              <Select value={newDocCat} onValueChange={(v) => setNewDocCat(v as DocCategory)}>
                <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Document">Document</SelectItem>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Language">Language</SelectItem>
                </SelectContent>
              </Select>
              <Input
                className="h-8 text-xs flex-1"
                placeholder="New document name..."
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDraftDoc()}
                data-testid="edit-new-doc-input"
              />
              <Button size="sm" variant="outline" onClick={addDraftDoc} className="h-8" data-testid="edit-add-doc-btn">
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Actions */}
        {editMode ? (
          <div className="flex gap-2">
            <Button className="flex-1" onClick={saveEdit} data-testid="btn-save-edit">Save Changes</Button>
            <Button variant="outline" onClick={cancelEdit} data-testid="btn-cancel-edit">Cancel</Button>
          </div>
        ) : (
          university.status !== "Submitted" && (
            <Button className="w-full" onClick={nextStatus} data-testid="btn-advance-status">
              Mark as {STATUS_ORDER[STATUS_ORDER.indexOf(university.status) + 1]}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )
        )}
      </SheetContent>
    </Sheet>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────────────────

export default function Universities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selected, setSelected] = useState<University | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    getUniversities().then(data => setUniversities(data as University[]));
  }, []);

  const handleUpdate = (updated: University) => {
    const newList = universities.map((u) => (u.id === updated.id ? updated : u));
    setUniversities(newList);
    saveUniversities(newList);
    setSelected(updated);
  };

  const handleAdd = (uni: University) => {
    const newList = [...universities, uni];
    setUniversities(newList);
    saveUniversities(newList);
  };

  const handleDelete = (id: string) => {
    const newList = universities.filter((u) => u.id !== id);
    setUniversities(newList);
    saveUniversities(newList);
    setSelected(null);
  };

  const filtered = universities.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(q) ||
      u.program.toLowerCase().includes(q) ||
      u.country.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    const matchPriority = priorityFilter === "all" || u.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Universities</h1>
          <p className="text-muted-foreground text-sm">Manage your applications and research.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} data-testid="btn-add-university">
          <Plus className="w-4 h-4 mr-1.5" />
          Add University
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="p-3 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-testid="input-search-universities"
              className="pl-9"
              placeholder="Search universities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36" data-testid="select-status-filter">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Researching">Researching</SelectItem>
              <SelectItem value="Applying">Applying</SelectItem>
              <SelectItem value="Applied">Applied</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-36" data-testid="select-priority-filter">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">University & Program</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deadline</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Docs</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priority</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                      No universities found.{" "}
                      <button onClick={() => setAddOpen(true)} className="underline text-primary">Add one?</button>
                    </td>
                  </tr>
                )}
                {filtered.map((u) => {
                  const done = u.documents.filter((d) => d.completed).length;
                  const total = u.documents.length;
                  const days = getDaysLeft(u.deadline);
                  return (
                    <tr
                      key={u.id}
                      data-testid={`row-university-${u.id}`}
                      onClick={() => setSelected(u)}
                      className="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-foreground text-sm">{u.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{u.program} &bull; {u.country}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-sm text-foreground">{formatDate(u.deadline)}</div>
                        {days !== null && days >= 0 && (
                          <div className={cn("text-xs mt-0.5", days <= 30 ? "text-amber-600" : "text-muted-foreground")}>
                            {days === 0 ? "Today" : `${days}d left`}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-sm text-foreground">{done}/{total}</div>
                        <div className="w-16 mt-1">
                          <Progress value={total > 0 ? (done / total) * 100 : 0} className="h-1" />
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="outline" className={statusColors[u.status]}>{u.status}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="outline" className={priorityColors[u.priority]}>{u.priority}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AddUniversityDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />

      <UniversityDetail
        university={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}
