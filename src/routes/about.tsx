import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { SocialLinks } from "@/components/SocialLinks";
import ceoPhoto from "@/assets/ali-ahmad-ceo.jpg.asset.json";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Us — The Story Behind Prompt Craft" },
      {
        name: "description",
        content:
          "Prompt Craft is an innovation-driven AI platform founded by Ali Ahmad (CEO) with Muhammad Zeeshan (COO), building masterfully engineered prompts and workflows.",
      },
      { property: "og:title", content: "About Us — The Story Behind Prompt Craft" },
      {
        property: "og:description",
        content:
          "The story, mission and leadership behind Prompt Craft — engineered AI prompts and workflows for creators, professionals and businesses.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/about" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "About Us — The Story Behind Prompt Craft" },
      {
        name: "twitter:description",
        content:
          "The story, mission and leadership behind Prompt Craft — engineered AI prompts and workflows.",
      },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

function AboutPage() {
  return (
    <Layout>
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-24">
        <div className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
              About Us: The Story Behind Prompt Craft
            </h1>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Welcome to Prompt Craft, where the future of productivity and artificial intelligence converges.
            </p>
          </div>

          <figure className="shrink-0 self-start">
            <div className="relative group">
              <div
                aria-hidden
                className="absolute -inset-1 rounded-2xl bg-gradient-accent opacity-40 blur-lg transition-opacity duration-500 group-hover:opacity-80"
              />
              <img
                src={ceoPhoto.url}
                alt="Ali Ahmad, Founder and CEO of Prompt Craft"
                loading="lazy"
                className="relative w-36 h-44 sm:w-44 sm:h-56 object-cover rounded-2xl ring-1 ring-border"
              />
            </div>
            <figcaption className="mt-3 text-center">
              <div className="text-sm font-medium">Ali Ahmad</div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Founder &amp; CEO
              </div>
            </figcaption>
          </figure>
        </div>

        <div className="mt-10 text-muted-foreground space-y-5 leading-relaxed">
          <p>
            We are a dynamic, innovation-driven platform dedicated to unlocking the full potential of AI through
            masterfully engineered prompts, cutting-edge workflows, and practical digital solutions. In a world
            moving at breakneck speed, our mission is simple: to bridge the gap between complex AI technology and
            everyday efficiency for creators, professionals, and businesses alike.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight text-foreground pt-4">Our Journey</h2>
          <p>
            Prompt Craft was born from a singular, forward-thinking vision. The core concept and initial framework
            of the company were conceived by Ali Ahmad. Recognizing the growing need for structured, high-impact
            prompt engineering in an AI-driven landscape, Ali laid the groundwork to build a centralized hub for
            digital productivity.
          </p>
          <p>
            Shortly after the inception of the idea, Muhammad Zeeshan came on board as Chief Operating Officer
            (COO). Bringing strategic execution and operational excellence to the table, Zeeshan helped transform a
            visionary concept into a fully realized, scalable platform. Together, our leadership team combines
            creative foresight with operational rigor, steering Prompt Craft toward continuous growth and
            innovation.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight text-foreground pt-4">Leadership Team</h2>
          <p>
            <span className="text-foreground font-medium">Ali Ahmad (CEO)</span> — The visionary behind Prompt
            Craft, driving the core creative direction, product roadmap, and overall mission to revolutionize how
            people interact with AI.
          </p>
          <p>
            <span className="text-foreground font-medium">Muhammad Zeeshan (COO)</span> — Overseeing daily
            operations, strategic execution, and the structural growth that keeps Prompt Craft running seamlessly
            and scaling effectively.
          </p>

          <h2 className="text-2xl font-semibold tracking-tight text-foreground pt-4">What We Do</h2>
          <p>
            At Prompt Craft, we specialize in curating, developing, and optimizing high-performance AI prompts and
            resources. Whether you are looking to supercharge your workflow, optimize your digital presence, or
            explore the boundaries of what artificial intelligence can achieve, our platform is designed to give you
            the competitive edge.
          </p>
          <p>
            Thank you for being part of our journey. We are just getting started, and we invite you to explore,
            create, and grow with us.
          </p>
        </div>

        <div className="mt-14">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">Follow us</div>
          <SocialLinks size="lg" />
        </div>
      </section>
    </Layout>
  );
}
