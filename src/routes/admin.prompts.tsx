import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Plus, Search, Trash2, Pencil, TrendingUp, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/lib/categories-api";
import { deleteAdminPrompt } from "@/lib/admin-prompts.functions";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/prompts")({
  component: AdminPromptsRoute,
});

function AdminPromptsRoute() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return pathname === "/admin/prompts" ? <AdminPromptsList /> : <Outlet />;
}

function AdminPromptsList() {
  const qc = useQueryClient();
  const deletePrompt = useServerFn(deleteAdminPrompt);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const { data: categories = [] } = useCategories();
  const [toDelete, setToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "prompts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags ?? []).some((t: string) => t.toLowerCase().includes(q))
      );
    });
  }, [data, query, category]);

  const [exporting, setExporting] = useState(false);

  function exportExcel() {
    const rows = data ?? [];
    if (!rows.length) {
      toast.error("No prompts to export");
      return;
    }
    setExporting(true);
    try {
      const list = (v: unknown) => (Array.isArray(v) ? (v as string[]).join(", ") : "");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sheetRows = rows.map((p: any) => ({
        title: p.title,
        slug: p.slug,
        category: p.category,
        type: p.media_type ?? "image",
        status: p.status ?? "published",
        prompt: p.prompt,
        description: p.description ?? "",
        example: p.example ?? "",
        tags: list(p.tags),
        image_url: p.image_url ?? "",
        subcategory: p.subcategory ?? "",
        ai_model: p.ai_model ?? "",
        difficulty: p.difficulty ?? "",
        author: p.author ?? "",
        how_to_use: p.how_to_use ?? "",
        customization_tips: p.customization_tips ?? "",
        use_cases: p.use_cases ?? "",
        seo_title: p.seo_title ?? "",
        meta_description: p.meta_description ?? "",
        focus_keyword: p.focus_keyword ?? "",
        secondary_keywords: list(p.secondary_keywords),
        image_alt: p.image_alt ?? "",
        trending: p.trending ? "yes" : "no",
        featured: p.featured ? "yes" : "no",
        showcase: p.showcase ? "yes" : "no",
        copy_count: p.copy_count ?? 0,
        created_at: p.created_at ?? "",
        updated_at: p.updated_at ?? "",
      }));
      const ws = XLSX.utils.json_to_sheet(sheetRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Prompts");
      XLSX.writeFile(wb, `promptcraft-prompts-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success(`Exported ${sheetRows.length} prompts`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  function toggleOne(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const allVisibleSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  const someVisibleSelected = filtered.some((p) => selected.has(p.id));

  function toggleAll(checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) filtered.forEach((p) => next.add(p.id));
      else filtered.forEach((p) => next.delete(p.id));
      return next;
    });
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deletePrompt({ data: { id: toDelete.id } });
      toast.success("Prompt deleted");
      setToDelete(null);
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["prompts"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete prompt");
    } finally {
      setDeleting(false);
    }
  }

  async function confirmBulkDelete() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    setBulkDeleting(true);
    let ok = 0;
    let fail = 0;
    try {
      const results = await Promise.allSettled(
        ids.map((id) => deletePrompt({ data: { id } })),
      );
      results.forEach((r) => (r.status === "fulfilled" ? ok++ : fail++));
      if (ok) toast.success(`Deleted ${ok} prompt${ok === 1 ? "" : "s"}`);
      if (fail) toast.error(`Failed to delete ${fail} prompt${fail === 1 ? "" : "s"}`);
      setSelected(new Set());
      setBulkConfirm(false);
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["prompts"] });
    } finally {
      setBulkDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">All prompts</h1>
          <p className="text-sm text-muted-foreground mt-1">Search, edit, or remove prompts.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportExcel}
            disabled={exporting || isLoading}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60"
          >
            <Download className="w-4 h-4" /> {exporting ? "Exporting…" : "Export Excel"}
          </button>
          <Link
            to="/admin/prompts/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" /> New prompt
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, category or tag…"
            className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 px-4 py-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <Checkbox
              checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
              onCheckedChange={(v) => toggleAll(v === true)}
            />
            {selected.size > 0
              ? `${selected.size} selected`
              : "Select all"}
          </label>
          {selected.size > 0 && (
            <button
              onClick={() => setBulkConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete selected
            </button>
          )}
        </div>
      )}

      <div className="rounded-lg border border-border bg-card/40 overflow-hidden">
        {isLoading && <div className="p-4 text-sm text-muted-foreground">Loading…</div>}
        {!isLoading && filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">No prompts found.</div>
        )}
        <ul className="divide-y divide-border">
          {filtered.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30"
            >
              <Checkbox
                checked={selected.has(p.id)}
                onCheckedChange={(v) => toggleOne(p.id, v === true)}
                aria-label={`Select ${p.title}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    to="/admin/prompts/$id"
                    params={{ id: p.id }}
                    className="text-sm font-medium truncate hover:underline"
                  >
                    {p.title}
                  </Link>
                  {p.trending && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-accent">
                      <TrendingUp className="w-3 h-3" /> Trending
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  {p.category} · /{p.slug} · {p.copy_count} copies
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  to="/admin/prompts/$id"
                  params={{ id: p.id }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs hover:bg-muted"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Link>
                <button
                  onClick={() => setToDelete({ id: p.id, title: p.title })}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete prompt?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes "{toDelete?.title}". This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkConfirm} onOpenChange={(o) => !bulkDeleting && setBulkConfirm(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selected.size} prompt{selected.size === 1 ? "" : "s"}?</AlertDialogTitle>
            <AlertDialogDescription>
              The selected prompts will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              disabled={bulkDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkDeleting ? "Deleting…" : "Delete all"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
