import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { blogPosts } from "@/data/blog-posts";

export const Route = createFileRoute("/blog")({
  component: BlogPage,
  head: () => ({
    meta: [
      { title: "Blog — AI Prompt Guides & Tutorials | PromptCraft" },
      {
        name: "description",
        content:
          "Practical guides on the best AI prompts for teachers, students, freelancers, and productivity. Copy-ready prompts, no fluff.",
      },
      {
        name: "keywords",
        content:
          "AI prompt guides, best AI prompts, ChatGPT tutorials, AI for productivity, AI for teachers, AI for students",
      },
      { property: "og:title", content: "Blog — AI Prompt Guides | PromptCraft" },
      {
        property: "og:description",
        content: "Practical AI prompt guides for real work — teaching, studying, freelancing, and productivity.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/blog" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "PromptCraft Blog",
          description: "AI prompt guides and tutorials.",
          blogPost: blogPosts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            description: p.description,
            datePublished: p.date,
            url: `/blog/${p.slug}`,
          })),
        }),
      },
    ],
  }),
});

function BlogPage() {
  const [featured, ...rest] = blogPosts;

  return (
    <Layout>
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-10">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Blog</div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mt-3">
          AI prompt guides for real work
        </h1>
        <p className="text-lg text-muted-foreground mt-4">
          Short, opinionated guides on getting more out of AI — for teachers, students, freelancers, and everyone trying to ship more in less time.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-20">
        <Link
          to="/blog/$slug"
          params={{ slug: featured.slug }}
          className="group block rounded-2xl border border-border bg-card overflow-hidden hover:border-accent/60 transition"
        >
          <div className={`h-56 sm:h-64 bg-gradient-to-br ${featured.gradient}`} aria-hidden />
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
              <span>{featured.category}</span>
              <span>·</span>
              <span>{featured.date}</span>
              <span>·</span>
              <span>{featured.readingTime}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold mt-3 group-hover:text-accent transition-colors">
              {featured.title}
            </h2>
            <p className="text-muted-foreground mt-3">{featured.description}</p>
          </div>
        </Link>

        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {rest.map((p) => (
            <Link
              key={p.slug}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-accent/60 transition"
            >
              <div className={`h-36 bg-gradient-to-br ${p.gradient}`} aria-hidden />
              <div className="p-5">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">
                  {p.category} · {p.readingTime}
                </div>
                <h3 className="text-lg font-medium mt-2 group-hover:text-accent transition-colors">
                  {p.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
}
