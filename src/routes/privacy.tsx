import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — PromptCraft" },
      {
        name: "description",
        content:
          "How PromptCraft handles account data, reviews, analytics and cookies, and the choices you have over your information.",
      },
      { property: "og:title", content: "Privacy Policy — PromptCraft" },
      { property: "og:description", content: "How PromptCraft handles your data." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/privacy` },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/privacy` }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-[820px] px-6 py-14">
        <h1 className="text-3xl font-semibold tracking-tight">Privacy Policy</h1>
        <div className="prose prose-invert mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-medium text-foreground">What we collect</h2>
            <p>
              You can browse and copy every prompt on PromptCraft without an account. If you create an
              account, we store the email address you sign up with so we can sign you in and attach the
              reviews you write to your account.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">Reviews and comments</h2>
            <p>
              Reviews you publish are visible to everyone. We do not display your email address alongside
              a review. You can edit or delete your own review at any time from the prompt page.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">Usage data</h2>
            <p>
              We count how often each prompt is copied so we can show what is popular. This counter is not
              linked to your identity.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">Cookies</h2>
            <p>
              We use cookies and local browser storage to keep you signed in and to remember your theme
              preference. Clearing your browser storage removes them.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">Third parties</h2>
            <p>
              Account sign-in and data storage are handled by our hosting and database provider. Links to
              ChatGPT, Gemini and other AI tools take you to services with their own privacy policies.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-medium text-foreground">Your choices</h2>
            <p>
              You can ask us to delete your account and the reviews attached to it. Reach us through the
              contact page and we will confirm once it is done.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
