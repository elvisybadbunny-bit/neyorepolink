"use client";

/**
 * B.15 Library UI — 3 tabs:
 * - Catalog: search/add books (copies, shelf, ISBN barcode, digital file)
 * - Out now: open issues w/ live overdue fines -> Return (auto fine) + fines ledger
 * - Issue: barcode scan-or-type lookup -> pick student -> due date
 * Barcode scanning: phone camera scanners type into the barcode field (HID
 * keyboard wedge) — works with any KES-500 scanner or a scanner app.
 */
import * as React from "react";
import {
  Library, BookOpen, Plus, X, Loader2, AlertCircle, Search, ScanLine,
  CheckCircle2, Inbox, Banknote, FileText, Download, BookUp, Camera, Usb,
  UploadCloud, Sparkles, Tag, Printer, QrCode,
} from "lucide-react";
import jsQR from "jsqr";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { FileUpload, type UploadedFile } from "@/components/ui/file-upload";
import { useToast } from "@/components/ui/toast";
import { useBiometricGate } from "@/components/auth/biometric-gate";
import { BundiIntelligentWizard } from "@/components/bundi/bundi-intelligent-wizard";

const LIBRARY_BUNDI_FIELD_OPTIONS: Record<string, string> = {
  title: "Title", author: "Author", isbn: "ISBN", category: "Category",
  shelf: "Shelf", copiesTotal: "Copies", ignore: "— Skip —",
};

const kes = (n: number) => `KES ${n.toLocaleString("en-KE")}`;

interface Book { id: string; title: string; author: string | null; isbn: string | null; category: string | null; shelf: string | null; copiesTotal: number; copiesOut: number; copiesAvailable: number; hasCopyTracking?: boolean; copyCount?: number; fileUrl: string | null; fileName: string | null }
interface CopyRow { id: string; copyNo: number; code: string; status: string; currentHolder: { studentName: string; admissionNo: string; dueDate: string } | null }
interface OpenIssue { id: string; bookTitle: string; isbn: string | null; copyNo: number | null; studentName: string; admissionNo: string; issuedAt: string; dueDate: string; overdue: boolean; daysOverdue: number; fineSoFarKes: number }
interface Fine { id: string; bookTitle: string; studentName: string; admissionNo: string; fineKes: number; returnedAt: string }
interface StudentOpt { id: string; name: string; admissionNo: string }

