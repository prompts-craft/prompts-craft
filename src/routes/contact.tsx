import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { SocialLinks } from "@/components/SocialLinks";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact PromptCraft" },
      {
        name: "description",
        content:
          "Get in touch with the PromptCraft team about prompt suggestions, corrections, partnerships or account questions.",
      },
      { property: "og:title", content: "Contact PromptCraft" },
      { property: "og:description", content: "Reach the PromptCraft team." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/contact` },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/contact` }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-[820px] px-6 py-14">
        <h1 className="text-3xl font-semibold tracking-tight">Contact us</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          PromptCraft is built by Forged Studio, led by CEO Ali Ahmad. We read every message about prompt
          suggestions, corrections, partnerships and account questions.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-card/40 p-6">
          <h2 className="text-lg font-medium">Message us on social</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The fastest way to reach us is a direct message on any of our channels.
          </p>
          <div className="mt-4">
            <SocialLinks />
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-card/40 p-6 text-sm text-muted-foreground">
          <h2 className="text-lg font-medium text-foreground">Report a problem with a prompt</h2>
          <p className="mt-2">
            If a prompt no longer works with a current AI model, tell us which prompt and which model you
            used and we will retest and update it.
          </p>
        </div>
      </div>
    </Layout>
  );
}
