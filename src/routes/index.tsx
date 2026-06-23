import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowRight, SearchX, ArrowUpRight, Sparkles, TrendingUp, Clock } from "lucide-react";
import { Layout } from "@/components/Layout";
import { CopyButton } from "@/components/CopyButton";
import { CategoryIcon } from "@/components/CategoryIcon";
import { RouteError } from "@/components/RouteError";
import { categories } from "@/data/prompts";
import { fetchAllPrompts, type Prompt } from "@/lib/prompts-api";
import { promptThumb } from "@/lib/default-thumb";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  loader: async () => {
    const prompts = await fetchAllPrompts();
    return { prompts };
  },
  head: () => ({
    meta: [
      { title: "PromptCraft — AI Prompts for Real Work" },
      { name: "description", content: "Browse and copy AI prompts for teachers, students, freelancers, marketers, and developers. Free, fast, no signup." },
      { property: "og:title", content: "PromptCraft — AI Prompts for Real Work" },
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
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 grid-pattern pointer-events-none" />
        <div aria-hidden className="absolute inset-x-0 -top-20 h-[560px] bg-hero-glow pointer-events-none" />
        <div aria-hidden className="glow-orb w-[420px] h-[420px] left-[-120px] top-24 bg-[oklch(0.7_0.2_300)]" />
        <div aria-hidden className="glow-orb w-[360px] h-[360px] right-[-100px] top-10 bg-[oklch(0.78_0.14_220)]" />
        <div className="relative max-w-3xl mx-auto px-6 pt-24 sm:pt-32 pb-20 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground border border-border/80 bg-card/50 backdrop-blur rounded-full pl-2 pr-3 py-1 mb-8 shadow-glow-soft">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium text-accent bg-accent-soft px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> New
            </span>
            <span>{prompts.length} prompts · no signup required</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-semibold tracking-tight leading-[1.02] text-gradient">
            Craft Better Prompts.
            <br />
            <span className="text-gradient-accent">Get Better Results.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            A curated library of high-leverage AI prompts for the work you actually ship.
            Find one, copy it, move on.
          </p>

          <div className="mt-12 relative">
            <div
              className={`relative rounded-2xl transition-shadow ${
                searching ? "shadow-glow" : "shadow-elevated"
              }`}
            >
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title, category, or tag…"
                className="w-full h-16 pl-14 pr-20 rounded-2xl bg-card/80 backdrop-blur border border-border focus:border-accent/60 focus:outline-none transition text-base placeholder:text-muted-foreground/70"
                aria-label="Search prompts"
              />
              <kbd className="hidden sm:inline-flex absolute right-5 top-1/2 -translate-y-1/2 items-center gap-1 text-[10px] font-mono text-muted-foreground border border-border bg-background/70 rounded-md px-1.5 py-0.5">
                /
              </kbd>
            </div>
            {searching && results.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-popover border border-border shadow-elevated overflow-hidden z-10 text-left max-h-96 overflow-y-auto">
                {results.slice(0, 8).map((p) => (
                  <button
                    key={p.slug}
                    onClick={() => navigate({ to: "/prompts/$slug", params: { slug: p.slug } })}
                    className="w-full px-4 py-3 hover:bg-muted/60 transition flex items-center justify-between gap-4 text-left border-b border-border/40 last:border-0"
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
              <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-popover border border-border shadow-elevated z-10 px-4 py-8 text-center text-sm text-muted-foreground">
                <SearchX className="w-5 h-5 mx-auto mb-2 opacity-60" />
                No prompts match "{q}". Try a different keyword.
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 100% free
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" /> One-click copy
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> SEO-friendly URLs
            </span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Browse by profession
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Built for the way you work
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/categories/$slug"
              params={{ slug: c.slug }}
              search={{ sort: "latest" as const }}
              className="group prompt-glow gradient-border relative rounded-2xl border border-border bg-card/60 backdrop-blur p-5 hover:bg-card transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
            >
              <div
                aria-hidden
                className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-0 group-hover:opacity-100 transition"
              />
              <div className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-gradient-accent text-primary-foreground mb-4 group-hover:scale-105 transition-transform shadow-glow-soft">
                <CategoryIcon slug={c.slug} className="w-5 h-5" />
              </div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                {c.description}
              </div>
              <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-muted-foreground/40 group-hover:text-accent transition" />
            </Link>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <SectionHeader
          icon={<TrendingUp className="w-4 h-4" />}
          eyebrow="Trending"
          title="Most copied this week"
          subtitle="What the community is shipping with right now."
        />
        {isLoading && trending.length === 0 ? (
          <CardSkeletonGrid />
        ) : trending.length === 0 ? (
          <EmptyState message="No trending prompts yet." />
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
            {trending.map((p) => (
              <PromptCard key={p.slug} prompt={p} />
            ))}
          </div>
        )}
      </section>

      {/* Latest */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <SectionHeader
          icon={<Clock className="w-4 h-4" />}
          eyebrow="Latest"
          title="Fresh from the library"
          subtitle="New prompts added by the community and team."
        />
        {isLoading && latest.length === 0 ? (
          <CardSkeletonGrid n={4} />
        ) : latest.length === 0 ? (
          <EmptyState message="No prompts yet — check back soon." />
        ) : (
          <div className="columns-1 md:columns-2 gap-4 [column-fill:_balance]">
            {latest.map((p) => (
              <PromptCard key={p.slug} prompt={p} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}

function SectionHeader({
  icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-accent mb-3">
        <span className="inline-flex w-5 h-5 items-center justify-center rounded-md bg-accent-soft">
          {icon}
        </span>
        {eyebrow}
      </div>
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h2>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>
      )}
    </div>
  );
}

export function PromptCard({ prompt: p }: { prompt: Prompt }) {
  const cat = categories.find((c) => c.slug === p.category);
  return (
    <Link
      to="/prompts/$slug"
      params={{ slug: p.slug }}
      className="group prompt-glow gradient-border relative mb-4 break-inside-avoid flex flex-col rounded-2xl border border-border bg-card/60 backdrop-blur hover:bg-card transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-0 group-hover:opacity-100 transition"
      />
      <div className="w-full overflow-hidden border-b border-border/60 bg-muted/40">
        <img
          src={promptThumb(p.image_url)}
          alt={`Result of: ${p.title}`}
          loading="lazy"
          className="w-full h-auto block group-hover:scale-[1.02] transition-transform duration-300"
        />
      </div>
      <div className="flex flex-col p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-accent-soft text-accent font-medium">
          <CategoryIcon slug={p.category} className="w-3.5 h-3.5" />
          {cat?.name ?? p.category}
        </span>
        {p.copy_count > 0 && (
          <span className="text-xs text-muted-foreground">{p.copy_count} copies</span>
        )}
      </div>
      <div className="font-medium leading-snug text-foreground/95 group-hover:text-foreground transition-colors">
        {p.title}
      </div>
      {p.description && (
        <div className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
          {p.description}
        </div>
      )}
      {p.tags.length > 0 && (
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {p.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="text-[11px] px-2 py-0.5 rounded-md border border-border/60 text-muted-foreground"
            >
              #{t}
            </span>
          ))}
        </div>
      )}
      <div className="mt-5 pt-4 border-t border-border/60 flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground inline-flex items-center gap-1 group-hover:text-foreground transition">
          Open prompt <ArrowRight className="w-3 h-3" />
        </span>
        <CopyButton
          text={p.prompt}
          slug={p.slug}
          label="Copy"
          size="sm"
          variant="ghost"
          stopPropagation
        />
      </div>
      </div>
    </Link>
  );
}

function CardSkeletonGrid({ n = 6 }: { n?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: n }).map((_, i) => (
        <Skeleton key={i} className="h-44 rounded-2xl" />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
