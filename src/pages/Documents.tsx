import { useState, useEffect, useRef } from "react";
import {
  Upload, Search, Trash2, Download, Eye, FileText, FileImage,
  File, FolderOpen, Plus, X, AlertTriangle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { getDocuments, saveDocuments } from "@/store/data";
import type { StoredBerkas, BerkasCategory } from "@/types";
import { cn } from "@/lib/utils";

const CATEGORIES: BerkasCategory[] = ["Akademik", "Bahasa", "Sertifikat", "Lainnya"];

const categoryColors: Record<BerkasCategory, string> = {
  Akademik: "bg-sky-100 text-sky-700 border-sky-200",
  Bahasa: "bg-amber-100 text-amber-700 border-amber-200",
  Sertifikat: "bg-green-100 text-green-700 border-green-200",
  Lainnya: "bg-slate-100 text-slate-600 border-slate-200",
};

const categoryExamples: Record<BerkasCategory, string> = {
  Akademik: "Transkip, rapor, ijazah, sertifikat sekolah",
  Bahasa: "IELTS, TOEFL, JLPT, HSK",
  Sertifikat: "Lomba, beasiswa, organisasi, kursus",
  Lainnya: "Dokumen lain yang relevan",
};

const MAX_FILE_SIZE_MB = 4;
const MAX_STORAGE_MB = 8;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return FileImage;
  if (fileType === "application/pdf") return FileText;
  return File;
}

function getStorageUsed(docs: StoredBerkas[]) {
  return docs.reduce((acc, d) => acc + d.fileSize, 0);
}

interface PreviewDialogProps {
  doc: StoredBerkas | null;
  onClose: () => void;
}

