import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { categories, getCategory, getPromptsByCategory, type Prompt } from "@/data/prompts";

export const Route = createFileRoute("/categories/$slug")({
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw notFound();
    return { category, prompts: getPromptsByCategory(params.slug) };
  },
  head: ({ loaderData, params }) => {
    const name = loaderData?.category.name ?? "Category";
    return {
      meta: [
        { title: `${name} AI Prompts — PromptStack` },
        { name: "description", content: `Curated AI prompts for ${name.toLowerCase()}. ${loaderData?.category.description ?? ""}` },
        { property: "og:title", content: `${name} AI Prompts — PromptStack` },
        { property: "og:description", content: loaderData?.category.description ?? "" },
        { property: "og:url", content: `/categories/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/categories/${params.slug}` }],
    };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold">Category not found</h1>
        <Link to="/" className="text-accent mt-4 inline-block">Back home</Link>
      </div>
    </Layout>
  ),
});

function CategoryPage() {
  const { category, prompts } = Route.useLoaderData();
  return (
    <Layout>
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        <div className="text-sm text-muted-foreground mb-2">
          <Link to="/" className="hover:text-foreground">Home</Link> / Categories
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{category.emoji}</span>
          <h1 className="text-4xl font-semibold tracking-tight">{category.name}</h1>
        </div>
        <p className="text-muted-foreground mt-2 max-w-2xl">{category.description}</p>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/categories/$slug"
              params={{ slug: c.slug }}
              className="text-sm px-3 py-1.5 rounded-full border border-border hover:border-accent/60 transition"
              activeProps={{ className: "border-accent bg-accent/10 text-accent" }}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {prompts.length === 0 ? (
          <p className="text-muted-foreground">No prompts in this category yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prompts.map((p: Prompt) => (
              <Link
                key={p.slug}
                to="/prompts/$slug"
                params={{ slug: p.slug }}
                className="block rounded-xl border border-border bg-card p-5 hover:border-accent/60 transition group"
              >
                <div className="font-medium group-hover:text-accent transition-colors">{p.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{p.description}</div>
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {p.tags.map((t: string) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
