import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { blogPosts, getBlogPost, type BlogPost, type BlogSection } from "@/data/blog-posts";
import { fetchPromptsByCategory, type Prompt } from "@/lib/prompts-api";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = getBlogPost(params.slug);
    if (!post) throw notFound();
    let relatedPrompts: Prompt[] = [];
    if (post.relatedPromptCategory) {
      try {
        const rows = await fetchPromptsByCategory(post.relatedPromptCategory, "trending");
        relatedPrompts = rows.slice(0, 3);
      } catch {
        relatedPrompts = [];
      }
    }
    const relatedPosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
    return { post, relatedPrompts, relatedPosts };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.post;
    const title = p ? `${p.title} | PromptStack Blog` : "Blog";
    const desc = p?.description ?? "";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: p?.keywords.join(", ") ?? "" },
        { property: "og:title", content: p?.title ?? "" },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/blog/${params.slug}` },
        { property: "article:published_time", content: p?.date ?? "" },
        { property: "article:section", content: p?.category ?? "" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: p?.title ?? "" },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: `/blog/${params.slug}` }],
      scripts: p
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                headline: p.title,
                description: desc,
                keywords: p.keywords.join(", "),
                datePublished: p.date,
                articleSection: p.category,
                url: `/blog/${params.slug}`,
              }),
            },
          ]
        : [],
    };
  },
  notFoundComponent: () => (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold">Post not found</h1>
        <Link to="/blog" className="text-accent mt-4 inline-block">
          Back to blog
        </Link>
      </div>
    </Layout>
  ),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post, relatedPrompts, relatedPosts } = Route.useLoaderData();

  return (
    <Layout>
      <article className="max-w-3xl mx-auto px-6 pt-12 pb-20">
        <div className="text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-foreground">Home</Link>
          {" / "}
          <Link to="/blog" className="hover:text-foreground">Blog</Link>
        </div>

        <div className="text-xs uppercase tracking-wider text-muted-foreground flex gap-3">
          <span>{post.category}</span>
          <span>·</span>
          <span>{post.date}</span>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mt-4 leading-tight">
          {post.title}
        </h1>
        <p className="text-lg text-muted-foreground mt-4">{post.description}</p>

        <div
          className={`mt-10 h-56 sm:h-72 rounded-2xl bg-gradient-to-br ${post.gradient}`}
          aria-hidden
        />

        <div className="mt-12 space-y-10">
          <p className="text-lg leading-relaxed text-foreground/90">{post.intro}</p>

          {post.sections.map((s: BlogSection) => (
            <section key={s.heading}>
              <h2 className="text-2xl font-semibold tracking-tight mt-2">{s.heading}</h2>
              <div className="mt-4 space-y-4">
                {s.body.map((para: string, i: number) => (
                  <p key={i} className="text-base leading-relaxed text-foreground/85">
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {relatedPrompts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
              Related prompts
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedPrompts.map((r: Prompt) => (
                <Link
                  key={r.slug}
                  to="/prompts/$slug"
                  params={{ slug: r.slug }}
                  className="block rounded-xl border border-border bg-card p-4 hover:border-accent/60 transition"
                >
                  <div className="font-medium">{r.title}</div>
                  {r.description && (
                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {r.description}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-16 rounded-2xl border border-border bg-gradient-to-br from-accent/10 via-primary/5 to-transparent p-8">
          <h2 className="text-2xl font-semibold tracking-tight">{post.cta.title}</h2>
          <p className="text-muted-foreground mt-2">{post.cta.body}</p>
          <a
            href={post.cta.href}
            className="inline-flex items-center mt-5 px-5 py-2.5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 transition"
          >
            {post.cta.label} →
          </a>
        </section>

        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
              Keep reading
            </h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {relatedPosts.map((r: BlogPost) => (
                <Link
                  key={r.slug}
                  to="/blog/$slug"
                  params={{ slug: r.slug }}
                  className="group rounded-xl border border-border bg-card overflow-hidden hover:border-accent/60 transition"
                >
                  <div className={`h-24 bg-gradient-to-br ${r.gradient}`} aria-hidden />
                  <div className="p-4">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {r.category}
                    </div>
                    <div className="font-medium mt-1 group-hover:text-accent transition-colors">
                      {r.title}
                    </div>
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
