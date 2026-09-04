import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowRight, SearchX, ArrowUpRight, Sparkles, TrendingUp, Clock } from "lucide-react";
import { Layout } from "@/components/Layout";
import { CopyButton } from "@/components/CopyButton";
import { CategoryIcon } from "@/components/CategoryIcon";
import { RouteError } from "@/components/RouteError";
import { useCategories, fetchCategories, type CategoryRow } from "@/lib/categories-api";
import { MediaTabs } from "@/components/MediaTabs";
import { PromptShowcase } from "@/components/PromptShowcase";
import { CategoryBar } from "@/components/CategoryBar";

import { fetchAllPrompts, type Prompt } from "@/lib/prompts-api";
import { promptThumb } from "@/lib/default-thumb";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [prompts, cats] = await Promise.all([fetchAllPrompts(), fetchCategories()]);
    return { prompts, cats };
  },
  head: () => ({
    meta: [
      { title: "AI Prompts for ChatGPT & AI Image Generators | PromptCraft" },
      {
        name: "description",
        content:
          "PromptCraft offers high-quality AI prompts for ChatGPT, AI image generation, creative work and productivity. Browse, copy and use them free — no signup.",
      },
      { property: "og:title", content: "AI Prompts for ChatGPT & AI Image Generators | PromptCraft" },
      {
        property: "og:description",
        content:
          "High-quality AI prompts for ChatGPT, AI image generation, creative work and productivity. Copy any prompt in one click — free, no signup.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://promptscraft.org/" },
    ],
    links: [{ rel: "canonical", href: "https://promptscraft.org/" }],
  }),

  errorComponent: ({ error, reset }) => (
    <Layout>
      <RouteError error={error} reset={reset} />
    </Layout>
  ),
  component: Index,
});

