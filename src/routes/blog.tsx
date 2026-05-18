import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/blog")({
  component: BlogPage,
  head: () => ({
    meta: [
      { title: "Blog — PromptStack" },
      { name: "description", content: "Essays on prompt engineering, AI workflows, and shipping with LLMs." },
      { property: "og:title", content: "Blog — PromptStack" },
      { property: "og:description", content: "Essays on prompt engineering and AI workflows." },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
});

const posts = [
  { title: "Why prompt templates beat one-shot prompts", date: "May 14, 2026", excerpt: "Reusable scaffolds compound. Here's how to design ones you'll actually reuse." },
  { title: "The 80/20 of prompt engineering for non-engineers", date: "May 2, 2026", excerpt: "Five patterns that account for most of the quality gap between casual and pro users." },
  { title: "Copy, paste, ship: a workflow for AI-assisted writing", date: "April 21, 2026", excerpt: "How to turn an empty page into a finished draft in under fifteen minutes." },
];

function BlogPage() {
  return (
    <Layout>
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-12">
        <h1 className="text-4xl font-semibold tracking-tight">Blog</h1>
        <p className="text-muted-foreground mt-3">Notes on prompt engineering and AI workflows.</p>
      </section>
      <section className="max-w-3xl mx-auto px-6 pb-20 space-y-3">
        {posts.map((p) => (
          <article key={p.title} className="rounded-xl border border-border bg-card p-6 hover:border-accent/60 transition">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{p.date}</div>
            <h2 className="text-xl font-medium mt-2">{p.title}</h2>
            <p className="text-muted-foreground mt-2">{p.excerpt}</p>
          </article>
        ))}
      </section>
    </Layout>
  );
}
