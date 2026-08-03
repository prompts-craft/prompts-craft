import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Layout } from "@/components/Layout";
import { fetchPublishedBlogs, type Blog } from "@/lib/blogs-api";

const PAGE_SIZE = 9;
const SITE = "https://prompts-craft.lovable.app";

export const Route = createFileRoute("/blog/")({
  loader: async ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["blogs", "published"],
      queryFn: fetchPublishedBlogs,
    }),
  component: BlogPage,
  head: () => ({
    meta: [
      { title: "Blog — AI Prompt Guides & Tutorials | PromptCraft" },
      {
        name: "description",
        content:
          "Practical guides on the best AI prompts for teachers, students, freelancers, and productivity. Copy-ready prompts, no fluff.",
      },
      { property: "og:title", content: "Blog — AI Prompt Guides | PromptCraft" },
      {
        property: "og:description",
        content: "Practical AI prompt guides for real work.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE}/blog` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE}/blog` }],
  }),
});

function formatDate(d: string | null): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function BlogPage() {
  const { data: blogs = [] } = useQuery({
    queryKey: ["blogs", "published"],
    queryFn: fetchPublishedBlogs,
  });
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo<Blog[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.description ?? "").toLowerCase().includes(q) ||
        (b.category ?? "").toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [blogs, query]);

  const shown = filtered.slice(0, visible);
  const [featured, ...rest] = shown;

  return (
    <Layout>
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-6">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">Blog</span>
        </nav>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mt-6">Blog</div>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mt-3">
          AI prompt guides for real work
        </h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
          Short, opinionated guides on getting more out of AI — for teachers, students, freelancers,
          and everyone trying to ship more in less time.
        </p>

        <div className="relative mt-8 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(PAGE_SIZE);
            }}
            placeholder="Search blog posts…"
            className="w-full rounded-full border border-border bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            aria-label="Search blogs"
          />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20">
        {shown.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            {query ? "No blogs match your search." : "No blogs published yet. Check back soon."}
          </div>
        )}

        {featured && <BlogCard blog={featured} featured />}

        {rest.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {rest.map((p) => (
              <BlogCard key={p.id} blog={p} />
            ))}
          </div>
        )}

        {visible < filtered.length && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="rounded-full border border-border bg-card px-5 py-2.5 text-sm hover:bg-muted"
            >
              Load more ({filtered.length - visible} left)
            </button>
          </div>
        )}
      </section>
    </Layout>
  );
}

function BlogCard({ blog, featured = false }: { blog: Blog; featured?: boolean }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: blog.slug }}
      className={`group block rounded-2xl border border-border bg-card overflow-hidden hover:border-accent/60 transition ${
        featured ? "" : ""
      }`}
    >
      <div
        className={`${featured ? "h-56 sm:h-72" : "h-40"} bg-muted overflow-hidden`}
        aria-hidden={!blog.featured_image}
      >
        {blog.featured_image ? (
          <img
            src={blog.featured_image}
            alt={blog.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.02] transition"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-pink-500/20" />
        )}
      </div>
      <div className={featured ? "p-6 sm:p-8" : "p-5"}>
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
          {blog.category && <span>{blog.category}</span>}
          {blog.category && (blog.published_at || blog.created_at) && <span>·</span>}
          <time dateTime={blog.published_at ?? blog.created_at}>
            {formatDate(blog.published_at ?? blog.created_at)}
          </time>
        </div>
        <h2
          className={`${featured ? "text-2xl sm:text-3xl" : "text-lg"} font-semibold mt-2 group-hover:text-accent transition-colors`}
        >
          {blog.title}
        </h2>
        {blog.description && (
          <p className={`text-muted-foreground mt-2 ${featured ? "" : "text-sm line-clamp-2"}`}>
            {blog.description}
          </p>
        )}
        <span className="inline-block mt-4 text-sm font-medium text-accent">
          Read the full guide: {blog.title} →
        </span>
      </div>
    </Link>
  );
}
