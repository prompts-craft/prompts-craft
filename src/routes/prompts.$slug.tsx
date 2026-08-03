import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight, Sparkles, Image as ImageIcon, Gauge, Palette, Layers, BookOpen, Calendar, User } from "lucide-react";
import { Layout } from "@/components/Layout";
import { CopyButton } from "@/components/CopyButton";
import { OpenInAIButtons } from "@/components/OpenInAIButtons";
import { CategoryIcon } from "@/components/CategoryIcon";
import { RouteError } from "@/components/RouteError";
import { getCategory } from "@/data/prompts";
import { fetchPromptBySlug, fetchRelated, type Prompt } from "@/lib/prompts-api";
import { promptThumb } from "@/lib/default-thumb";
import {
  getPromptDetails,
  getHowToUse,
  getExampleOutputSummary,
  getCustomizationTips,
  getFaqs,
  getSeoKeywords,
} from "@/lib/prompt-content";
import { PromptReviews } from "@/components/PromptReviews";
import { PromptAIRatings } from "@/components/PromptAIRatings";

const SITE_URL = "https://prompts-craft.lovable.app";

export const Route = createFileRoute("/prompts/$slug")({
  loader: async ({ params }) => {
    const prompt = await fetchPromptBySlug(params.slug);
    if (!prompt) throw notFound();
    const [category, related] = [getCategory(prompt.category), await fetchRelated(prompt.category, prompt.slug, 12)];
    return { prompt, category, related };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.prompt;
    if (!p) {
      return { meta: [{ title: "AI Prompt | PromptCraft" }] };
    }
    const title = `${p.title} — Free AI Prompt | PromptCraft`;
    const desc =
      (p.description ?? `Copy the "${p.title}" AI prompt instantly.`).slice(0, 155) +
      ` Free, one-click copy. Works with GPT-4o, Claude, Midjourney & more.`;
    const url = `${SITE_URL}/prompts/${params.slug}`;
    const image = p.image_url ?? `${SITE_URL}/og-default.jpg`;
    const keywords = getSeoKeywords(p).join(", ");
    const faqs = getFaqs(p);
    const category = getCategory(p.category);

    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: keywords },
        { property: "og:title", content: `${p.title} — AI Prompt | PromptCraft` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${p.title} — AI Prompt | PromptCraft` },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: p.title,
            description: desc,
            image: [image],
            keywords,
            datePublished: p.created_at,
            dateModified: p.created_at,
            articleSection: category?.name ?? p.category,
            author: { "@type": "Organization", name: "PromptCraft" },
            publisher: {
              "@type": "Organization",
              name: "PromptCraft",
              logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.svg` },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
            url,
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              ...(category
                ? [{ "@type": "ListItem", position: 2, name: category.name, item: `${SITE_URL}/categories/${category.slug}` }]
                : []),
              { "@type": "ListItem", position: category ? 3 : 2, name: p.title, item: url },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "PromptCraft",
            url: SITE_URL,
            logo: `${SITE_URL}/favicon.svg`,
          }),
        },
      ],
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
  const details = getPromptDetails(prompt);
  const howTo = getHowToUse(prompt);
  const exampleSummary = getExampleOutputSummary(prompt);
  const tips = getCustomizationTips(prompt);
  const faqs = getFaqs(prompt);
  const updated = new Date(prompt.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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

        {/* How to Use */}
        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent" /> How to Use This Prompt
          </h2>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-muted-foreground">
            {howTo.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* Example Output */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">Example Output</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{exampleSummary}</p>
          {prompt.example && (
            <div className="mt-4 rounded-2xl border border-border bg-card/60 backdrop-blur p-6">
              <pre className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">{prompt.example}</pre>
            </div>
          )}
        </section>

        {/* Prompt Details Card */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">Prompt Details</h2>
          <div className="mt-4 rounded-2xl border border-border bg-card/60 backdrop-blur p-6 grid sm:grid-cols-2 gap-5">
            <DetailRow icon={<Sparkles className="w-4 h-4" />} label="Best AI Models" value={details.bestModels.join(" · ")} />
            <DetailRow icon={<ImageIcon className="w-4 h-4" />} label="Aspect Ratio" value={details.aspectRatio} />
            <DetailRow icon={<Palette className="w-4 h-4" />} label="Style" value={details.style} />
            <DetailRow icon={<Layers className="w-4 h-4" />} label="Quality" value={details.quality} />
            <DetailRow icon={<Gauge className="w-4 h-4" />} label="Difficulty" value={details.difficulty} />
            {category && (
              <DetailRow icon={<CategoryIcon slug={category.slug} className="w-4 h-4" />} label="Category" value={category.name} />
            )}
          </div>
        </section>

        {/* Customization Tips */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">Customization Tips</h2>
          <ul className="mt-4 space-y-2.5 text-[15px] text-muted-foreground">
            {tips.map((tip, i) => (
              <li key={i} className="flex gap-3 leading-relaxed">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">Frequently Asked Questions</h2>
          <div className="mt-4 divide-y divide-border/60 rounded-2xl border border-border bg-card/60 backdrop-blur">
            {faqs.map((f, i) => (
              <details key={i} className="group p-5">
                <summary className="cursor-pointer font-medium text-foreground/90 list-none flex items-center justify-between">
                  <span>{f.q}</span>
                  <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90 opacity-60" />
                </summary>
                <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Author & Last Updated */}
        <section className="mt-12 rounded-2xl border border-border bg-card/60 backdrop-blur p-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-accent" />
            <span>By <span className="text-foreground/90 font-medium">PromptCraft Team</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent" />
            <span>Last updated: <span className="text-foreground/90">{updated}</span></span>
          </div>
        </section>

        {/* AI Model Ratings */}
        <PromptAIRatings promptId={prompt.id} />

        {/* Reviews */}
        <PromptReviews promptId={prompt.id} />

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

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-accent-soft text-accent shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm text-foreground/90 mt-0.5 break-words">{value}</div>
      </div>
    </div>
  );
}