export function LibraryClient({ canManage }: { canManage: boolean }) {
  const [tab, setTab] = React.useState<"catalog" | "out" | "issue">("catalog");

  const tabs = [
    { key: "catalog" as const, label: "Catalog", icon: Library },
    { key: "out" as const, label: "Out now", icon: Inbox },
    ...(canManage ? [{ key: "issue" as const, label: "Issue a book", icon: BookUp }] : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ease-apple ${
              tab === t.key
                ? "bg-navy-900 text-white dark:bg-navy-50 dark:text-navy-900"
                : "bg-white text-navy-600 border border-navy-100 hover:bg-warm-50 dark:bg-navy-900 dark:text-navy-300 dark:border-navy-800"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" /> {t.label}
          </button>
        ))}
      </div>
      {tab === "catalog" && <CatalogTab canManage={canManage} />}
      {tab === "out" && <OutTab canManage={canManage} />}
      {tab === "issue" && canManage && <IssueTab onIssued={() => setTab("out")} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

function CatalogTab({ canManage }: { canManage: boolean }) {
  const [books, setBooks] = React.useState<Book[] | null>(null);
  const [error, setError] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [copiesFor, setCopiesFor] = React.useState<Book | null>(null);

  const load = React.useCallback(async () => {
    setError(false);
    try {
      const res = await fetch(`/api/library${q ? `?q=${encodeURIComponent(q)}` : ""}`);
      const json = await res.json();
      if (json.ok) setBooks(json.data.books); else setError(true);
    } catch { setError(true); }
  }, [q]);
  React.useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  if (error) return <LoadError onRetry={load} />;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, author, ISBN…" className="w-64 rounded-full border border-navy-200 bg-white py-2 pl-9 pr-4 text-sm dark:border-navy-700 dark:bg-navy-900" />
        </div>
        {canManage && (
          <>
            <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Add book</Button>
            <Button variant="secondary" onClick={() => setImporting(true)}><UploadCloud className="h-4 w-4" /> Import books</Button>
          </>
        )}
      </div>

      {books === null ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
      ) : books.length === 0 ? (
        <EmptyState icon={Library} title={q ? "No books match" : "The catalog is empty"} description={q ? "Try a different search." : "Add your first book — set books, references, novels."} action={canManage && !q ? <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Add book</Button> : undefined} />
      ) : (
        <div className="space-y-2">
          {books.map((b) => (
            <Card key={b.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy-900 dark:text-navy-50">{b.title}</p>
                  <p className="text-xs text-navy-400">
                    {b.author ?? "—"}{b.category ? ` · ${b.category}` : ""}{b.shelf ? ` · shelf ${b.shelf}` : ""}{b.isbn ? ` · ` : ""}
                    {b.isbn && <span className="font-mono">{b.isbn}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {b.fileUrl && (
                    <a href={b.fileUrl} download={b.fileName ?? undefined}>
                      <Button size="sm" variant="secondary"><Download className="h-3.5 w-3.5" /> Digital copy</Button>
                    </a>
                  )}
                  {canManage && (
                    <Button size="sm" variant="secondary" onClick={() => setCopiesFor(b)}>
                      <Tag className="h-3.5 w-3.5" /> {b.hasCopyTracking ? "Copies" : "Track copies"}
                    </Button>
                  )}
                  <Badge tone={b.copiesAvailable > 0 ? "green" : "red"}>
                    {b.copiesAvailable}/{b.copiesTotal} available
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {adding && <AddBookDialog onClose={() => setAdding(false)} onDone={() => { setAdding(false); load(); }} />}
      {importing && <ImportBooksModal onClose={() => setImporting(false)} onDone={() => { setImporting(false); load(); }} />}
      {copiesFor && <CopiesDialog book={copiesFor} onClose={() => setCopiesFor(null)} onChanged={load} />}

    </div>
  );
}

// ---- Library Bulk Import Modal (N.1) --------------------------------------
interface LibraryImportErrorItem { row: number; title: string; message: string }

function ImportBooksModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { toast } = useToast();
  const [mode, setMode] = React.useState<"standard" | "bundi">("standard");
  const [text, setText] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [hasHeader, setHasHeader] = React.useState(true);
  const [importing, setImporting] = React.useState(false);
  const [result, setResult] = React.useState<{ created: number; updated: number; skipped: number; errors: LibraryImportErrorItem[] } | null>(null);

  async function handleImport() {
    if (!text.trim() && !file) return;
    setImporting(true);
    setResult(null);
    try {
      let res: Response;
      if (file) {
        const form = new FormData();
        form.append("file", file);
        form.append("hasHeader", String(hasHeader));
        res = await fetch("/api/library/import", { method: "POST", body: form });
      } else {
        res = await fetch("/api/library/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, hasHeader }),
        });
      }
      const json = await res.json();
      if (json.ok) {
        setResult(json.data);
        toast({
          title: `Import completed: ${json.data.created} new book${json.data.created === 1 ? "" : "s"}, ${json.data.updated} updated`,
          tone: json.data.created + json.data.updated > 0 ? "success" : "error",
        });
        if (json.data.created + json.data.updated > 0) onDone();
      } else {
        toast({ title: json.error?.message || "Import failed.", tone: "error" });
      }
    } catch {
      toast({ title: "Failed to parse or submit import data.", tone: "error" });
    } finally {
      setImporting(false);
    }
  }

  const sample = "Title,Author,ISBN,Category,Shelf,Copies\nA River Between,Ngugi wa Thiong'o,9789966466472,Set Book,B2,5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-3xl border border-navy-100 bg-white p-6 shadow-pop dark:border-navy-800 dark:bg-navy-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-navy-900 dark:text-navy-50">Bulk Import Books</h3>
            <p className="text-xs text-navy-400">Upload CSV/XLSX or paste from Excel. An existing ISBN adds copies instead of duplicating the catalog entry.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-800" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!result && (
          <div className="mb-4 flex gap-1.5 rounded-full bg-navy-50 p-1 text-xs font-semibold dark:bg-navy-800">
            <button onClick={() => setMode("standard")} className={`flex-1 rounded-full px-3 py-1.5 transition-colors ${mode === "standard" ? "bg-white text-navy-900 shadow-sm dark:bg-navy-900 dark:text-navy-50" : "text-navy-500 dark:text-navy-400"}`}>
              CSV / Excel / Paste
            </button>
            <button onClick={() => setMode("bundi")} className={`flex flex-1 items-center justify-center gap-1 rounded-full px-3 py-1.5 transition-colors ${mode === "bundi" ? "bg-white text-navy-900 shadow-sm dark:bg-navy-900 dark:text-navy-50" : "text-navy-500 dark:text-navy-400"}`}>
              <Sparkles className="h-3.5 w-3.5" /> Bundi Intelligent (scan)
            </button>
          </div>
        )}

        {mode === "bundi" && !result ? (
          <BundiIntelligentWizard
            domain="LIBRARY"
            fieldOptions={LIBRARY_BUNDI_FIELD_OPTIONS}
            onClose={onDone}
            onDone={(r) => toast({ title: `${r.created} new book(s) imported via Bundi Intelligent`, tone: "success" })}
          />
        ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-dashed border-green-200 bg-green-50/60 p-4 text-xs dark:border-green-900/40 dark:bg-green-950/15">
            <p className="font-bold text-navy-800 dark:text-navy-100">Accepted columns</p>
            <p className="mt-1 font-mono text-navy-600 dark:text-navy-300">Title · Author · ISBN · Category · Shelf · Copies</p>
            <p className="mt-2 text-navy-500 dark:text-navy-400">Headers are auto-mapped. Only Title is required — everything else is optional.</p>
          </div>

          {!result ? (
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-3">
                <div>
                  <Label>Upload a file</Label>
                  <input
                    type="file" accept=".csv,.tsv,.txt,.xlsx"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="mt-1 w-full rounded-2xl border border-navy-200 bg-white p-2 text-xs dark:border-navy-700 dark:bg-navy-900"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs text-navy-600 dark:text-navy-300">
                  <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} className="h-4 w-4 rounded border-navy-300 text-green-600 focus:ring-green-500" />
                  First row is a header
                </label>
                <p className="text-[11px] text-navy-400">Example: <span className="font-mono">{sample.split("\n")[0]}</span></p>
              </div>
              <div>
                <Label>…or paste rows here</Label>
                <textarea
                  value={text} onChange={(e) => { setText(e.target.value); setFile(null); }}
                  rows={7} placeholder={sample}
                  className="mt-1 w-full rounded-2xl border border-navy-200 bg-white p-3 font-mono text-xs dark:border-navy-700 dark:bg-navy-900"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl border border-green-100 bg-green-50 p-3 dark:border-green-900/40 dark:bg-green-950/20">
                  <p className="text-xl font-black text-green-700 dark:text-green-300">{result.created}</p>
                  <p className="text-[10px] uppercase text-green-600 dark:text-green-400">New books</p>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 dark:border-blue-900/40 dark:bg-blue-950/20">
                  <p className="text-xl font-black text-blue-700 dark:text-blue-300">{result.updated}</p>
                  <p className="text-[10px] uppercase text-blue-600 dark:text-blue-400">Copies added</p>
                </div>
                <div className="rounded-2xl border border-red-100 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-950/20">
                  <p className="text-xl font-black text-red-700 dark:text-red-300">{result.skipped}</p>
                  <p className="text-[10px] uppercase text-red-600 dark:text-red-400">Skipped</p>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="max-h-40 overflow-y-auto rounded-2xl border border-navy-100 p-3 text-xs dark:border-navy-800">
                  {result.errors.map((e, i) => (
                    <p key={i} className="text-red-600 dark:text-red-400">Row {e.row} ({e.title}): {e.message}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {mode !== "bundi" || result ? (
          <div className="mt-6 flex justify-end gap-2">
            {!result ? (
              <>
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button onClick={handleImport} disabled={importing || (!text.trim() && !file)}>
                  {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />} Import
                </Button>
              </>
            ) : (
              <Button onClick={onClose}>Done</Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function AddBookDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {

  const { toast } = useToast();
  const [f, setF] = React.useState({ title: "", author: "", isbn: "", category: "", shelf: "", copiesTotal: "1" });
  const [file, setFile] = React.useState<UploadedFile | null>(null);
  const [saving, setSaving] = React.useState(false);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/library", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addBook", title: f.title, author: f.author || undefined,
          isbn: f.isbn || undefined, category: f.category || undefined, shelf: f.shelf || undefined,
          copiesTotal: Number(f.copiesTotal), fileUrl: file?.url, fileName: file?.fileName,
        }),
      });
      const json = await res.json();
      if (json.ok) { toast({ title: "Book added to the catalog", tone: "success" }); onDone(); }
      else toast({ title: json.error?.message || "Could not add the book", tone: "error" });
    } finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/40 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-card dark:bg-navy-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-base font-semibold text-navy-900 dark:text-navy-50">Add a book</h3>
          <button onClick={onClose} className="rounded-full p-1 text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-800" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          <div><Label>Title</Label><Input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. The River and the Source" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Author</Label><Input value={f.author} onChange={(e) => set("author", e.target.value)} placeholder="Margaret Ogola" /></div>
            <div><Label>Category</Label><Input value={f.category} onChange={(e) => set("category", e.target.value)} placeholder="Set book" /></div>
          </div>
          <div>
            <Label>ISBN / barcode</Label>
            <div className="flex items-center gap-2">
              <Input value={f.isbn} onChange={(e) => set("isbn", e.target.value)} placeholder="Scan with the phone or type" />
              <ScanLine className="h-5 w-5 shrink-0 text-navy-300" />
            </div>
            <p className="mt-1 text-xs text-navy-400">A phone barcode-scanner app types the code into this box.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Copies</Label><Input type="number" min={1} value={f.copiesTotal} onChange={(e) => set("copiesTotal", e.target.value)} /></div>
            <div><Label>Shelf</Label><Input value={f.shelf} onChange={(e) => set("shelf", e.target.value)} placeholder="B2" /></div>
          </div>
          <div>
            <Label>Digital copy (optional — PDF/DOC)</Label>
            {file ? (
              <p className="flex items-center gap-2 rounded-xl bg-warm-50 px-3 py-2 text-xs text-navy-600 dark:bg-navy-800 dark:text-navy-300">
                <FileText className="h-3.5 w-3.5" /> {file.fileName}
                <button onClick={() => setFile(null)} className="ml-auto text-navy-400 hover:text-red-600" aria-label="Remove file"><X className="h-3.5 w-3.5" /></button>
              </p>
            ) : (
              <div className="flex items-center gap-1 text-xs text-navy-400">
                <FileUpload category="library" accept="application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onUploaded={setFile} label="Upload digital copy" />
                <span>Students download it from the portal</span>
              </div>
            )}
          </div>
          <Button onClick={save} disabled={saving || !f.title.trim() || !f.copiesTotal} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add to catalog
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---- T.1 — Per-copy tracking dialog -----------------------------------

const COPY_STATUS_TONE: Record<string, "green" | "red" | "amber" | "neutral"> = {
  AVAILABLE: "green", OUT: "amber", LOST: "red", DAMAGED: "red", RETIRED: "neutral",
};

function CopiesDialog({ book, onClose, onChanged }: { book: Book; onClose: () => void; onChanged: () => void }) {
  const { toast } = useToast();
  const [copies, setCopies] = React.useState<CopyRow[] | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [genCount, setGenCount] = React.useState(String(book.copiesTotal || 1));

  const load = React.useCallback(async () => {
    const res = await fetch(`/api/library?copiesOf=${book.id}`);
    const json = await res.json();
    if (json.ok) setCopies(json.data.copies);
  }, [book.id]);
  React.useEffect(() => { load(); }, [load]);

  async function generate() {
    setBusy(true);
    try {
      const res = await fetch("/api/library", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generateCopies", bookId: book.id, count: Number(genCount) || undefined }),
      });
      const json = await res.json();
      if (json.ok) {
        toast({ title: json.data.created > 0 ? `${json.data.created} copy code(s) generated` : "No new codes needed — already up to date", tone: "success" });
        load(); onChanged();
      } else toast({ title: json.error?.message || "Failed to generate copy codes", tone: "error" });
    } finally { setBusy(false); }
  }

  async function setStatus(copyId: string, status: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/library", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setCopyStatus", copyId, status }),
      });
      const json = await res.json();
      if (json.ok) { toast({ title: `Copy marked ${status.toLowerCase()}`, tone: "success" }); load(); onChanged(); }
      else toast({ title: json.error?.message || "Failed to update copy status", tone: "error" });
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-3xl border border-navy-100 bg-white p-6 shadow-pop dark:border-navy-800 dark:bg-navy-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-navy-900 dark:text-navy-50 flex items-center gap-2"><Tag className="h-4 w-4 text-green-600" /> {book.title} — per-copy tracking</h3>
            <p className="text-xs text-navy-400">Each physical copy gets its own scannable QR code, so you can tell copy #1 apart from copy #7 of the same title.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-navy-400 hover:bg-navy-50 dark:hover:bg-navy-800" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        {copies === null ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}</div>
        ) : copies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-navy-200 bg-warm-50/60 p-6 text-center dark:border-navy-700 dark:bg-navy-800/40">
            <QrCode className="mx-auto h-8 w-8 text-navy-300" />
            <p className="mt-2 text-sm text-navy-600 dark:text-navy-300">No per-copy codes yet — this book tracks copies by plain count only.</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Input value={genCount} onChange={(e) => setGenCount(e.target.value)} type="number" min={1} className="w-20" />
              <Button onClick={generate} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />} Generate copy codes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-navy-500">{copies.length} of {book.copiesTotal} cop{book.copiesTotal === 1 ? "y" : "ies"} coded</p>
              <div className="flex items-center gap-2">
                {copies.length < book.copiesTotal && (
                  <Button size="sm" variant="secondary" onClick={generate} disabled={busy}>
                    <QrCode className="h-3.5 w-3.5" /> Add missing codes
                  </Button>
                )}
                <a href={`/api/library/labels/${book.id}`} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="secondary"><Printer className="h-3.5 w-3.5" /> Print A4 label sheet</Button>
                </a>
              </div>
            </div>
            <div className="max-h-80 space-y-1.5 overflow-y-auto">
              {copies.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 rounded-xl border border-navy-100 px-3 py-2 text-sm dark:border-navy-800">
                  <div className="min-w-0">
                    <span className="font-semibold text-navy-800 dark:text-navy-100">Copy {c.copyNo}</span>
                    <span className="ml-2 font-mono text-[10px] text-navy-400">{c.code}</span>
                    {c.currentHolder && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400">Out with {c.currentHolder.studentName} · due {c.currentHolder.dueDate}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge tone={COPY_STATUS_TONE[c.status] ?? "neutral"}>{c.status.toLowerCase()}</Badge>
                    {c.status !== "OUT" && (
                      <select
                        value={c.status}
                        onChange={(e) => setStatus(c.id, e.target.value)}
                        disabled={busy}
                        className="rounded-full border border-navy-200 bg-white px-2 py-1 text-[11px] dark:border-navy-700 dark:bg-navy-900"
                      >
                        {["AVAILABLE", "LOST", "DAMAGED", "RETIRED"].map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Out now + fines
// ---------------------------------------------------------------------------

function OutTab({ canManage }: { canManage: boolean }) {
  const { toast } = useToast();
  const { requireBiometric } = useBiometricGate();
  const [issues, setIssues] = React.useState<OpenIssue[] | null>(null);
  const [fines, setFines] = React.useState<Fine[] | null>(null);
  const [error, setError] = React.useState(false);
  const [busy, setBusy] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setError(false);
    try {
      const [a, b] = await Promise.all([
        fetch("/api/library?view=open").then((r) => r.json()),
        fetch("/api/library?view=fines").then((r) => r.json()),
      ]);
      if (a.ok) setIssues(a.data.issues); else setError(true);
      if (b.ok) setFines(b.data.fines);
    } catch { setError(true); }
  }, []);
  React.useEffect(() => { load(); }, [load]);

  async function doReturn(issue: OpenIssue) {
    // Gate the clearing of active book issues behind a Face ID / Fingerprint verification check!
    requireBiometric(`Clear book check-out: "${issue.bookTitle}"`, async () => {
      setBusy(issue.id);
      try {
        const res = await fetch("/api/library", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "return", issueId: issue.id, finePaid: false }),
        });
        const json = await res.json();
        if (json.ok) {
          toast({
            title: json.data.fineKes > 0
              ? `Returned — fine ${kes(json.data.fineKes)} (${json.data.daysOverdue} days late)`
              : "Returned on time ✓",
            tone: json.data.fineKes > 0 ? "error" : "success",
          });
          load();
        } else toast({ title: json.error?.message || "Could not return", tone: "error" });
      } finally { setBusy(null); }
    });
  }

  async function payFine(id: string) {
    const res = await fetch("/api/library", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "finePaid", issueId: id }),
    });
    const json = await res.json();
    if (json.ok) { toast({ title: "Fine collected ✓", tone: "success" }); load(); }
    else toast({ title: json.error?.message || "Failed", tone: "error" });
  }

  /** Founder rule: bill the fine onto the student's fee invoice instead of cash. */
  async function billFine(id: string) {
    const res = await fetch("/api/library", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "billFine", issueId: id }),
    });
    const json = await res.json();
    if (json.ok) { toast({ title: `Added to invoice ${json.data.invoiceNo} — family can pay via M-Pesa`, tone: "success" }); load(); }
    else toast({ title: json.error?.message || "Failed", tone: "error" });
  }

  if (error) return <LoadError onRetry={load} />;
  if (issues === null) return <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>;

  return (
    <div className="space-y-4">
      <FinePolicyCard canManage={canManage} onSaved={load} />
      {issues.length === 0 ? (
        <EmptyState icon={BookOpen} title="Nothing is out" description="Issued books appear here with live overdue fines." />
      ) : (
        <Card>
          <CardHeader><CardTitle>Out now — {issues.length} book{issues.length === 1 ? "" : "s"}</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y divide-navy-50 dark:divide-navy-800">
              {issues.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-navy-900 dark:text-navy-50">{i.bookTitle}{i.copyNo != null && <span className="ml-1.5 text-xs font-normal text-navy-400">(Copy {i.copyNo})</span>}</p>
                    <p className="text-xs text-navy-400">{i.studentName} · <span className="font-mono">{i.admissionNo}</span> · due {i.dueDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {i.overdue ? (
                      <Badge tone="red">{i.daysOverdue}d late · {kes(i.fineSoFarKes)}</Badge>
                    ) : (
                      <Badge tone="green">on time</Badge>
                    )}
                    {canManage && (
                      <Button size="sm" variant="secondary" onClick={() => doReturn(i)} disabled={busy === i.id}>
                        {busy === i.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Return
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {fines && fines.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Banknote className="h-4 w-4 text-red-500" /> Unpaid fines</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y divide-navy-50 dark:divide-navy-800">
              {fines.map((f) => (
                <li key={f.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-navy-900 dark:text-navy-50">{f.studentName} <span className="font-mono text-xs text-navy-400">{f.admissionNo}</span></p>
                    <p className="text-xs text-navy-400">{f.bookTitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone="red">{kes(f.fineKes)}</Badge>
                    {canManage && (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => payFine(f.id)}>Collect cash</Button>
                        <Button size="sm" variant="secondary" onClick={() => billFine(f.id)}>Add to invoice</Button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


function FinePolicyCard({ canManage, onSaved }: { canManage: boolean; onSaved: () => void }) {
  const { toast } = useToast();
  const [policy, setPolicy] = React.useState<{ finesEnabled: boolean; finePerDayKes: number } | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/library?view=policy").then((r) => r.json()).then((j) => j.ok && setPolicy(j.data)).catch(() => {});
  }, []);

  async function save() {
    if (!policy) return;
    setSaving(true);
    try {
      const res = await fetch("/api/library", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "finePolicy", finesEnabled: policy.finesEnabled, finePerDayKes: policy.finePerDayKes }),
      });
      const json = await res.json();
      if (json.ok) {
        setPolicy(json.data);
        toast({ title: "Library fine policy saved", tone: "success" });
        onSaved();
      } else toast({ title: json.error?.message || "Could not save fine policy", tone: "error" });
    } finally { setSaving(false); }
  }

  if (!policy) return null;
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-navy-900 dark:text-navy-50">Late-return fine policy</p>
          <p className="text-xs text-navy-500 dark:text-navy-400">
            {policy.finesEnabled ? `Enabled · ${kes(policy.finePerDayKes)} per overdue school day` : "Disabled · overdue returns do not create fines"}
          </p>
        </div>
        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-full border border-navy-100 px-3 py-2 text-xs text-navy-600 dark:border-navy-800 dark:text-navy-300">
              <input type="checkbox" checked={policy.finesEnabled} onChange={(e) => setPolicy({ ...policy, finesEnabled: e.target.checked })} className="h-4 w-4 rounded border-navy-300 text-green-600" />
              Fines on
            </label>
            <Input type="number" min={0} max={500} value={policy.finePerDayKes} onChange={(e) => setPolicy({ ...policy, finePerDayKes: Number(e.target.value) })} className="w-28" />
            <Button size="sm" onClick={save} disabled={saving}>{saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />} Save</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Issue a book (barcode-first flow)
// ---------------------------------------------------------------------------

interface BarcodeHit { id: string; title: string; author: string | null; shelf: string | null; copiesAvailable: number; copiesTotal: number; openIssues: { studentName: string; dueDate: string }[] }

function IssueTab({ onIssued }: { onIssued: () => void }) {
  const { toast } = useToast();
  const [barcode, setBarcode] = React.useState("");
  const [scannerOpen, setScannerOpen] = React.useState(false);
  const [scannerStatus, setScannerStatus] = React.useState("Camera scanner idle");
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const scanningRef = React.useRef(false);
  const [hit, setHit] = React.useState<BarcodeHit | null>(null);
  const [copyId, setCopyId] = React.useState(""); // T.1 — set when the scan resolves to an exact physical copy
  const [copyLabel, setCopyLabel] = React.useState("");
  const [books, setBooks] = React.useState<Book[]>([]);
  const [bookId, setBookId] = React.useState("");
  const [bookQuery, setBookQuery] = React.useState("");
  const [showBookHits, setShowBookHits] = React.useState(false);

  const [students, setStudents] = React.useState<StudentOpt[]>([]);
  const [staff, setStaff] = React.useState<StudentOpt[]>([]);
  const [studentId, setStudentId] = React.useState("");
  const [borrowerIsStaff, setBorrowerIsStaff] = React.useState(false);
  const [borrowerQuery, setBorrowerQuery] = React.useState("");
  const [showBorrowerHits, setShowBorrowerHits] = React.useState(false);

  const [dueDate, setDueDate] = React.useState(() => new Date(Date.now() + 3 * 3600_000 + 14 * 24 * 3600_000).toISOString().slice(0, 10));
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/library").then((r) => r.json()).then((j) => j.ok && setBooks(j.data.books)).catch(() => {});
    
    // Load students
    fetch("/api/students?status=ACTIVE").then((r) => r.json()).then((j) => {
      if (j.ok) setStudents(j.data.students.map((s: { id: string; name?: string; firstName: string; middleName?: string | null; lastName: string; admissionNo: string }) => ({
        id: s.id, name: s.name ?? [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" "), admissionNo: s.admissionNo,
      })));
    }).catch(() => {});

    // Load active staff for Teacher Borrowing eligibility (H.3)
    fetch("/api/conversations/recipients").then((r) => r.json()).then((j) => {
      if (j.ok) setStaff(j.data.recipients.map((r: any) => ({
        id: r.id, name: `${r.fullName} (Staff · ${r.roleLabel})`, admissionNo: "Staff",
      })));
    }).catch(() => {});
  }, []);

  const borrowers = [...students, ...staff];

  // Filtering lists for dropdown-free search
  const matchedBooks = books.filter((b) => 
    b.title.toLowerCase().includes(bookQuery.toLowerCase()) || 
    (b.isbn && b.isbn.toLowerCase().includes(bookQuery.toLowerCase()))
  );

  const matchedBorrowers = borrowers.filter((s) => 
    s.name.toLowerCase().includes(borrowerQuery.toLowerCase()) || 
    s.admissionNo.toLowerCase().includes(borrowerQuery.toLowerCase())
  );

  function stopBuiltInScanner() {
    scanningRef.current = false;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScannerOpen(false);
    setScannerStatus("Camera scanner idle");
  }

  React.useEffect(() => () => stopBuiltInScanner(), []);

  async function startBuiltInScanner() {
    try {
      setScannerOpen(true);
      setScannerStatus("Requesting camera permission…");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const hasBarcodeDetector = "BarcodeDetector" in window;
      let detector: any = null;
      if (hasBarcodeDetector) {
        try {
          const Detector = (window as any).BarcodeDetector;
          detector = new Detector({ formats: ["qr_code", "ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e"] });
        } catch {
          detector = null;
        }
      }

      scanningRef.current = true;
      setScannerStatus("Built-in camera active (`jsQR + BarcodeDetector`) — point at book barcode or copy QR");

      const loop = async () => {
        if (!scanningRef.current || !videoRef.current) return;
        try {
          if (videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0) {
            if (detector) {
              try {
                const codes = await detector.detect(videoRef.current);
                const value = codes?.[0]?.rawValue;
                if (value) {
                  setBarcode(value);
                  setScannerStatus(`Scanned ${value}`);
                  stopBuiltInScanner();
                  await scan(value);
                  return;
                }
              } catch {
                /* fallback to jsQR below */
              }
            }

            if (canvasRef.current) {
              const canvas = canvasRef.current;
              const video = videoRef.current;
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const decoded = jsQR(imageData.data, imageData.width, imageData.height);
                if (decoded && decoded.data) {
                  setBarcode(decoded.data);
                  setScannerStatus(`Scanned QR ${decoded.data}`);
                  stopBuiltInScanner();
                  await scan(decoded.data);
                  return;
                }
              }
            }
          }
        } catch { /* keep scanning */ }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    } catch {
      setScannerStatus("Camera permission denied or unavailable");
      toast({ title: "Camera scanner could not start. Type the ISBN/code below or use the simulator.", tone: "error" });
      stopBuiltInScanner();
    }
  }

  async function scan(overrideCode?: string) {
    const codeToCheck = overrideCode !== undefined ? overrideCode : barcode;
    if (!codeToCheck.trim()) return;
    const raw = codeToCheck.trim();
    if (overrideCode !== undefined) setBarcode(raw);
    setCopyId(""); setCopyLabel("");
    const res = await fetch(`/api/library?barcode=${encodeURIComponent(raw)}`);
    const json = await res.json();
    if (json.ok) {
      const d = json.data;
      setHit(d);
      setBookId(d.id);
      setBookQuery(d.title);
      const loanDays = d.loanPeriodDays || 14;
      const calcDue = new Date(Date.now() + 3 * 3600_000 + loanDays * 86400_000).toISOString().slice(0, 10);
      setDueDate(calcDue);
      toast({ title: `✓ Found: ${d.title} — Due date set to ${calcDue}`, description: "Book details auto-filled. Pick learner and press Issue.", tone: "success" });
      return;
    }
    const copyRes = await fetch(`/api/library?copyCode=${encodeURIComponent(raw)}`);
    const copyJson = await copyRes.json();
    if (copyJson.ok) {
      const d = copyJson.data;
      if (d.status !== "AVAILABLE") {
        toast({ title: `Copy ${d.copyNo} of "${d.title}" is not available (${d.status.toLowerCase()}).`, tone: "error" });
        setHit(null);
        return;
      }
      setBookId(d.bookId);
      setBookQuery(d.title);
      setCopyId(d.copyId);
      setCopyLabel(`Copy ${d.copyNo}`);
      setHit({ id: d.bookId, title: d.title, author: d.author, shelf: d.shelf, copiesAvailable: 1, copiesTotal: 1, openIssues: [] });
      const loanDays = d.loanPeriodDays || 14;
      const calcDue = new Date(Date.now() + 3 * 3600_000 + loanDays * 86400_000).toISOString().slice(0, 10);
      setDueDate(calcDue);
      toast({ title: `✓ Scanned Copy #${d.copyNo} of "${d.title}"`, description: `Due date set to ${calcDue}. Just select learner and tap Issue!`, tone: "success" });
      return;
    }
    setHit(null);
    toast({ title: json.error?.message || "Not found", tone: "error" });
  }

  async function issue() {
    setBusy(true);
    try {
      const res = await fetch("/api/library", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          borrowerIsStaff
            ? { action: "issue", bookId, copyId: copyId || undefined, staffUserId: studentId, dueDate }
            : { action: "issue", bookId, copyId: copyId || undefined, studentId, dueDate }
        ),
      });
      const json = await res.json();
      if (json.ok) { toast({ title: "Book issued successfully!", tone: "success" }); onIssued(); }
      else toast({ title: json.error?.message || "Could not issue book", tone: "error" });
    } finally { setBusy(false); }
  }

  return (
    <Card className="max-w-xl relative">
      <CardHeader><CardTitle className="flex items-center gap-2"><BookUp className="h-4 w-4 text-green-600" /> Issue a book</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Scan barcode / type ISBN / scan copy QR</Label>
          <div className="flex flex-wrap gap-2">
            <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && scan()} placeholder="9789966882XXX or COPY-001" />
            <Button variant="secondary" onClick={() => scan()}><ScanLine className="h-4 w-4 mr-1" /> Find</Button>
            <Button variant="secondary" onClick={startBuiltInScanner}><Camera className="h-4 w-4 mr-1" /> Built-in scanner</Button>
          </div>
          <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
            <div className="rounded-2xl border border-green-100 bg-green-50/60 px-3 py-2 text-green-800 dark:border-green-900/40 dark:bg-green-950/20 dark:text-green-200">
              <Camera className="mr-1 inline h-3.5 w-3.5" /> {scannerStatus}
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-3 py-2 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200">
              <Usb className="mr-1 inline h-3.5 w-3.5" /> External hardware scanner: not connected. Plug one in and it will type here automatically.
            </div>
          </div>

          {/* Quick-Test Book Simulation Bar */}
          <div className="mt-3 rounded-xl border border-dashed border-navy-200 bg-navy-50/60 p-2.5 dark:border-navy-700/60 dark:bg-navy-800/40">
            <p className="flex items-center gap-1 text-xs font-bold text-navy-700 dark:text-navy-300 mb-1.5">
              <Sparkles className="h-3 w-3 text-amber-500" /> Quick-Test Simulator Bar (Simulate camera barcode/QR capture):
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => scan("9789966112233")}
                className="rounded-full bg-white text-xs text-navy-700 border border-navy-300 dark:bg-navy-900 dark:text-navy-200"
              >
                ⚡ Test ISBN `9789966112233`
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => scan("9789966223344")}
                className="rounded-full bg-white text-xs text-navy-700 border border-navy-300 dark:bg-navy-900 dark:text-navy-200"
              >
                ⚡ Test ISBN `9789966223344`
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => scan("COPY-001")}
                className="rounded-full bg-white text-xs text-green-700 border border-green-300 dark:bg-navy-900 dark:text-green-300"
              >
                ⚡ Test Copy QR `COPY-001`
              </Button>
            </div>
          </div>

          {scannerOpen && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-green-200 bg-navy-950 p-3 text-center">
              <div className="relative mx-auto max-w-sm overflow-hidden rounded-xl border-2 border-green-500 shadow-lg">
                <video ref={videoRef} className="h-48 w-full rounded-xl object-cover" muted playsInline />
                <div className="absolute inset-0 border-4 border-dashed border-green-400/60 pointer-events-none animate-pulse" />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <Button size="sm" variant="secondary" onClick={stopBuiltInScanner} className="mt-2.5 rounded-full">Stop scanner</Button>
            </div>
          )}
        </div>

        {hit && (
          <div className={`rounded-2xl border p-3 text-sm ${hit.copiesAvailable > 0 ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20" : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20"}`}>
            <p className="font-semibold text-navy-900 dark:text-navy-50">
              {hit.title} {copyLabel && <Badge tone="blue">{copyLabel}</Badge>}
            </p>
            <p className="text-xs text-navy-500 dark:text-navy-300">{hit.author ?? "—"}{hit.shelf ? ` · shelf ${hit.shelf}` : ""} · {copyLabel ? "this exact copy scanned" : `${hit.copiesAvailable}/${hit.copiesTotal} available`}</p>
            {hit.copiesAvailable === 0 && hit.openIssues[0] && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-300">All copies out — next due back {hit.openIssues[0].dueDate} ({hit.openIssues[0].studentName}).</p>
            )}
          </div>
        )}

        {/* Search Only Book Catalog Selection (H.3) */}
        <div className="relative">
          <Label>Search Book Catalog</Label>
          {bookId ? (
            <div className="mt-1.5 flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-300">
              <span className="truncate">{bookQuery}</span>
              <button onClick={() => { setBookId(""); setBookQuery(""); setHit(null); setCopyId(""); setCopyLabel(""); }} className="rounded-full p-0.5 hover:bg-green-500/10" aria-label="Clear book"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <div className="relative">
              <Input
                value={bookQuery}
                onChange={(e) => { setBookQuery(e.target.value); setShowBookHits(true); }}
                onFocus={() => setShowBookHits(true)}
                placeholder="Type book title or ISBN code..."
                className="mt-1.5"
              />
              {showBookHits && bookQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-2xl border border-navy-100 bg-white p-1.5 shadow-pop dark:border-navy-800 dark:bg-navy-950">
                  {matchedBooks.length === 0 ? (
                    <p className="p-3 text-center text-xs text-navy-400">No matching books found.</p>
                  ) : (
                    matchedBooks.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => { setBookId(b.id); setBookQuery(b.title); setShowBookHits(false); setCopyId(""); setCopyLabel(""); }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs hover:bg-navy-50 dark:hover:bg-navy-800"
                      >
                        <span className="font-semibold text-navy-800 dark:text-navy-100">{b.title}</span>
                        <Badge tone={b.copiesAvailable > 0 ? "green" : "red"}>{b.copiesAvailable} left</Badge>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Only Borrower (Student or Teacher) Selection (H.3) */}
        <div className="relative">
          <Label>Search Borrower (Student or Teacher)</Label>
          {studentId ? (
            <div className="mt-1.5 flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-300">
              <span className="truncate">{borrowerQuery}</span>
              <button onClick={() => { setStudentId(""); setBorrowerIsStaff(false); setBorrowerQuery(""); }} className="rounded-full p-0.5 hover:bg-green-500/10" aria-label="Clear borrower"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <div className="relative">
              <Input
                value={borrowerQuery}
                onChange={(e) => { setBorrowerQuery(e.target.value); setShowBorrowerHits(true); }}
                onFocus={() => setShowBorrowerHits(true)}
                placeholder="Type name, admission number, or TSC no..."
                className="mt-1.5"
              />
              {showBorrowerHits && borrowerQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 z-10 mt-1 max-h-40 w-full overflow-y-auto rounded-2xl border border-navy-100 bg-white p-1.5 shadow-pop dark:border-navy-800 dark:bg-navy-950">
                  {matchedBorrowers.length === 0 ? (
                    <p className="p-3 text-center text-xs text-navy-400">No matching borrowers found.</p>
                  ) : (
                    matchedBorrowers.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setStudentId(s.id); setBorrowerIsStaff(s.admissionNo === "Staff"); setBorrowerQuery(`${s.name} (${s.admissionNo})`); setShowBorrowerHits(false); }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs hover:bg-navy-50 dark:hover:bg-navy-800"
                      >
                        <span className="font-semibold text-navy-800 dark:text-navy-100">{s.name}</span>
                        <span className="font-mono text-[10px] text-navy-400">{s.admissionNo}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div><Label>Due date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
        <Button onClick={issue} disabled={busy || !bookId || !studentId || !dueDate} className="w-full">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookUp className="h-4 w-4" />} Issue book
        </Button>
      </CardContent>
    </Card>
  );
}

function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
      <AlertCircle className="h-4 w-4" /> Couldn&apos;t load. <button onClick={onRetry} className="font-medium underline">Retry</button>
    </div>
  );
}
