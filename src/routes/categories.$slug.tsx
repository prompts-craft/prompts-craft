import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { CategoryIcon } from "@/components/CategoryIcon";
import { RouteError } from "@/components/RouteError";
import { fetchCategoryBySlug, useCategories } from "@/lib/categories-api";
import { fetchPromptsByCategory, type Prompt, type SortKey } from "@/lib/prompts-api";
import { PromptCard } from "@/routes/index";
import { z } from "zod";

const sortSchema = z.object({
  sort: z.enum(["latest", "trending", "most-copied"]).catch("latest").default("latest"),
});

export const Route = createFileRoute("/categories/$slug")({
  validateSearch: (s) => sortSchema.parse(s),
  loaderDeps: ({ search }) => ({ sort: search.sort }),
  loader: async ({ params, deps }) => {
    const category = await fetchCategoryBySlug(params.slug);
    if (!category) throw notFound();
    const prompts = await fetchPromptsByCategory(params.slug, deps.sort as SortKey);
    return { category, prompts };
  },
  head: ({ loaderData, params }) => {
    const name = loaderData?.category.name ?? "Category";
    const count = loaderData?.prompts.length ?? 0;
    const title = `${name} AI Prompts | PromptCraft`;
    const desc = `${count} curated AI prompts for ${name.toLowerCase()}. ${
      loaderData?.category.description ?? ""
    } Copy in one click — no signup required.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: `AI prompts for ${name.toLowerCase()}, ChatGPT prompts, ${name.toLowerCase()} AI tools, prompt library` },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/categories/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: `/categories/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: title,
            description: desc,
            url: `/categories/${params.slug}`,
          }),
        },
      ],
    };
  },
  component: CategoryPage,
  errorComponent: ({ error, reset }) => (
    <Layout>
      <RouteError error={error} reset={reset} />
    </Layout>
  ),
  notFoundComponent: () => (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold">Category not found</h1>
        <Link to="/" className="text-accent mt-4 inline-block">Back home</Link>
      </div>
    </Layout>
  ),
});

const SORTS: { key: SortKey; label: string }[] = [
  { key: "latest", label: "Latest" },
  { key: "trending", label: "Trending" },
  { key: "most-copied", label: "Most copied" },
];

function CategoryPage() {
  const { category, prompts } = Route.useLoaderData();
  const { data: allCats = [] } = useCategories();
  const siblings = allCats.filter((c) => c.media_type === category.media_type);
  const { sort } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <Layout>
      <section className="relative max-w-6xl mx-auto px-6 pt-20 pb-8">
        <div aria-hidden className="absolute inset-x-0 -top-10 h-72 bg-hero-glow pointer-events-none -z-10" />
        <div className="text-xs text-muted-foreground mb-3">
          <Link to="/" className="hover:text-foreground">Home</Link> · Categories
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <CategoryIcon slug={category.slug} className="w-6 h-6" />
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-gradient">{category.name} AI Prompts</h1>
        </div>
        <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">{category.description}</p>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/categories/$slug"
              params={{ slug: c.slug }}
              search={{ sort: "latest" as SortKey }}
              className="text-sm px-3 py-1.5 rounded-full border border-border hover:border-accent/60 transition"
              activeProps={{ className: "border-accent bg-accent/10 text-accent" }}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Sort tabs */}
        <div className="flex items-center justify-between mb-6 border-b border-border/60">
          <div className="flex gap-1">
            {SORTS.map((s) => {
              const active = s.key === sort;
              return (
                <button
                  key={s.key}
                  onClick={() => navigate({ to: ".", search: { sort: s.key }, replace: true })}
                  className={`px-3 py-2 text-sm transition border-b-2 -mb-px ${
                    active
                      ? "border-accent text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          <span className="text-xs text-muted-foreground">{prompts.length} prompts</span>
        </div>

        <h2 className="text-xl font-semibold tracking-tight mb-4">All {category.name} AI Prompts</h2>

        {prompts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
            No prompts in this category yet.
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
            {prompts.map((p: Prompt) => (
              <PromptCard key={p.slug} prompt={p} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
