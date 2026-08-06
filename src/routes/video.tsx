import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles, Video } from "lucide-react";
import { Layout } from "@/components/Layout";
import { CategoryIcon } from "@/components/CategoryIcon";
import { MediaTabs } from "@/components/MediaTabs";
import { RouteError } from "@/components/RouteError";
import { fetchCategories, useCategories, type CategoryRow } from "@/lib/categories-api";

export const Route = createFileRoute("/video")({
  loader: async () => ({ cats: await fetchCategories() }),
  head: () => ({
    meta: [
      { title: "Video AI Prompts — PromptCraft" },
      {
        name: "description",
        content:
          "A growing library of AI video prompts for Sora, Runway, Veo and more. Browse video prompt categories and copy them in one click.",
      },
      { property: "og:title", content: "Video AI Prompts — PromptCraft" },
      {
        property: "og:description",
        content: "AI video prompt categories for Sora, Runway, Veo and other video models.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/video" }],
  }),
  errorComponent: ({ error, reset }) => (
    <Layout>
      <RouteError error={error} reset={reset} />
    </Layout>
  ),
  component: VideoPage,
});

function VideoPage() {
  const { cats } = Route.useLoaderData() as { cats: CategoryRow[] };
  const { data: allCats = [] } = useCategories(cats);
  const videoCats = allCats.filter((c) => c.media_type === "video");

  return (
    <Layout>
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 grid-pattern pointer-events-none" />
        <div aria-hidden className="absolute inset-x-0 -top-20 h-[560px] bg-hero-glow pointer-events-none" />
        <div aria-hidden className="glow-orb w-[420px] h-[420px] left-[-120px] top-24 bg-[oklch(0.7_0.2_300)]" />
        <div aria-hidden className="glow-orb w-[360px] h-[360px] right-[-100px] top-10 bg-[oklch(0.78_0.14_220)]" />
        <div className="relative max-w-3xl mx-auto px-6 pt-24 sm:pt-32 pb-16 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground border border-border/80 bg-card/50 backdrop-blur rounded-full pl-2 pr-3 py-1 mb-8 shadow-glow-soft">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium text-accent bg-accent-soft px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" /> Coming soon
            </span>
            <span>Video prompts are being added</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-semibold tracking-tight leading-[1.02] text-gradient">
            AI Video Prompts.
            <br />
            <span className="text-gradient-accent">Motion That Converts.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Prompts for Sora, Runway, Veo and other video models. We're curating this library right
            now — new video prompts land here first.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
              Browse video prompts
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Video prompt categories
            </h2>
          </div>
          <MediaTabs active="video" />
        </div>

        {videoCats.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-14 text-center">
            <span className="inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-accent-soft text-accent mb-4">
              <Video className="w-6 h-6" />
            </span>
            <div className="font-medium">No video prompts yet</div>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
              Video categories and prompts will appear here as soon as they're published. Meanwhile,
              explore the image prompt library.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90"
            >
              Browse image prompts <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {videoCats.map((c) => (
              <Link
                key={c.slug}
                to="/categories/$slug"
                params={{ slug: c.slug }}
                search={{ sort: "latest" as const }}
                className="group prompt-glow gradient-border relative rounded-2xl border border-border bg-card/60 backdrop-blur p-5 hover:bg-card transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
              >
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
        )}
      </section>
    </Layout>
  );
}
