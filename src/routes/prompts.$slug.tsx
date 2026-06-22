import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Layout } from "@/components/Layout";
import { CopyButton } from "@/components/CopyButton";
import { OpenInAIButtons } from "@/components/OpenInAIButtons";
import { CategoryIcon } from "@/components/CategoryIcon";
import { RouteError } from "@/components/RouteError";
import { getCategory } from "@/data/prompts";
import { fetchPromptBySlug, fetchRelated, type Prompt } from "@/lib/prompts-api";
import { promptThumb } from "@/lib/default-thumb";

export const Route = createFileRoute("/prompts/$slug")({
  loader: async ({ params }) => {
    const prompt = await fetchPromptBySlug(params.slug);
    if (!prompt) throw notFound();
    const [category, related] = [getCategory(prompt.category), await fetchRelated(prompt.category, prompt.slug)];
    return { prompt, category, related };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.prompt;
    const title = p ? `${p.title} | PromptCraft` : "Prompt";
    const desc = p?.description ?? `Copy the "${p?.title}" AI prompt instantly. Free, no signup.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: p ? [...p.tags, "AI prompt", p.category].join(", ") : "AI prompt" },
        { property: "og:title", content: p?.title ?? "" },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/prompts/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: p?.title ?? "" },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: `/prompts/${params.slug}` }],
      scripts: p
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: p.title,
                description: desc,
                keywords: p.tags.join(", "),
                datePublished: p.created_at,
                articleSection: p.category,
                url: `/prompts/${params.slug}`,
              }),
            },
          ]
        : [],
    };
  },
  errorComponent: ({ error, reset }) => (
    <Layout>
      <RouteError error={error} reset={reset} />
    </Layout>
  ),
  notFoundComponent: () => (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold">Prompt not found</h1>
        <Link to="/" className="text-accent mt-4 inline-block">Back home</Link>
      </div>
    </Layout>
  ),
  component: PromptPage,
});

function PromptPage() {
  const { prompt, category, related } = Route.useLoaderData();

  return (
    <Layout>
      <article className="max-w-3xl mx-auto px-6 pt-14 pb-24">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-foreground transition">Home</Link>
          <ChevronRight className="w-3 h-3 opacity-60" />
          {category && (
            <Link
              to="/categories/$slug"
              params={{ slug: category.slug }}
              search={{ sort: "latest" as const }}
              className="hover:text-foreground transition"
            >
              {category.name}
            </Link>
          )}
          <ChevronRight className="w-3 h-3 opacity-60" />
          <span className="text-foreground/70 truncate">{prompt.title}</span>
        </nav>

        {category && (
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-accent-soft text-accent font-medium mb-5">
            <CategoryIcon slug={category.slug} className="w-3.5 h-3.5" />
            {category.name}
          </span>
        )}

        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gradient leading-[1.05]">
          {prompt.title}
        </h1>
        {prompt.description && (
          <p className="text-lg text-muted-foreground mt-4 leading-relaxed">{prompt.description}</p>
        )}

        {prompt.tags.length > 0 && (
          <div className="flex gap-1.5 mt-5 flex-wrap">
            {prompt.tags.map((t: string) => (
              <span
                key={t}
                className="text-xs px-2 py-0.5 rounded-md border border-border/60 text-muted-foreground"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        <figure className="mt-10 rounded-2xl overflow-hidden border border-border bg-card/60 shadow-elevated">
          <img
            src={promptThumb(prompt.image_url)}
            alt={`Example result for: ${prompt.title}`}
            loading="lazy"
            width={1024}
            height={640}
            className="w-full h-auto object-cover"
          />
          {prompt.image_url && (
            <figcaption className="px-5 py-2.5 text-xs text-muted-foreground border-t border-border/60 bg-background/40">
              Example result generated from this prompt.
            </figcaption>
          )}
        </figure>

        {/* Prompt box — main focus */}
        <div className="relative mt-10 rounded-2xl p-px bg-gradient-to-br from-accent/40 via-border to-border shadow-elevated">
          <div className="rounded-[15px] bg-card/90 backdrop-blur overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-background/40">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                </div>
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground ml-2">
                  Prompt
                </span>
              </div>
              <div className="hidden sm:block">
                <CopyButton text={prompt.prompt} slug={prompt.slug} />
              </div>
            </div>
            <pre className="p-6 text-sm whitespace-pre-wrap font-mono leading-[1.7] text-foreground/90">{prompt.prompt}</pre>
            <div className="px-5 py-3 border-t border-border/60 bg-background/40 sm:hidden">
              <CopyButton text={prompt.prompt} slug={prompt.slug} fullWidth />
            </div>
          </div>
        </div>

        <OpenInAIButtons prompt={prompt.prompt} />

        {/* Example */}
        {prompt.example && (
          <section className="mt-14">
            <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Example output
            </h2>
            <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-6">
              <pre className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">{prompt.example}</pre>
            </div>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
              Related prompts
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {related.map((r: Prompt) => (
                <Link
                  key={r.slug}
                  to="/prompts/$slug"
                  params={{ slug: r.slug }}
                  className="group block rounded-2xl border border-border bg-card/60 backdrop-blur p-5 hover:border-accent/40 hover:bg-card hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="font-medium group-hover:text-foreground transition">{r.title}</div>
                  <div className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {r.description}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </Layout>
  );
}
