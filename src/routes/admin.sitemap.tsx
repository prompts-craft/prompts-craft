import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/sitemap")({
  head: () => ({
    meta: [
      { title: "Sitemap — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminSitemapPage,
});

const SITEMAP_PATH = "/sitemap.xml";

type SitemapUrl = { loc: string; lastmod: string | null };

async function loadSitemap(): Promise<{ urls: SitemapUrl[]; xml: string }> {
  const res = await fetch(`${SITEMAP_PATH}?refresh=${Date.now()}`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  });
  if (!res.ok) throw new Error(`Sitemap request failed (${res.status})`);
  const xml = await res.text();
  const urls: SitemapUrl[] = [];
  const blocks = xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
  for (const block of blocks) {
    const loc = block.match(/<loc>([\s\S]*?)<\/loc>/)?.[1]?.trim();
    const lastmod = block.match(/<lastmod>([\s\S]*?)<\/lastmod>/)?.[1]?.trim() ?? null;
    if (loc) urls.push({ loc, lastmod });
  }
  return { urls, xml };
}

function groupOf(loc: string): string {
  try {
    const path = new URL(loc).pathname;
    if (path === "/") return "Home";
    if (path.startsWith("/prompts/")) return "Prompts";
    if (path.startsWith("/blog/")) return "Blog posts";
    if (path.startsWith("/categories/")) return "Categories";
    return "Pages";
  } catch {
    return "Pages";
  }
}

function AdminSitemapPage() {
  const [copied, setCopied] = useState(false);
  const { data, isFetching, refetch, error } = useQuery({
    queryKey: ["admin", "sitemap"],
    queryFn: loadSitemap,
    staleTime: 0,
    gcTime: 0,
  });

  const urls = data?.urls ?? [];
  const groups = urls.reduce<Record<string, number>>((acc, u) => {
    const g = groupOf(u.loc);
    acc[g] = (acc[g] ?? 0) + 1;
    return acc;
  }, {});

  async function handleRefresh() {
    const res = await refetch();
    if (res.error) toast.error("Could not refresh the sitemap");
    else toast.success(`Sitemap updated — ${res.data?.urls.length ?? 0} URLs`);
  }

  async function copyUrl() {
    const full = typeof window !== "undefined" ? window.location.origin + SITEMAP_PATH : SITEMAP_PATH;
    await navigator.clipboard.writeText(full);
    setCopied(true);
    toast.success("Sitemap URL copied");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sitemap</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The sitemap is generated live from your prompts, blogs and categories. Refresh to rebuild
            it and confirm every new URL is included.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyUrl}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} Copy URL
          </button>
          <a
            href={SITEMAP_PATH}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
          >
            <ExternalLink className="w-4 h-4" /> Open
          </a>
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            {isFetching ? "Updating…" : "Update sitemap"}
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load sitemap"}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-border bg-card/50 p-4">
          <div className="text-xs text-muted-foreground">Total URLs</div>
          <div className="mt-1 text-2xl font-semibold">{urls.length}</div>
        </div>
        {["Pages", "Categories", "Prompts", "Blog posts"].map((g) => (
          <div key={g} className="rounded-xl border border-border bg-card/50 p-4">
            <div className="text-xs text-muted-foreground">{g}</div>
            <div className="mt-1 text-2xl font-semibold">{groups[g] ?? 0}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="text-left font-medium px-4 py-2">URL</th>
              <th className="text-left font-medium px-4 py-2 w-32">Type</th>
              <th className="text-left font-medium px-4 py-2 w-32">Last modified</th>
            </tr>
          </thead>
          <tbody>
            {urls.length === 0 && !isFetching && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                  No URLs found.
                </td>
              </tr>
            )}
            {urls.map((u) => (
              <tr key={u.loc} className="border-t border-border/60">
                <td className="px-4 py-2 truncate max-w-[520px]">
                  <a href={u.loc} target="_blank" rel="noreferrer" className="hover:underline">
                    {u.loc}
                  </a>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{groupOf(u.loc)}</td>
                <td className="px-4 py-2 text-muted-foreground">{u.lastmod ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        After a big content update, resubmit <code>/sitemap.xml</code> in Google Search Console so
        Google recrawls sooner.
      </p>
    </div>
  );
}
