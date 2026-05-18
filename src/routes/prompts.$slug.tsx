import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { CopyButton } from "@/components/CopyButton";
import { RouteError } from "@/components/RouteError";
import { getCategory } from "@/data/prompts";
import { fetchPromptBySlug, fetchRelated, type Prompt } from "@/lib/prompts-api";

export const Route = createFileRoute("/prompts/$slug")({
  loader: async ({ params }) => {
    const prompt = await fetchPromptBySlug(params.slug);
    if (!prompt) throw notFound();
    const [category, related] = [getCategory(prompt.category), await fetchRelated(prompt.category, prompt.slug)];
    return { prompt, category, related };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.prompt;
    const title = p ? `${p.title} — AI Prompt | PromptStack` : "Prompt";
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
      <article className="max-w-3xl mx-auto px-6 pt-12 pb-20">
        <div className="text-sm text-muted-foreground mb-3">
          <Link to="/" className="hover:text-foreground">Home</Link>
          {" / "}
          {category && (
            <Link to="/categories/$slug" params={{ slug: category.slug }} className="hover:text-foreground">
              {category.name}
            </Link>
          )}
        </div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">{prompt.title}</h1>
        {prompt.description && (
          <p className="text-lg text-muted-foreground mt-3">{prompt.description}</p>
        )}

        <div className="flex gap-1.5 mt-4 flex-wrap">
          {prompt.tags.map((t: string) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
              #{t}
            </span>
          ))}
        </div>

        {/* Prompt box */}
        <div className="mt-10 rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Prompt</span>
            <CopyButton text={prompt.prompt} slug={prompt.slug} />
          </div>
          <pre className="p-5 text-sm whitespace-pre-wrap font-mono leading-relaxed">{prompt.prompt}</pre>
          <div className="px-5 py-3 border-t border-border bg-muted/20 sm:hidden">
            <CopyButton text={prompt.prompt} slug={prompt.slug} fullWidth />
          </div>
        </div>

        {/* Example */}
        {prompt.example && (
          <section className="mt-12">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">Example output</h2>
            <div className="rounded-xl border border-border bg-card p-5">
              <pre className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">{prompt.example}</pre>
            </div>
          </section>
        )}

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">Related prompts</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {related.map((r: Prompt) => (
                <Link
                  key={r.slug}
                  to="/prompts/$slug"
                  params={{ slug: r.slug }}
                  className="block rounded-xl border border-border bg-card p-4 hover:border-accent/60 transition"
                >
                  <div className="font-medium">{r.title}</div>
                  <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.description}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </Layout>
  );
}
