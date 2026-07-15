import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import {
  Calendar,
  User,
  Clock,
  ChevronRight,
  Share2,
  BookOpen,
  HelpCircle,
  Eye,
  Tag,
  List,
  Sparkles,
  Lightbulb,
  AlertCircle,
  Check,
  Copy,
  Link as LinkIcon,
  Twitter,
  Linkedin,
  Facebook,
  ShieldCheck,
  RefreshCw,
  Award,
  Info,
  Bot,
  Mail,
  MessageSquare,
  FileText,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { RouteError } from "@/components/RouteError";
import { BlogReviews } from "@/components/BlogReviews";
import { fetchBlogBySlug, fetchBlogsBySlugs, fetchPublishedBlogs, type Blog } from "@/lib/blogs-api";
import { InternalLink, ExternalReference } from "@/components/SeoLinks";
import { SocialLinks } from "@/components/SocialLinks";

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function readingTime(html: string): number {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&[a-z]+;/g, " ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

/**
 * Enhance sanitized HTML:
 *  - add stable IDs to <h2> so the TOC anchors work
 *  - extract ordered list of {id, text} for TOC + Key Takeaways
 */
function enrichHtml(html: string): { html: string; sections: { id: string; text: string }[] } {
  const sections: { id: string; text: string }[] = [];
  const seen = new Set<string>();
  const out = html.replace(
    /<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi,
    (_match, attrs: string | undefined, inner: string) => {
      const text = stripHtml(inner);
      let id = slugify(text) || `section-${sections.length + 1}`;
      let i = 2;
      while (seen.has(id)) id = `${slugify(text)}-${i++}`;
      seen.add(id);
      sections.push({ id, text });
      const hasId = /\bid\s*=/i.test(attrs ?? "");
      const attrsOut = hasId ? attrs ?? "" : `${attrs ?? ""} id="${id}"`;
      return `<h2${attrsOut} data-toc="1">${inner}</h2>`;
    },
  );
  return { html: out, sections };
}

function buildFaqs(post: Blog): { q: string; a: string }[] {
  const topic = post.category ?? "this topic";
  return [
    {
      q: `What is "${post.title}" about?`,
      a:
        post.description ??
        `This guide walks you through ${post.title.toLowerCase()} with practical, copy-ready steps you can apply today.`,
    },
    {
      q: `Who is this blog for?`,
      a: `Anyone interested in ${topic} — from beginners exploring AI prompts to power users looking to refine their workflow.`,
    },
    {
      q: `Can I use these prompts with ChatGPT, Claude, or Gemini?`,
      a: `Yes. The ideas and prompts covered here work across leading AI models including ChatGPT (GPT-4o), Claude, Gemini, and most modern LLMs. Small wording tweaks may improve results on specific models.`,
    },
    {
      q: `Is this content free to use?`,
      a: `Absolutely. Everything on PromptCraft is free to read, copy, and adapt for personal or commercial projects.`,
    },
    {
      q: `How often is this guide updated?`,
      a: `We revisit popular guides regularly and update them as AI models evolve. Last updated: ${new Date(
        post.updated_at,
      ).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.`,
    },
  ];
}

const SITE = "https://prompts-craft.lovable.app";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await fetchBlogBySlug(params.slug);
    if (!post) throw notFound();
    const [explicitRelated, all] = await Promise.all([
      post.related_slugs.length > 0 ? fetchBlogsBySlugs(post.related_slugs) : Promise.resolve([]),
      fetchPublishedBlogs(),
    ]);
    const sorted = all;
    const idx = sorted.findIndex((b) => b.slug === post.slug);
    const prev = idx >= 0 ? sorted[idx + 1] ?? null : null;
    const next = idx > 0 ? sorted[idx - 1] ?? null : null;

    // Related: prefer explicit, then pad with recent posts (excluding current), up to 4.
    const seen = new Set<string>([post.slug]);
    const related: Blog[] = [];
    for (const r of explicitRelated) {
      if (seen.has(r.slug)) continue;
      seen.add(r.slug);
      related.push(r);
      if (related.length === 4) break;
    }
    if (related.length < 4) {
      for (const r of sorted) {
        if (seen.has(r.slug)) continue;
        seen.add(r.slug);
        related.push(r);
        if (related.length === 4) break;
      }
    }
    return { post, related, prev, next, articleCount: sorted.length };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.post;
    const title = p ? p.meta_title || `${p.title} | PromptCraft Blog` : "Blog";
    const desc = p
      ? p.meta_description ||
        p.description ||
        (p.content ? stripHtml(p.content).slice(0, 155) : "")
      : "";
    const url = `${SITE}/blog/${params.slug}`;
    const img = p?.featured_image ?? undefined;
    const imgAlt = p ? `${p.title} — PromptCraft blog cover` : undefined;
    const breadcrumbItems = p
      ? [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
          ...(p.category
            ? [
                {
                  "@type": "ListItem",
                  position: 3,
                  name: p.category,
                  item: `${SITE}/blog?category=${encodeURIComponent(p.category)}`,
                },
                { "@type": "ListItem", position: 4, name: p.title, item: url },
              ]
            : [{ "@type": "ListItem", position: 3, name: p.title, item: url }]),
        ]
      : [];
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
        { name: "googlebot", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { name: "author", content: "PromptCraft Team" },
        ...(p?.tags?.length ? [{ name: "keywords", content: p.tags.join(", ") }] : []),
        { property: "og:site_name", content: "PromptCraft" },
        { property: "og:title", content: p?.meta_title || p?.title || "" },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:locale", content: "en_US" },
        ...(img
          ? [
              { property: "og:image", content: img },
              { property: "og:image:alt", content: imgAlt ?? "" },
              { property: "og:image:width", content: "1200" },
              { property: "og:image:height", content: "630" },
            ]
          : []),
        { property: "article:published_time", content: p?.published_at ?? p?.created_at ?? "" },
        { property: "article:modified_time", content: p?.updated_at ?? "" },
        { property: "article:author", content: "PromptCraft Team" },
        ...(p?.category ? [{ property: "article:section", content: p.category }] : []),
        ...((p?.tags ?? []).map((t) => ({ property: "article:tag", content: t }))),
        { name: "twitter:card", content: img ? "summary_large_image" : "summary" },
        { name: "twitter:title", content: p?.title ?? "" },
        { name: "twitter:description", content: desc },
        ...(img
          ? [
              { name: "twitter:image", content: img },
              { name: "twitter:image:alt", content: imgAlt ?? "" },
            ]
          : []),
      ],
      links: [
        { rel: "canonical", href: url },
        ...(img
          ? [
              {
                rel: "preload",
                as: "image" as const,
                href: img,
                fetchpriority: "high",
              } as unknown as { rel: string; href: string },
            ]
          : []),
      ],
      scripts: p
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BlogPosting",
                headline: p.title,
                description: desc,
                image: img
                  ? [{ "@type": "ImageObject", url: img, width: 1200, height: 630 }]
                  : undefined,
                datePublished: p.published_at ?? p.created_at,
                dateModified: p.updated_at,
                mainEntityOfPage: { "@type": "WebPage", "@id": url },
                url,
                inLanguage: "en-US",
                articleSection: p.category ?? undefined,
                keywords: p.tags.join(", "),
                wordCount: stripHtml(p.content).split(/\s+/).filter(Boolean).length,
                author: {
                  "@type": "Organization",
                  name: "PromptCraft Team",
                  url: SITE,
                },
                publisher: {
                  "@type": "Organization",
                  name: "PromptCraft",
                  url: SITE,
                  logo: {
                    "@type": "ImageObject",
                    url: `${SITE}/favicon.svg`,
                  },
                },
              }),
            },
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: breadcrumbItems,
              }),
            },
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: buildFaqs(p).map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
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

