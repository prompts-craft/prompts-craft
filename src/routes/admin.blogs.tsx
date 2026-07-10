import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Plus, Search, Trash2, Pencil, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { deleteAdminBlog } from "@/lib/admin-blogs.functions";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/blogs")({
  component: AdminBlogsRoute,
});

function AdminBlogsRoute() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return pathname === "/admin/blogs" ? <AdminBlogsList /> : <Outlet />;
}

function AdminBlogsList() {
  const qc = useQueryClient();
  const deleteBlog = useServerFn(deleteAdminBlog);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "published">("all");
  const [toDelete, setToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "blogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        (b.category ?? "").toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q)
      );
    });
  }, [data, query, status]);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteBlog({ data: { id: toDelete.id } });
      toast.success("Blog deleted");
      setToDelete(null);
      qc.invalidateQueries({ queryKey: ["admin", "blogs"] });
      qc.invalidateQueries({ queryKey: ["blogs"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Blogs</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage blog posts. Publish or save as draft.</p>
        </div>
        <Link
          to="/admin/blogs/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> New blog
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, slug or category…"
            className="w-full rounded-md border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "all" | "draft" | "published")}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      <div className="rounded-lg border border-border bg-card/40 overflow-hidden">
        {isLoading && <div className="p-4 text-sm text-muted-foreground">Loading…</div>}
        {!isLoading && filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">No blogs yet.</div>
        )}
        <ul className="divide-y divide-border">
          {filtered.map((b) => (
            <li key={b.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    to="/admin/blogs/$id"
                    params={{ id: b.id }}
                    className="text-sm font-medium truncate hover:underline"
                  >
                    {b.title}
                  </Link>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      b.status === "published"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  /blog/{b.slug} · {new Date(b.created_at).toLocaleDateString()}
                  {b.category ? ` · ${b.category}` : ""}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {b.status === "published" && (
                  <a
                    href={`/blog/${b.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs hover:bg-muted"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View
                  </a>
                )}
                <Link
                  to="/admin/blogs/$id"
                  params={{ id: b.id }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs hover:bg-muted"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </Link>
                <button
                  onClick={() => setToDelete({ id: b.id, title: b.title })}
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
            <AlertDialogTitle>Delete blog?</AlertDialogTitle>
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
    </div>
  );
}