function Index() {
  const loaderData = Route.useLoaderData() as { prompts: Prompt[]; cats: CategoryRow[] };
  const initial: Prompt[] = loaderData.prompts;
  const { data: allCats = [] } = useCategories(loaderData.cats);
  const imageCats = allCats.filter((c) => c.media_type !== "video");
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
  const byNewest = useMemo(
    () =>
      prompts
        .filter((p) => p.media_type !== "video")
        .sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
    [prompts],
  );


  // Fill a list with fallback prompts so every new prompt surfaces on the home page.
  const fill = (base: Prompt[], pool: Prompt[], n: number) => {
    const out = [...base];
    for (const p of pool) {
      if (out.length >= n) break;
      if (!out.some((x) => x.slug === p.slug)) out.push(p);
    }
    return out.slice(0, n);
  };

  const spotlight = useMemo(
    () =>
      byNewest.filter(
        (p) => p.category === "youtube-thumbnail" || p.category === "creative-images" || p.category === "creative-image",
      ),
    [byNewest],
  );

  const featured = fill(
    byNewest.filter((p) => p.featured),
    [...spotlight, ...byNewest],
    8,
  );
  const featuredSlugs = new Set(featured.map((p) => p.slug));
  const trending = fill(
    byNewest.filter((p) => p.trending && !featuredSlugs.has(p.slug)),
    [...byNewest]
      .filter((p) => !featuredSlugs.has(p.slug))
      .sort((a, b) => b.copy_count - a.copy_count),
    8,
  );
  const usedSlugs = new Set([...featuredSlugs, ...trending.map((p) => p.slug)]);
  const latest = fill(
    byNewest.filter((p) => !usedSlugs.has(p.slug)),
    byNewest,
    8,
  );

  const showcase = useMemo(
    () => byNewest.filter((p) => p.showcase && p.media_type !== "video").slice(0, 8),
    [byNewest],
  );

  return (
    <Layout>
      <PromptShowcase prompts={showcase} />

      {/* Hero */}
      <section className="relative">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10 sm:pb-14 text-center">
          <div className="inline-flex max-w-full items-center gap-2 text-xs text-muted-foreground border border-border/80 bg-card/50 backdrop-blur rounded-full pl-2 pr-3 py-1 mb-6 sm:mb-8">
            <span className="inline-flex shrink-0 items-center gap-1 text-[10px] uppercase tracking-wider font-medium text-accent bg-accent-soft px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> New
            </span>
            <span className="truncate">{prompts.length} prompts · no signup required</span>
          </div>
          <h1 className="text-[2rem] leading-tight sm:text-5xl lg:text-6xl font-semibold tracking-tight sm:leading-[1.05]">
            AI Prompts for Better AI Images,
            <br />
            <span className="text-accent">Content &amp; Creative Work</span>
          </h1>
          <p className="mt-4 text-lg sm:text-2xl font-medium text-foreground/80">
            Craft Better Prompts. Get Better Results.
          </p>

          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            A curated library of high-leverage AI prompts for the work you actually ship.
            Find one, copy it, move on.
          </p>

          <div className="mt-8 sm:mt-12 relative">
            <div
              className={`relative rounded-2xl transition-shadow ${
                searching ? "shadow-glow" : "shadow-elevated"
              }`}
            >
              <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search prompts…"
                className="w-full h-14 sm:h-16 pl-12 sm:pl-14 pr-5 sm:pr-20 rounded-2xl bg-card/80 backdrop-blur border border-border focus:border-accent/60 focus:outline-none transition text-base placeholder:text-muted-foreground/70"
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

      {/* Popular categories (collapsed by default) */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 pt-4 pb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CategoryBar categories={imageCats} />
          <MediaTabs active="image" />
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <SectionHeader
          icon={<Sparkles className="w-4 h-4" />}
          eyebrow="Featured"
          title="YouTube thumbnails & creative picks"
          subtitle="A mixed selection of thumbnail and creative image prompts."
        />
        {isLoading && featured.length === 0 ? (
          <CardSkeletonGrid />
        ) : featured.length === 0 ? (
          <EmptyState message="No featured prompts yet." />
        ) : (
          <PromptGrid prompts={featured} />
        )}
      </section>

      {/* Trending */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
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
          <PromptGrid prompts={trending} />
        )}
      </section>

      {/* Latest */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
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
          <PromptGrid prompts={latest} />
        )}
      </section>

      {/* CTA */}
      <section className="max-w-[1500px] mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        <div className="rounded-2xl border border-border bg-card/60 px-5 py-10 sm:px-12 sm:py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Find the prompt that ships your next project
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Browse the full library by category, or explore video prompts. Free, no signup, one click to copy.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Link
              to="/categories/$slug"
              params={{ slug: imageCats[0]?.slug ?? "teachers" }}
              search={{ sort: "latest" as const }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
            >
              Browse all prompts <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/video"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors duration-200 hover:border-accent/50"
            >
              Explore video prompts <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export function PromptGrid({ prompts }: { prompts: Prompt[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {prompts.map((p) => (
        <PromptCard key={p.slug} prompt={p} />
      ))}
    </div>
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
  const { data: cats = [] } = useCategories();
  const cat = cats.find((c) => c.slug === p.category);
  return (
    <Link
      to="/prompts/$slug"
      params={{ slug: p.slug }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur transition-all duration-200 hover:border-accent/50 hover:bg-card hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <div className="relative w-full overflow-hidden border-b border-border/60 bg-muted/40">
        <img
          src={promptThumb(p.image_url)}
          alt={`AI-generated example result for the ${cat?.name ?? p.category} prompt: ${p.title}`}
          loading="lazy"
          decoding="async"
          className="w-full h-auto object-contain transition-transform duration-200 group-hover:scale-[1.03]"
        />
      </div>


      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-md bg-accent-soft px-2 py-1 text-xs font-medium text-accent">
            <CategoryIcon slug={p.category} className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{cat?.name ?? p.category}</span>
          </span>
          {p.copy_count > 0 && (
            <span className="shrink-0 text-xs text-muted-foreground">{p.copy_count} copies</span>
          )}
        </div>

        <h3 className="mt-3 line-clamp-2 text-base font-medium leading-snug text-foreground/95 transition-colors group-hover:text-foreground">
          {p.title}
        </h3>
        {p.description && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {p.description}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-4">
          <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors duration-200 group-hover:bg-primary/90">
            View Prompt <ArrowRight className="w-3.5 h-3.5" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
      {Array.from({ length: n }).map((_, i) => (
        <Skeleton key={i} className="h-72 rounded-2xl" />
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