/** Deterministic pseudo-view-count so the placeholder feels realistic and stable per post. */
function placeholderViews(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 1200 + (h % 9800);
}

function BlogPostPage() {
  const { post, related, prev, next, articleCount } = Route.useLoaderData();

  const { html: enrichedHtml, sections } = useMemo(() => {
    const clean = DOMPurify.sanitize(post.content, {
      ADD_TAGS: ["iframe"],
      ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target", "rel", "id"],
    });
    return enrichHtml(clean);
  }, [post.content]);

  const minutes = useMemo(() => readingTime(post.content), [post.content]);
  const faqs = useMemo(() => buildFaqs(post), [post]);
  const views = useMemo(() => placeholderViews(post.id), [post.id]);
  const published = formatDate(post.published_at ?? post.created_at);
  const updated = new Date(post.updated_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const isRecentlyUpdated =
    Date.now() - new Date(post.updated_at).getTime() < 1000 * 60 * 60 * 24 * 90;
  const shareUrl = `${SITE}/blog/${post.slug}`;
  const shareText = encodeURIComponent(post.title);

  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const [tocOpen, setTocOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [comment, setComment] = useState("");
  const articleRef = useRef<HTMLDivElement | null>(null);

  // Scroll-spy for TOC
  useEffect(() => {
    if (sections.length === 0) return;
    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (targets.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -60% 0px", threshold: [0, 1] },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [sections]);

  // Enhance <pre> code blocks with a Copy button
  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;
    const pres = Array.from(root.querySelectorAll("pre"));
    const cleanups: Array<() => void> = [];

    pres.forEach((pre) => {
      if (pre.dataset.enhanced === "1") return;
      pre.dataset.enhanced = "1";
      pre.classList.add(
        "not-prose",
        "relative",
        "group",
        "rounded-xl",
        "border",
        "border-border",
        "bg-[#0b0d12]",
        "text-[13px]",
        "leading-relaxed",
        "overflow-hidden",
        "my-8",
      );

      const bar = document.createElement("div");
      bar.className =
        "flex items-center justify-between px-4 py-2 border-b border-border/70 bg-black/30 text-[11px] uppercase tracking-wider text-muted-foreground";
      const label = document.createElement("span");
      label.className = "inline-flex items-center gap-1.5";
      label.innerHTML =
        '<span class="w-2 h-2 rounded-full bg-red-500/70"></span>' +
        '<span class="w-2 h-2 rounded-full bg-yellow-500/70"></span>' +
        '<span class="w-2 h-2 rounded-full bg-green-500/70"></span>' +
        '<span class="ml-2">Prompt</span>';
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "inline-flex items-center gap-1.5 rounded-md border border-border/70 px-2 py-1 text-[11px] text-muted-foreground hover:text-accent hover:border-accent/60 transition";
      btn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16V4a2 2 0 0 1 2-2h12"/></svg><span>Copy Prompt</span>';
      const onClick = async () => {
        const code = pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
        try {
          await navigator.clipboard.writeText(code);
          toast.success("Prompt copied to clipboard");
          btn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><span>Copied</span>';
          btn.classList.add("text-accent", "border-accent/60");
          setTimeout(() => {
            btn.innerHTML =
              '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16V4a2 2 0 0 1 2-2h12"/></svg><span>Copy Prompt</span>';
            btn.classList.remove("text-accent", "border-accent/60");
          }, 1800);
        } catch {
          toast.error("Copy failed");
        }
      };
      btn.addEventListener("click", onClick);
      bar.appendChild(label);
      bar.appendChild(btn);
      pre.prepend(bar);

      // pad the code area so the bar doesn't overlap
      const codeEl = pre.querySelector("code");
      if (codeEl) codeEl.classList.add("block", "px-4", "py-4", "text-slate-100");
      cleanups.push(() => btn.removeEventListener("click", onClick));
    });

    return () => cleanups.forEach((c) => c());
  }, [enrichedHtml]);

  function handleAnchorClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: y, behavior: "smooth" });
    history.replaceState(null, "", `#${id}`);
    setTocOpen(false);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Copy failed");
    }
  }

  const takeaways = sections.slice(0, Math.min(5, sections.length));

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-10 sm:pt-14 pb-24">
        <nav
          aria-label="Breadcrumb"
          className="text-sm text-muted-foreground mb-6 max-w-3xl"
        >
          <ol className="flex flex-wrap items-center gap-x-1.5" itemScope itemType="https://schema.org/BreadcrumbList">
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link to="/" className="hover:text-foreground" itemProp="item">
                <span itemProp="name">Home</span>
              </Link>
              <meta itemProp="position" content="1" />
            </li>
            <span aria-hidden>/</span>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <Link to="/blog" className="hover:text-foreground" itemProp="item">
                <span itemProp="name">Blog</span>
              </Link>
              <meta itemProp="position" content="2" />
            </li>
            {post.category && (
              <>
                <span aria-hidden>/</span>
                <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                  <Link to="/blog" className="hover:text-foreground" itemProp="item">
                    <span itemProp="name">{post.category}</span>
                  </Link>
                  <meta itemProp="position" content="3" />
                </li>
              </>
            )}
            <span aria-hidden>/</span>
            <li
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              className="text-foreground line-clamp-1 inline align-bottom min-w-0"
            >
              <span itemProp="name">{post.title}</span>
              <meta itemProp="position" content={post.category ? "4" : "3"} />
            </li>
          </ol>
        </nav>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-12">
          <article className="min-w-0 max-w-3xl mx-auto lg:mx-0 w-full">
            {/* Header */}
            <header>
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight">
                {post.title}
              </h1>
              {post.description && (
                <p className="text-lg text-muted-foreground mt-5 leading-relaxed">
                  {post.description}
                </p>
              )}

              {/* Meta strip */}
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  {minutes} min read
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-accent" />
                  Updated <span className="text-foreground/90">{updated}</span>
                </span>
                {post.category && (
                  <Link
                    to="/blog"
                    className="inline-flex items-center gap-1.5 hover:text-foreground"
                  >
                    <Tag className="w-3.5 h-3.5 text-accent" />
                    <span className="text-foreground/90">{post.category}</span>
                  </Link>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-accent" />
                  <span className="text-foreground/90">PromptCraft Team</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-accent" />
                  {views.toLocaleString()} views
                </span>
              </div>
            </header>

            {post.featured_image ? (
              <img
                src={post.featured_image}
                alt={post.description ? `${post.title} — ${post.description.slice(0, 120)}` : `${post.title} — PromptCraft blog cover`}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                width={1200}
                height={630}
                className="mt-10 w-full max-h-[28rem] object-cover rounded-2xl border border-border"
              />
            ) : (
              <div
                className="mt-10 h-56 sm:h-72 rounded-2xl bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-pink-500/30"
                role="presentation"
                aria-hidden="true"
              />
            )}

            {/* Mobile TOC accordion */}
            {sections.length > 0 && (
              <details
                className="lg:hidden mt-10 rounded-2xl border border-border bg-card/60 backdrop-blur p-4 group"
                open={tocOpen}
                onToggle={(e) => setTocOpen((e.target as HTMLDetailsElement).open)}
              >
                <summary className="cursor-pointer list-none flex items-center justify-between font-medium">
                  <span className="inline-flex items-center gap-2 text-sm">
                    <List className="w-4 h-4 text-accent" />
                    Table of contents
                  </span>
                  <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90 opacity-60" />
                </summary>
                <ol className="mt-3 space-y-2 text-sm">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        onClick={(e) => handleAnchorClick(e, s.id)}
                        className={`block leading-snug transition-colors ${
                          activeId === s.id
                            ? "text-accent"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="mr-2 tabular-nums text-xs opacity-60">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {s.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            )}

            {/* Key Takeaways */}
            {takeaways.length > 0 && (
              <section className="mt-10 rounded-2xl border border-accent/30 bg-accent-soft/40 p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                  <Sparkles className="w-4 h-4" />
                  Key Takeaways
                </div>
                <ul className="mt-4 space-y-2.5 text-[15px] text-foreground/90 leading-relaxed">
                  {takeaways.map((t) => (
                    <li key={t.id} className="flex gap-2.5">
                      <Check className="w-4 h-4 mt-1 shrink-0 text-accent" />
                      <span>{t.text}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Pro Tip callout */}
            <Callout kind="tip" className="mt-8">
              Save the prompts on this page. The best results come from
              iterating — tweak wording, add your context, and re-run.
            </Callout>

            {/* Article body */}
            <div
              ref={articleRef}
              className="prose prose-lg prose-invert dark:prose-invert max-w-none mt-10
                prose-headings:tracking-tight prose-headings:scroll-mt-24
                prose-h2:mt-14 prose-h2:mb-5 prose-h2:text-3xl
                prose-h3:mt-10 prose-h3:mb-4
                prose-p:leading-[1.85] prose-p:my-6
                prose-li:leading-[1.8] prose-li:my-2
                prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-img:border prose-img:border-border prose-img:my-10
                prose-blockquote:border-accent prose-blockquote:text-muted-foreground prose-blockquote:my-8
                prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-table:text-sm prose-th:bg-muted/40"
              dangerouslySetInnerHTML={{ __html: enrichedHtml }}
            />

            {/* Important Note callout */}
            <Callout kind="note" className="mt-10">
              AI models change often. If a prompt doesn't behave as expected,
              re-check the model version and any custom instructions in your
              account before troubleshooting the prompt itself.
            </Callout>

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

            {/* Explore more on PromptCraft (internal linking) */}
            <section className="mt-12" aria-labelledby="explore-more-heading">
              <h2
                id="explore-more-heading"
                className="text-sm uppercase tracking-wider text-muted-foreground mb-3"
              >
                Explore more on PromptCraft
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <InternalLink
                  to="/blog"
                  title="Browse all AI prompt guides"
                  description="Fresh tutorials on ChatGPT, Claude, Gemini and more."
                />
                <InternalLink
                  to="/categories/$slug"
                  params={{ slug: "teachers" }}
                  title="Ready-to-use prompt library"
                  description="Copy-and-paste prompts organized by role and use case."
                />
              </div>
            </section>

            {/* Further reading (external references) */}
            <section className="mt-8" aria-labelledby="further-reading-heading">
              <h2
                id="further-reading-heading"
                className="text-sm uppercase tracking-wider text-muted-foreground mb-3"
              >
                Further reading
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <ExternalReference
                  href="https://platform.openai.com/docs/guides/prompt-engineering"
                  title="OpenAI — Prompt engineering guide"
                  description="Official patterns and best practices from OpenAI."
                />
                <ExternalReference
                  href="https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview"
                  title="Anthropic — Prompt engineering with Claude"
                  description="Official Claude prompting techniques and examples."
                />
              </div>
            </section>

            {/* Share */}
            <section className="mt-12 rounded-2xl border border-border bg-card/60 backdrop-blur p-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Share2 className="w-4 h-4 text-accent" />
                <span>Found this helpful? Share it.</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <ShareLink
                  href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(
                    shareUrl,
                  )}`}
                  icon={<Twitter className="w-3.5 h-3.5" />}
                  label="X"
                />
                <ShareLink
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    shareUrl,
                  )}`}
                  icon={<Linkedin className="w-3.5 h-3.5" />}
                  label="LinkedIn"
                />
                <ShareLink
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    shareUrl,
                  )}`}
                  icon={<Facebook className="w-3.5 h-3.5" />}
                  label="Facebook"
                />
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border hover:border-accent/60 hover:text-accent transition"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <LinkIcon className="w-3.5 h-3.5" />
                  )}
                  {copied ? "Copied" : "Copy link"}
                </button>
              </div>
            </section>

            {/* Author card */}
            <section className="mt-8 rounded-2xl border border-border bg-card/60 backdrop-blur p-6 flex items-start gap-4">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-soft text-accent font-semibold shrink-0">
                <User className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground/90">
                  Written by the PromptCraft Team
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  We're a small team of AI enthusiasts, writers, and prompt engineers who publish
                  practical, tested guides on using AI for real work — no hype, no fluff.
                </p>
                <div className="flex items-center gap-x-5 gap-y-1 flex-wrap mt-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    Last updated: <span className="text-foreground/90">{updated}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-accent" />
                    {minutes} min read
                  </span>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section className="mt-14">
              <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-accent" /> Frequently Asked Questions
              </h2>
              <div className="mt-5 divide-y divide-border/60 rounded-2xl border border-border bg-card/60 backdrop-blur">
                {faqs.map((f, i) => (
                  <details key={i} className="group p-5">
                    <summary className="cursor-pointer font-medium text-foreground/90 list-none flex items-center justify-between">
                      <span>{f.q}</span>
                      <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90 opacity-60" />
                    </summary>
                    <p className="mt-3 text-[15px] text-muted-foreground leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <BlogReviews blogId={post.id} />

            {(prev || next) && (
              <nav
                aria-label="Post navigation"
                className="mt-16 grid sm:grid-cols-2 gap-3 border-t border-border pt-8"
              >
                {prev ? (
                  <Link
                    to="/blog/$slug"
                    params={{ slug: prev.slug }}
                    className="rounded-xl border border-border bg-card p-4 hover:border-accent/60 transition"
                  >
                    <div className="text-xs text-muted-foreground">← Previous Article</div>
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
                    <div className="text-xs text-muted-foreground">Next Article →</div>
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
                  Related articles
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {related.map((r: Blog) => (
                    <Link
                      key={r.id}
                      to="/blog/$slug"
                      params={{ slug: r.slug }}
                      className="group rounded-xl border border-border bg-card overflow-hidden hover:border-accent/60 transition"
                    >
                      <div className="h-28 bg-muted overflow-hidden">
                        {r.featured_image ? (
                          <img
                            src={r.featured_image}
                            alt={`${r.title} — related PromptCraft article cover`}
                            loading="lazy"
                            decoding="async"
                            width={480}
                            height={200}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition"
                          />
                        ) : (
                          <div
                            className="w-full h-full bg-gradient-to-br from-indigo-500/20 via-purple-500/15 to-pink-500/20"
                            role="presentation"
                            aria-hidden="true"
                          />
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

          {/* Sticky desktop TOC */}
          {sections.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <div className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <List className="w-3.5 h-3.5 text-accent" />
                  On this page
                </div>
                <ol className="mt-4 space-y-2 border-l border-border">
                  {sections.map((s) => {
                    const active = activeId === s.id;
                    return (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          onClick={(e) => handleAnchorClick(e, s.id)}
                          className={`block -ml-px pl-4 py-1 text-sm leading-snug border-l transition-colors ${
                            active
                              ? "border-accent text-accent"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {s.text}
                        </a>
                      </li>
                    );
                  })}
                </ol>
                <div className="mt-6 text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  {minutes} min read · {views.toLocaleString()} views
                </div>
              </div>
            </aside>
          )}
        </div>

        <p className="mt-10 text-center max-w-3xl mx-auto">
          <Link to="/blog" className="text-sm text-accent hover:underline">
            ← Back to all articles
          </Link>
        </p>
      </div>
    </Layout>
  );
}

function ShareLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border hover:border-accent/60 hover:text-accent transition"
    >
      {icon}
      {label}
    </a>
  );
}

function Callout({
  kind,
  className = "",
  children,
}: {
  kind: "tip" | "note";
  className?: string;
  children: React.ReactNode;
}) {
  const isTip = kind === "tip";
  const Icon = isTip ? Lightbulb : AlertCircle;
  const label = isTip ? "Pro Tip" : "Important Note";
  const tone = isTip
    ? "border-accent/40 bg-accent-soft/40 text-accent"
    : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
  return (
    <aside
      className={`rounded-2xl border p-5 flex gap-3 ${tone} ${className}`}
      role="note"
    >
      <Icon className="w-5 h-5 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wider font-semibold">{label}</div>
        <p className="mt-1.5 text-[15px] leading-relaxed text-foreground/90">{children}</p>
      </div>
    </aside>
  );
}
