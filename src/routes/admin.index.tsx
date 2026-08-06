import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, Layers, TrendingUp, Plus } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/lib/categories-api";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompts")
        .select("id, slug, title, category, trending, created_at, copy_count")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: categories = [] } = useCategories();
  const prompts = data ?? [];
  const total = prompts.length;
  const trending = prompts.filter((p) => p.trending).length;
  const byCategory = new Map<string, number>();
  for (const p of prompts) byCategory.set(p.category, (byCategory.get(p.category) ?? 0) + 1);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your prompt library.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/categories"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            <Layers className="w-4 h-4" /> Add category
          </Link>
          <Link
            to="/admin/prompts/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" /> New prompt
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total prompts" value={isLoading ? "…" : String(total)} icon={FileText} />
        <Stat label="Categories" value={String(categories.length)} icon={Layers} />
        <Stat label="Trending" value={isLoading ? "…" : String(trending)} icon={TrendingUp} />
      </div>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Latest prompts
        </h2>
        <div className="rounded-lg border border-border bg-card/40 divide-y divide-border">
          {isLoading && <div className="p-4 text-sm text-muted-foreground">Loading…</div>}
          {!isLoading && prompts.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">No prompts yet.</div>
          )}
          {prompts.slice(0, 8).map((p) => (
            <Link
              key={p.id}
              to="/admin/prompts/$id"
              params={{ id: p.id }}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/40 transition"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{p.title}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {p.category} · {new Date(p.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="text-xs text-muted-foreground shrink-0">
                {p.copy_count} copies
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Categories
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {categories.map((c) => (
            <div
              key={c.slug}
              className="rounded-lg border border-border bg-card/40 px-4 py-3"
            >
              <div className="text-sm font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {byCategory.get(c.slug) ?? 0} prompts
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/40 p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}
