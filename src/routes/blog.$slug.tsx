import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo } from "react";
import DOMPurify from "dompurify";
import { Layout } from "@/components/Layout";
import { RouteError } from "@/components/RouteError";
import { fetchBlogBySlug, fetchBlogsBySlugs, fetchPublishedBlogs, type Blog } from "@/lib/blogs-api";

const SITE = "https://prompts-craft.lovable.app";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await fetchBlogBySlug(params.slug);
    if (!post) throw notFound();
    const [related, all] = await Promise.all([
      post.related_slugs.length > 0 ? fetchBlogsBySlugs(post.related_slugs) : Promise.resolve([]),
      fetchPublishedBlogs(),
    ]);
    // prev / next by publish date
    const sorted = all;
    const idx = sorted.findIndex((b) => b.slug === post.slug);
    const prev = idx >= 0 ? sorted[idx + 1] ?? null : null;
    const next = idx > 0 ? sorted[idx - 1] ?? null : null;
    return { post, related, prev, next };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.post;
    const title = p ? p.meta_title || `${p.title} | PromptCraft Blog` : "Blog";
    const desc = p ? p.meta_description || p.description || "" : "";
    const url = `${SITE}/blog/${params.slug}`;
    const img = p?.featured_image ?? undefined;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: p?.meta_title || p?.title || "" },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(img ? [{ property: "og:image", content: img }] : []),
        { property: "article:published_time", content: p?.published_at ?? p?.created_at ?? "" },
        ...(p?.category ? [{ property: "article:section", content: p.category }] : []),
        { name: "twitter:card", content: img ? "summary_large_image" : "summary" },
        { name: "twitter:title", content: p?.title ?? "" },
        { name: "twitter:description", content: desc },
        ...(img ? [{ name: "twitter:image", content: img }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: p
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                headline: p.title,
                description: desc,
                image: img,
                datePublished: p.published_at ?? p.created_at,
                dateModified: p.updated_at,
                mainEntityOfPage: url,
                url,
                articleSection: p.category ?? undefined,
                keywords: p.tags.join(", "),
                author: { "@type": "Organization", name: "PromptCraft" },
                publisher: {
                  "@type": "Organization",
                  name: "PromptCraft",
                  logo: { "@type": "ImageObject", url: `${SITE}/favicon.svg` },
                },
              }),
            },
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: SITE },
                  { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
                  { "@type": "ListItem", position: 3, name: p.title, item: url },
                ],
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
        <h1 className="text-3xl font-semibold">Post not found</h1>
        <p className="text-muted-foreground mt-2">
          The blog you're looking for doesn't exist or was removed.
        </p>
        <Link to="/blog" className="text-accent mt-4 inline-block">
          Back to blog
        </Link>
      </div>
    </Layout>
  ),
  component: BlogPostPage,
});

function formatDate(d: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function BlogPostPage() {
  const { post, related, prev, next } = Route.useLoaderData();

  const safeHtml = useMemo(
    () =>
      DOMPurify.sanitize(post.content, {
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target", "rel"],
      }),
    [post.content],
  );

  return (
    <Layout>
      <article className="max-w-3xl mx-auto px-6 pt-12 pb-20">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-1.5">/</span>
          <Link to="/blog" className="hover:text-foreground">Blog</Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground line-clamp-1 inline align-bottom">{post.title}</span>
        </nav>

        <div className="text-xs uppercase tracking-wider text-muted-foreground flex flex-wrap gap-3 items-center">
          {post.category && <span>{post.category}</span>}
          {post.category && <span>·</span>}
          <time dateTime={post.published_at ?? post.created_at}>
            {formatDate(post.published_at ?? post.created_at)}
          </time>
        </div>

        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mt-4 leading-tight">
          {post.title}
        </h1>
        {post.description && (
          <p className="text-lg text-muted-foreground mt-4">{post.description}</p>
        )}

        {post.featured_image ? (
          <img
            src={post.featured_image}
            alt={post.title}
            loading="eager"
            className="mt-10 w-full max-h-[28rem] object-cover rounded-2xl border border-border"
          />
        ) : (
          <div
            className="mt-10 h-56 sm:h-72 rounded-2xl bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-pink-500/30"
            aria-hidden
          />
        )}

        <div
          className="prose prose-lg prose-invert dark:prose-invert max-w-none mt-12
            prose-headings:tracking-tight prose-a:text-accent prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:border prose-img:border-border
            prose-blockquote:border-accent prose-blockquote:text-muted-foreground
            prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-muted prose-pre:border prose-pre:border-border
            prose-table:text-sm prose-th:bg-muted/40"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />

        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((t: string) => (
              <span
                key={t}
                className="text-xs px-2.5 py-1 rounded-full border border-border bg-card text-muted-foreground"
              >
                #{t}
              </span>
            ))}
          </div>
        )}

        {(prev || next) && (
          <nav
            aria-label="Post navigation"
            className="mt-14 grid sm:grid-cols-2 gap-3 border-t border-border pt-8"
          >
            {prev ? (
              <Link
                to="/blog/$slug"
                params={{ slug: prev.slug }}
                className="rounded-xl border border-border bg-card p-4 hover:border-accent/60 transition"
              >
                <div className="text-xs text-muted-foreground">← Previous</div>
                <div className="font-medium mt-1 line-clamp-2">{prev.title}</div>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                to="/blog/$slug"
                params={{ slug: next.slug }}
                className="rounded-xl border border-border bg-card p-4 hover:border-accent/60 transition sm:text-right"
              >
                <div className="text-xs text-muted-foreground">Next →</div>
                <div className="font-medium mt-1 line-clamp-2">{next.title}</div>
              </Link>
            ) : (
              <div />
            )}
          </nav>
        )}

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground mb-4">
              Related blogs
            </h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {related.map((r: Blog) => (
                <Link
                  key={r.id}
                  to="/blog/$slug"
                  params={{ slug: r.slug }}
                  className="group rounded-xl border border-border bg-card overflow-hidden hover:border-accent/60 transition"
                >
                  <div className="h-24 bg-muted overflow-hidden">
                    {r.featured_image ? (
                      <img
                        src={r.featured_image}
                        alt={r.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-pink-500/20" />
                    )}
                  </div>
                  <div className="p-4">
                    {r.category && (
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">
                        {r.category}
                      </div>
                    )}
                    <div className="font-medium mt-1 group-hover:text-accent transition-colors line-clamp-2">
                      {r.title}
                    </div>
                    {r.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {r.description}
                      </p>
                    )}
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
