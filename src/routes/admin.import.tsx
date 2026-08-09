import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { bulkImportPrompts } from "@/lib/admin-import.functions";

export const Route = createFileRoute("/admin/import")({
  head: () => ({ meta: [{ title: "Import Prompts — Admin" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: ImportPage,
});

const REQUIRED = ["title", "prompt", "category"] as const;
const OPTIONAL = ["type", "slug", "description", "example", "tags", "image_url"] as const;

type Row = Record<string, unknown>;

function normalizeKey(k: string) {
  return k.trim().toLowerCase().replace(/\s+/g, "_");
}

function ImportPage() {
  const runImport = useServerFn(bulkImportPrompts);
  const [fileName, setFileName] = useState<string | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [preview, setPreview] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof bulkImportPrompts>> | null>(null);

  async function handleFile(file: File) {
    setResult(null);
    setMissing([]);
    setPreview(null);
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<Row>(sheet, { defval: null });
      if (!raw.length) {
        toast.error("Sheet is empty");
        return;
      }
      // normalize keys
      const rows: Row[] = raw.map((r) => {
        const out: Row = {};
        for (const k of Object.keys(r)) out[normalizeKey(k)] = r[k];
        return out;
      });
      const headers = new Set(Object.keys(rows[0]));
      const miss = REQUIRED.filter((c) => !headers.has(c));
      if (miss.length) {
        setMissing(miss);
        return;
      }
      setPreview(rows);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to parse file");
    }
  }

  async function doImport() {
    if (!preview) return;
    setLoading(true);
    try {
      const rows = preview.map((r) => {
        const tagsVal = r.tags;
        let tags: string[] = [];
        if (Array.isArray(tagsVal)) tags = tagsVal.map(String);
        else if (typeof tagsVal === "string" && tagsVal.trim())
          tags = tagsVal.split(/[,;|]/).map((t) => t.trim()).filter(Boolean);
        return {
          title: String(r.title ?? "").trim(),
          slug: r.slug ? String(r.slug).trim() : null,
          category: String(r.category ?? "").trim(),
          description: r.description ? String(r.description) : null,
          prompt: String(r.prompt ?? "").trim(),
          example: r.example ? String(r.example) : null,
          tags,
          image_url: r.image_url ? String(r.image_url) : null,
          media_type:
            String(r.type ?? "").trim().toLowerCase() === "video"
              ? ("video" as const)
              : ("image" as const),
        };

      });
      const res = await runImport({ data: { rows } });
      setResult(res);
      toast.success(`Imported ${res.inserted} prompts`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Bulk import from XLSX</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a spreadsheet to auto-create prompts. New categories are created automatically.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card/40 p-5">
        <div className="text-sm font-medium mb-2">Required columns</div>
        <div className="flex flex-wrap gap-2 text-xs">
          {REQUIRED.map((c) => (
            <span key={c} className="px-2 py-1 rounded-md bg-accent/15 text-foreground">{c}</span>
          ))}
        </div>
        <div className="text-sm font-medium mt-4 mb-2">Optional columns</div>
        <div className="flex flex-wrap gap-2 text-xs">
          {OPTIONAL.map((c) => (
            <span key={c} className="px-2 py-1 rounded-md bg-muted text-muted-foreground">{c}</span>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          <code>tags</code> can be a comma-separated string. <code>slug</code> is auto-generated from the title if missing.
        </p>
      </div>

      <label className="block rounded-xl border-2 border-dashed border-border bg-card/30 p-8 text-center cursor-pointer hover:bg-card/50 transition">
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
        <div className="mt-3 text-sm font-medium">
          {fileName ? fileName : "Click to upload .xlsx / .csv"}
        </div>
        <div className="text-xs text-muted-foreground mt-1">Max 500 rows</div>
      </label>

      {missing.length > 0 && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm">
          <div className="flex items-center gap-2 font-medium text-destructive">
            <AlertTriangle className="w-4 h-4" /> Missing required column{missing.length > 1 ? "s" : ""}
          </div>
          <div className="mt-2 text-destructive/90">
            Your file is missing: <strong>{missing.join(", ")}</strong>. Add these columns and re-upload.
          </div>
        </div>
      )}

      {preview && !result && (
        <div className="rounded-xl border border-border bg-card/40 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <FileSpreadsheet className="w-4 h-4 text-accent" />
              <span className="font-medium">{preview.length} row{preview.length !== 1 ? "s" : ""} ready</span>
            </div>
            <button
              onClick={doImport}
              disabled={loading}
              className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? "Importing…" : "Import all"}
            </button>
          </div>
          <div className="mt-4 max-h-80 overflow-auto rounded-md border border-border/60">
            <table className="w-full text-xs">
              <thead className="bg-muted/40 sticky top-0">
                <tr>
                  {Object.keys(preview[0]).map((k) => (
                    <th key={k} className="text-left px-3 py-2 font-medium">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 20).map((r, i) => (
                  <tr key={i} className="border-t border-border/60">
                    {Object.keys(preview[0]).map((k) => (
                      <td key={k} className="px-3 py-2 max-w-[220px] truncate text-muted-foreground">
                        {String(r[k] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {preview.length > 20 && (
            <div className="text-xs text-muted-foreground mt-2">Showing first 20 of {preview.length} rows.</div>
          )}
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <div className="flex items-center gap-2 text-emerald-300 font-medium">
            <CheckCircle2 className="w-4 h-4" /> Imported {result.inserted} prompts
          </div>
          {result.createdCategories.length > 0 && (
            <div className="mt-2 text-sm text-emerald-200/90">
              New categories created: {result.createdCategories.join(", ")}
            </div>
          )}
          {result.errors.length > 0 && (
            <div className="mt-3 text-xs text-amber-200">
              <div className="font-medium mb-1">Skipped rows:</div>
              <ul className="space-y-0.5">
                {result.errors.map((e, i) => (
                  <li key={i}>Row {e.row}: {e.error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