function PreviewDialog({ doc, onClose }: PreviewDialogProps) {
  if (!doc) return null;
  const isImage = doc.fileType.startsWith("image/");
  const isPdf = doc.fileType === "application/pdf";

  return (
    <Dialog open={!!doc} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{doc.name}</DialogTitle>
          <p className="text-xs text-muted-foreground">
            {doc.originalName} &bull; {formatBytes(doc.fileSize)} &bull; {formatDate(doc.dateAdded)}
          </p>
        </DialogHeader>
        <div className="flex-1 overflow-auto rounded-md border border-border bg-muted/30 min-h-[300px] flex items-center justify-center">
          {isImage && (
            <img src={doc.dataUrl} alt={doc.name} className="max-w-full max-h-[60vh] object-contain rounded" />
          )}
          {isPdf && (
            <iframe src={doc.dataUrl} title={doc.name} className="w-full h-[60vh] rounded" />
          )}
          {!isImage && !isPdf && (
            <div className="text-center py-12 text-muted-foreground">
              <File className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Preview tidak tersedia untuk tipe file ini.</p>
              <p className="text-xs mt-1">{doc.fileType}</p>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center pt-1">
          {doc.description && <p className="text-xs text-muted-foreground italic">{doc.description}</p>}
          <Button
            size="sm"
            variant="outline"
            className="ml-auto"
            data-testid="btn-download-preview"
            onClick={() => downloadFile(doc.dataUrl, doc.originalName)}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Unduh
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (doc: StoredBerkas) => void;
}

function UploadDialog({ open, onClose, onSave }: UploadDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<BerkasCategory>("Akademik");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setFile(null);
    setName("");
    setCategory("Akademik");
    setDescription("");
    setError("");
    setLoading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFile = (f: File) => {
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Ukuran file maksimal ${MAX_FILE_SIZE_MB} MB. File ini ${formatBytes(f.size)}.`);
      return;
    }
    setError("");
    setFile(f);
    if (!name) setName(f.name.replace(/\.[^.]+$/, ""));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSave = () => {
    if (!file || !name.trim()) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const doc: StoredBerkas = {
        id: `doc_${Date.now()}`,
        name: name.trim(),
        originalName: file.name,
        category,
        description,
        dateAdded: new Date().toISOString(),
        fileSize: file.size,
        fileType: file.type || "application/octet-stream",
        dataUrl,
      };
      onSave(doc);
      setLoading(false);
      handleClose();
    };
    reader.onerror = () => { setError("Gagal membaca file. Coba lagi."); setLoading(false); };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Unggah Berkas</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            data-testid="dropzone-berkas"
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              file ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"
            )}
          >
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              data-testid="input-file-berkas"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                {(() => { const Icon = getFileIcon(file.type); return <Icon className="w-8 h-8 text-primary" />; })()}
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground truncate max-w-[240px]">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="ml-2 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Klik atau seret file ke sini</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, gambar, Word, Excel, PowerPoint, ZIP &bull; Maks {MAX_FILE_SIZE_MB} MB</p>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <Label htmlFor="berkas-name" className="text-xs">Nama Berkas</Label>
            <Input
              id="berkas-name"
              data-testid="input-berkas-name"
              className="mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Transkip SMA Kelas 12"
            />
          </div>

          {/* Category */}
          <div>
            <Label className="text-xs">Kategori</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as BerkasCategory)}>
              <SelectTrigger className="mt-1" data-testid="select-berkas-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    <div>
                      <span className="font-medium">{c}</span>
                      <span className="text-muted-foreground text-xs ml-2">— {categoryExamples[c]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="berkas-desc" className="text-xs">Catatan (opsional)</Label>
            <Textarea
              id="berkas-desc"
              data-testid="input-berkas-desc"
              className="mt-1 resize-none text-sm"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Skor IELTS 7.5 — Juni 2026"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose} data-testid="btn-cancel-berkas">Batal</Button>
            <Button
              onClick={handleSave}
              disabled={!file || !name.trim() || loading}
              data-testid="btn-save-berkas"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function downloadFile(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function BerkasCard({ doc, onDelete, onPreview }: { doc: StoredBerkas; onDelete: () => void; onPreview: () => void }) {
  const Icon = getFileIcon(doc.fileType);
  const isImage = doc.fileType.startsWith("image/");
  const isPdf = doc.fileType === "application/pdf";
  const canPreview = isImage || isPdf;

  return (
    <Card data-testid={`berkas-card-${doc.id}`} className="overflow-hidden hover:shadow-md transition-shadow">
      {/* Thumbnail / Icon area */}
      <div
        className={cn(
          "h-28 flex items-center justify-center bg-muted/40 relative",
          canPreview && "cursor-pointer group"
        )}
        onClick={canPreview ? onPreview : undefined}
      >
        {isImage ? (
          <img src={doc.dataUrl} alt={doc.name} className="w-full h-full object-cover" />
        ) : (
          <Icon className={cn("w-12 h-12 text-muted-foreground/60", isPdf && "text-rose-400")} />
        )}
        {canPreview && (
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Eye className="w-6 h-6 text-white" />
          </div>
        )}
      </div>

      <CardContent className="p-3">
        <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2 mb-1.5">{doc.name}</h3>
        <Badge variant="outline" className={cn("text-xs mb-2", categoryColors[doc.category])}>
          {doc.category}
        </Badge>
        {doc.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{doc.description}</p>
        )}
        <div className="flex items-center justify-between mt-auto">
          <div className="text-xs text-muted-foreground">
            <div>{formatDate(doc.dateAdded)}</div>
            <div>{formatBytes(doc.fileSize)}</div>
          </div>
          <div className="flex gap-1">
            {canPreview && (
              <button
                onClick={onPreview}
                data-testid={`btn-preview-${doc.id}`}
                title="Lihat"
                className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => downloadFile(doc.dataUrl, doc.originalName)}
              data-testid={`btn-download-${doc.id}`}
              title="Unduh"
              className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              data-testid={`btn-delete-${doc.id}`}
              title="Hapus"
              className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Documents() {
  const [docs, setDocs] = useState<StoredBerkas[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [preview, setPreview] = useState<StoredBerkas | null>(null);

  useEffect(() => {
    getDocuments().then(data => setDocs(data as StoredBerkas[]));
  }, []);

  const persist = (updated: StoredBerkas[]) => {
    setDocs(updated);
    try {
      saveDocuments(updated);
    } catch {
      alert("Penyimpanan penuh! Hapus beberapa berkas dulu sebelum menambah yang baru.");
    }
  };

  const handleSave = (doc: StoredBerkas) => {
    persist([...docs, doc]);
  };

  const handleDelete = (id: string) => {
    persist(docs.filter((d) => d.id !== id));
  };

  const filtered = docs.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch = d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || d.originalName.toLowerCase().includes(q);
    const matchCat = catFilter === "all" || d.category === catFilter;
    return matchSearch && matchCat;
  });

  const grouped: Record<BerkasCategory, StoredBerkas[]> = {
    Akademik: [],
    Bahasa: [],
    Sertifikat: [],
    Lainnya: [],
  };
  filtered.forEach((d) => grouped[d.category].push(d));

  const storageUsed = getStorageUsed(docs);
  const storageMax = MAX_STORAGE_MB * 1024 * 1024;
  const storagePct = Math.min(100, (storageUsed / storageMax) * 100);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Berkas Penting</h1>
          <p className="text-muted-foreground text-sm">Simpan transkip, sertifikat, dan dokumen penting lainnya.</p>
        </div>
        <Button onClick={() => setUploadOpen(true)} data-testid="btn-upload-berkas">
          <Plus className="w-4 h-4 mr-1.5" />
          Unggah Berkas
        </Button>
      </div>

      {/* Storage bar */}
      <Card className="mb-5">
        <CardContent className="p-3 flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Penyimpanan browser</span>
              <span>{formatBytes(storageUsed)} / {MAX_STORAGE_MB} MB</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div
                className={cn("h-1.5 rounded-full transition-all", storagePct > 80 ? "bg-amber-500" : "bg-primary")}
                style={{ width: `${storagePct}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground shrink-0">
            {docs.length} berkas tersimpan
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="input-search-berkas"
            className="pl-9"
            placeholder="Cari berkas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-40" data-testid="select-berkas-category-filter">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empty state */}
      {docs.length === 0 && (
        <div className="text-center py-20">
          <FolderOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-1">Belum ada berkas</h2>
          <p className="text-sm text-muted-foreground mb-4">Unggah transkip, sertifikat IELTS, SAT, lomba, atau dokumen penting lainnya.</p>
          <Button onClick={() => setUploadOpen(true)} data-testid="btn-upload-empty">
            <Upload className="w-4 h-4 mr-1.5" />
            Unggah Berkas Pertama
          </Button>
        </div>
      )}

      {/* Grouped by category */}
      {(catFilter === "all" ? CATEGORIES : [catFilter as BerkasCategory]).map((cat) => {
        const list = catFilter === "all" ? grouped[cat as BerkasCategory] : filtered;
        if (list.length === 0) return null;

        return (
          <div key={cat} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-base font-semibold text-foreground">{cat}</h2>
              <Badge variant="outline" className={cn("text-xs", categoryColors[cat as BerkasCategory])}>
                {list.length}
              </Badge>
              <p className="text-xs text-muted-foreground">{categoryExamples[cat as BerkasCategory]}</p>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {list.map((doc) => (
                <BerkasCard
                  key={doc.id}
                  doc={doc}
                  onDelete={() => handleDelete(doc.id)}
                  onPreview={() => setPreview(doc)}
                />
              ))}
            </div>
          </div>
        );
      })}

      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} onSave={handleSave} />
      <PreviewDialog doc={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
