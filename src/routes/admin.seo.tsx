import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Wand2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { bulkUpdatePromptSeo } from "@/lib/admin-prompts.functions";
import { generateSeo, scoreSeo, scoreColor } from "@/lib/seo";
import type { Prompt } from "@/lib/prompts-api";

export const Route = createFileRoute("/admin/seo")({
  component: SeoDashboard,
});

type Filter = "all" | "missing" | "weak" | "noindex";

function SeoDashboard() {
  const qc = useQueryClient();
  const runBulk = useServerFn(bulkUpdatePromptSeo);
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState(false);

  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ["admin", "seo", "prompts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Prompt[];
    },
  });

  const rows = useMemo(
    () =>
      prompts.map((p) => ({
        p,
        ...scoreSeo({
          title: p.title,
          slug: p.slug,
          description: p.description,
          prompt: p.prompt,
          seo_title: p.seo_title,
          meta_description: p.meta_description,
          focus_keyword: p.focus_keyword,
          image_alt: p.image_alt,
          image_url: p.image_url,
          tags: p.tags,
          faq: p.faq ?? [],
        }),
      })),
    [prompts],
  );

  const visible = rows.filter(({ p, score }) => {
    if (filter === "missing") return !p.seo_title || !p.meta_description;
    if (filter === "weak") return score < 70;
    if (filter === "noindex") return p.index_status === "noindex" || p.status === "draft";
    return true;
  });

  const average = rows.length ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length) : 0;
  const missing = rows.filter((r) => !r.p.seo_title || !r.p.meta_description).length;
  const dupTitles = new Set(
    Object.entries(
      rows.reduce<Record<string, number>>((acc, r) => {
        const key = (r.p.seo_title ?? r.p.title).trim().toLowerCase();
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {}),
    )
      .filter(([, n]) => n > 1)
      .map(([k]) => k),
  );

  async function fillMissing() {
    const targets = rows.filter((r) => !r.p.seo_title || !r.p.meta_description || !r.p.image_alt);
    if (!targets.length) {
      toast.info("Every prompt already has SEO text.");
      return;
    }
    setBusy(true);
    try {
      const updates = targets.map(({ p }) => {
        const gen = generateSeo({
          title: p.title,
          slug: p.slug,
          description: p.description,
          prompt: p.prompt,
          category: p.category,
          categoryName: p.category,
          subcategory: p.subcategory,
          tags: p.tags,
          ai_model: p.ai_model,
          use_cases: p.use_cases,
          media_type: p.media_type,
        });
        return {
          id: p.id,
          values: {
            seo_title: p.seo_title || gen.seo_title,
            meta_description: p.meta_description || gen.meta_description,
            focus_keyword: p.focus_keyword || gen.focus_keyword,
            secondary_keywords: p.secondary_keywords?.length ? p.secondary_keywords : gen.secondary_keywords,
            seo_keywords: p.seo_keywords?.length ? p.seo_keywords : gen.seo_keywords,
            image_alt: p.image_alt || gen.image_alt,
            og_title: p.og_title || gen.og_title,
            og_description: p.og_description || gen.og_description,
          },
        };
      });
      const res = await runBulk({ data: { updates } });
      toast.success(`SEO text filled in for ${res.updated} prompt(s)`);
      qc.invalidateQueries({ queryKey: ["admin"] });
      qc.invalidateQueries({ queryKey: ["prompts"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bulk update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">SEO Health</h1>
          <p className="text-sm text-muted-foreground mt-1">
            A content checklist across every prompt. It reflects our own guidelines, not Google's ranking system.
          </p>
        </div>
        <button
          onClick={fillMissing}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
        >
          <Wand2 className="w-4 h-4" /> {busy ? "Working…" : "Fill missing SEO text"}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Prompts" value={String(rows.length)} />
        <Stat label="Average score" value={`${average}/100`} className={scoreColor(average)} />
        <Stat label="Missing title or description" value={String(missing)} />
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "missing", "weak", "noindex"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs capitalize transition ${
              filter === f ? "bg-accent/20 text-foreground" : "border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "weak" ? "Score below 70" : f === "missing" ? "Missing SEO text" : f === "noindex" ? "Hidden from Google" : "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Prompt</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Issues</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {visible.map(({ p, score, checks }) => {
                const issues = checks.filter((c) => c.state !== "good");
                const dup = dupTitles.has((p.seo_title ?? p.title).trim().toLowerCase());
                return (
                  <tr key={p.id} className="border-t border-border/60 align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">/prompts/{p.slug}</div>
                      {(p.status === "draft" || p.index_status === "noindex") && (
                        <span className="mt-1 inline-block rounded bg-amber-500/15 px-1.5 py-0.5 text-[11px] text-amber-300">
                          {p.status === "draft" ? "Draft" : "Noindex"}
                        </span>
                      )}
                      {dup && (
                        <span className="mt-1 ml-1 inline-block rounded bg-red-500/15 px-1.5 py-0.5 text-[11px] text-red-300">
                          Duplicate title
                        </span>
                      )}
                    </td>
                    <td className={`px-4 py-3 font-semibold ${scoreColor(score)}`}>{score}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {issues.length === 0 ? "No issues" : issues.slice(0, 3).map((i) => i.label).join(", ")}
                      {issues.length > 3 && ` +${issues.length - 3} more`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link
                        to="/admin/prompts/$id"
                        params={{ id: p.id }}
                        className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                      >
                        Edit <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${className}`}>{value}</div>
    </div>
  );
}
