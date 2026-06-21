import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — PromptCraft" },
      { name: "description", content: "PromptCraft is a Nexura product: a free library of AI prompts curated for working professionals." },
      { property: "og:title", content: "About — PromptCraft" },
      { property: "og:description", content: "A Nexura product offering a free library of AI prompts curated for working professionals." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

function AboutPage() {
  return (
    <Layout>
      <section className="max-w-2xl mx-auto px-6 pt-20 pb-20">
        <h1 className="text-4xl font-semibold tracking-tight">About PromptCraft</h1>
        <div className="prose prose-invert mt-6 text-muted-foreground space-y-4 leading-relaxed">
          <p>
            PromptCraft is a free, curated library of AI prompts built for people who actually use them at work —
            teachers, students, freelancers, marketers, and developers.
          </p>
          <p>
            PromptCraft is a product of Nexura, created to make practical AI workflows faster, cleaner, and easier
            to use every day.
          </p>
          <p>
            Every prompt here is opinionated. We don't index thousands of low-quality variations. We pick a few
            that consistently produce useful output and keep them sharp.
          </p>
          <p>
            No signup, no paywall, no tracking that gets in your way. Find a prompt, copy it, get back to work.
          </p>
          <p>
            Have a prompt you swear by? <Link to="/" className="text-accent">Send it in</Link>.
          </p>
        </div>
      </section>
    </Layout>
  );
}
