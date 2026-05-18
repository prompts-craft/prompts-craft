import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowRight, SearchX } from "lucide-react";
import { Layout } from "@/components/Layout";
import { CopyButton } from "@/components/CopyButton";
import { RouteError } from "@/components/RouteError";
import { categories } from "@/data/prompts";
import { fetchAllPrompts, type Prompt } from "@/lib/prompts-api";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  loader: async () => {
    const prompts = await fetchAllPrompts();
    return { prompts };
  },
  head: () => ({
    meta: [
      { title: "PromptStack — AI Prompts for Real Work" },
      { name: "description", content: "Browse and copy AI prompts for teachers, students, freelancers, marketers, and developers. Free, fast, no signup." },
      { property: "og:title", content: "PromptStack — AI Prompts for Real Work" },
      { property: "og:description", content: "Browse and copy AI prompts for teachers, students, freelancers, marketers, and developers." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  errorComponent: ({ error, reset }) => (
    <Layout>
      <RouteError error={error} reset={reset} />
    </Layout>
  ),
  component: Index,
});

function Index() {
  const loaderData = Route.useLoaderData() as { prompts: Prompt[] };
  const initial: Prompt[] = loaderData.prompts;
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const { data: prompts = initial, isLoading } = useQuery<Prompt[]>({
    queryKey: ["prompts", "all"],
    queryFn: fetchAllPrompts,
    initialData: initial,
  });

  const results = useMemo(() => {
    if (!q.trim()) return [] as Prompt[];
    const needle = q.toLowerCase();
    return prompts.filter(
      (p) =>
        p.title.toLowerCase().includes(needle) ||
        (p.description ?? "").toLowerCase().includes(needle) ||
        p.category.toLowerCase().includes(needle) ||
        p.tags.some((t) => t.toLowerCase().includes(needle)),
    );
  }, [q, prompts]);

  const searching = q.trim().length > 0;
  const trending = prompts.filter((p) => p.trending);
  const latest = [...prompts]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  return (
    <Layout>
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground border border-border/60 rounded-full px-3 py-1 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          {prompts.length} prompts, no signup
        </div>
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
          AI Prompts for <span className="text-accent">Real Work</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
          A curated library of high-leverage prompts. Find one, copy it, ship faster.
        </p>

        <div className="mt-10 relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title, category, or tag…"
              className="w-full h-14 pl-12 pr-4 rounded-xl bg-card border border-border focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20 transition"
              aria-label="Search prompts"
            />
          </div>
          {searching && results.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 rounded-xl bg-card border border-border shadow-lg overflow-hidden z-10 text-left max-h-96 overflow-y-auto">
              {results.slice(0, 8).map((p) => (
                <button
                  key={p.slug}
                  onClick={() => navigate({ to: "/prompts/$slug", params: { slug: p.slug } })}
                  className="w-full px-4 py-3 hover:bg-muted/60 transition flex items-center justify-between gap-4 text-left"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{p.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{p.description}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          )}
          {searching && results.length === 0 && (
            <div className="absolute left-0 right-0 mt-2 rounded-xl bg-card border border-border shadow-lg z-10 px-4 py-6 text-center text-sm text-muted-foreground">
              <SearchX className="w-5 h-5 mx-auto mb-2 opacity-60" />
              No prompts match "{q}". Try a different keyword.
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-6">Browse by profession</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/categories/$slug"
              params={{ slug: c.slug }}
              className="group rounded-xl border border-border bg-card p-5 hover:border-accent/60 hover:bg-muted/40 transition"
            >
              <div className="text-2xl mb-3">{c.emoji}</div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">Trending</h2>
          <span className="text-sm text-muted-foreground">Most copied this week</span>
        </div>
        {isLoading && trending.length === 0 ? (
          <CardSkeletonGrid />
        ) : trending.length === 0 ? (
          <EmptyState message="No trending prompts yet." />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trending.map((p) => (
              <PromptCard key={p.slug} prompt={p} />
            ))}
          </div>
        )}
      </section>

      {/* Latest */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold tracking-tight mb-6">Latest</h2>
        {isLoading && latest.length === 0 ? (
          <CardSkeletonGrid n={4} />
        ) : latest.length === 0 ? (
          <EmptyState message="No prompts yet — check back soon." />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {latest.map((p) => (
              <PromptCard key={p.slug} prompt={p} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}

export function PromptCard({ prompt: p }: { prompt: Prompt }) {
  const cat = categories.find((c) => c.slug === p.category);
  return (
    <Link
      to="/prompts/$slug"
      params={{ slug: p.slug }}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 hover:border-accent/60 transition"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
          <span>{cat?.emoji}</span>
          {cat?.name ?? p.category}
        </span>
        {p.copy_count > 0 && (
          <span className="text-xs text-muted-foreground">· {p.copy_count} copies</span>
        )}
      </div>
      <div className="font-medium leading-snug group-hover:text-accent transition-colors">{p.title}</div>
      {p.description && (
        <div className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{p.description}</div>
      )}
      {p.tags.length > 0 && (
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {p.tags.slice(0, 4).map((t) => (
            <span key={t} className="text-[11px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground">
              #{t}
            </span>
          ))}
        </div>
      )}
      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">Open prompt →</span>
        <CopyButton
          text={p.prompt}
          slug={p.slug}
          label="Copy"
          size="sm"
          variant="ghost"
          stopPropagation
        />
      </div>
    </Link>
  );
}

function CardSkeletonGrid({ n = 6 }: { n?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: n }).map((_, i) => (
        <Skeleton key={i} className="h-44 rounded-xl" />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
