import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — PromptCraft" },
      {
        name: "description",
        content:
          "The rules for using PromptCraft: how you may use our prompts, what we expect from reviewers, and the limits of our liability.",
      },
      { property: "og:title", content: "Terms of Use — PromptCraft" },
      { property: "og:description", content: "The rules for using PromptCraft." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/terms` },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/terms` }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-[820px] px-6 py-14">
        <h1 className="text-3xl font-semibold tracking-tight">Terms of Use</h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-medium text-foreground">Using our prompts</h2>
            <p>
              Prompts published on PromptCraft are free to copy, adapt and use, including in commercial
              projects. You do not need to credit us, though we appreciate it. Please do not republish our
              prompt library wholesale as your own directory.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">Results you generate</h2>
            <p>
              Images, videos and text you create with these prompts are produced by third-party AI tools.
              Whatever those tools' terms say about ownership and permitted use applies to your output, not
              our terms.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">Accounts and reviews</h2>
            <p>
              You are responsible for activity on your account. Reviews must be your own honest experience.
              We remove spam, abusive content and anything that infringes someone else's rights.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">Availability</h2>
            <p>
              We work to keep the site online and the library accurate, but we provide it as-is. Prompts may
              behave differently as AI models change, and we cannot guarantee a specific result.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">Changes</h2>
            <p>
              We may update these terms as the site develops. Continuing to use PromptCraft after a change
              means you accept the updated terms.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
