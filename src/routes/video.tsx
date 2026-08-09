import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Video } from "lucide-react";
import { Layout } from "@/components/Layout";
import { MediaTabs } from "@/components/MediaTabs";
import { CategoryBar } from "@/components/CategoryBar";
import { PromptShowcase } from "@/components/PromptShowcase";
import { RouteError } from "@/components/RouteError";
import { PromptCard } from "@/routes/index";
import { fetchCategories, useCategories, type CategoryRow } from "@/lib/categories-api";
import { fetchAllPrompts, type Prompt } from "@/lib/prompts-api";

export const Route = createFileRoute("/video")({
  loader: async () => {
    const [cats, prompts] = await Promise.all([fetchCategories(), fetchAllPrompts()]);
    return { cats, prompts };
  },
  head: () => ({
    meta: [
      { title: "Video AI Prompts — PromptCraft" },
      {
        name: "description",
        content:
          "A growing library of AI video prompts for Sora, Runway, Veo and more. Browse video prompts and copy them in one click.",
      },
      { property: "og:title", content: "Video AI Prompts — PromptCraft" },
      {
        property: "og:description",
        content: "AI video prompts for Sora, Runway, Veo and other video models.",
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
  const { cats, prompts: initial } = Route.useLoaderData() as {
    cats: CategoryRow[];
    prompts: Prompt[];
  };
  const { data: allCats = [] } = useCategories(cats);
  const videoCats = allCats.filter((c) => c.media_type === "video");

  const { data: prompts = initial } = useQuery<Prompt[]>({
    queryKey: ["prompts", "all"],
    queryFn: fetchAllPrompts,
    initialData: initial,
  });

  const videoPrompts = useMemo(
    () =>
      prompts
        .filter((p) => p.media_type === "video")
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [prompts],
  );
  const showcase = videoPrompts.filter((p) => p.showcase).slice(0, 8);

  return (
    <Layout>
      <PromptShowcase prompts={showcase} />

      <section className="relative">
        <div className="relative max-w-3xl mx-auto px-6 pt-16 sm:pt-20 pb-10 text-center">
          <h1 className="text-5xl sm:text-7xl font-semibold tracking-tight leading-[1.02]">
            AI Video Prompts.
            <br />
            <span className="text-accent">Motion That Converts.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Prompts for Sora, Runway, Veo and other video models — copy one and start generating.
          </p>
        </div>
      </section>

      <section className="max-w-[1500px] mx-auto px-6 pt-2 pb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CategoryBar categories={videoCats} />
          <MediaTabs active="video" />
        </div>
      </section>

      <section className="max-w-[1500px] mx-auto px-6 pb-16">
        {videoPrompts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-14 text-center">
            <span className="inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-accent-soft text-accent mb-4">
              <Video className="w-6 h-6" />
            </span>
            <div className="font-medium">No video prompts yet</div>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
              Video prompts will appear here as soon as they're published. Meanwhile, explore the
              image prompt library.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90"
            >
              Browse image prompts <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 [column-fill:_balance]">
            {videoPrompts.map((p) => (
              <PromptCard key={p.slug} prompt={p} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
