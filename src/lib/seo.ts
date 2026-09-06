// Shared SEO helpers used by the admin CMS, the importer and the public pages.
// Everything here is deterministic and derived from real content — no filler text.

export const SITE_URL = "https://promptscraft.org";

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "for", "with", "of", "to", "in", "on", "at", "by",
  "from", "into", "your", "you", "this", "that", "it", "is", "are", "be", "as", "using",
  "use", "make", "create", "generate", "prompt", "prompts", "ai",
]);

export function slugify(input: string, max = 80) {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, max)
      .replace(/-+$/g, "") || "prompt"
  );
}

export function clean(text: string | null | undefined) {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

export function truncate(text: string, max: number) {
  const t = clean(text);
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).trim()}…`;
}

/** Sentence-safe first paragraph of a longer text. */
export function firstSentences(text: string, max: number) {
  const t = clean(text);
  if (!t) return "";
  if (t.length <= max) return t;
  const slice = t.slice(0, max);
  const stop = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
  if (stop > max * 0.5) return slice.slice(0, stop + 1).trim();
  return truncate(t, max);
}

export function keywordsFrom(text: string, limit = 8): string[] {
  const counts = new Map<string, number>();
  for (const raw of clean(text).toLowerCase().split(/[^a-z0-9]+/)) {
    if (raw.length < 4 || STOP_WORDS.has(raw)) continue;
    counts.set(raw, (counts.get(raw) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([w]) => w);
}

export type SeoSource = {
  title: string;
  slug?: string | null;
  description?: string | null;
  prompt?: string | null;
  category?: string | null;
  categoryName?: string | null;
  subcategory?: string | null;
  tags?: string[] | null;
  ai_model?: string | null;
  use_cases?: string | null;
  media_type?: string | null;
};

export type GeneratedSeo = {
  seo_title: string;
  meta_description: string;
  focus_keyword: string;
  secondary_keywords: string[];
  seo_keywords: string[];
  slug: string;
  image_alt: string;
  og_title: string;
  og_description: string;
  faq: { question: string; answer: string }[];
};

/**
 * Builds unique, human-readable SEO copy from the prompt's own content.
 * Never keyword-stuffs: each field reuses the real title/description wording.
 */
export function generateSeo(src: SeoSource): GeneratedSeo {
  const title = clean(src.title);
  const kind = src.media_type === "video" ? "AI Video Prompt" : "AI Prompt";
  const categoryName = clean(src.categoryName ?? src.category ?? "");
  const body = clean(src.description) || firstSentences(src.prompt ?? "", 220);

  const seo_title = truncate(`${title} — ${kind} | PromptCraft`, 60);

  const metaBase = body
    ? `${firstSentences(body, 110)}`
    : `A ready-to-use ${kind.toLowerCase()} for ${categoryName.toLowerCase() || "creative work"}.`;
  const meta_description = truncate(
    `${metaBase} Copy it free on PromptCraft and adapt it to your own project.`,
    158,
  );

  const focus_keyword = clean(`${title} prompt`).toLowerCase().slice(0, 60);
  const tagWords = (src.tags ?? []).map((t) => clean(t).toLowerCase()).filter(Boolean);
  const derived = keywordsFrom(`${title} ${body}`, 6);
  const secondary_keywords = [...new Set([
    categoryName ? `${categoryName.toLowerCase()} prompts` : "",
    src.subcategory ? `${clean(src.subcategory).toLowerCase()} prompts` : "",
    src.ai_model ? `${clean(src.ai_model).toLowerCase()} prompt` : "",
    ...tagWords,
    ...derived,
  ].filter(Boolean))].slice(0, 8);

  const seo_keywords = [...new Set([focus_keyword, ...secondary_keywords])].slice(0, 12);

  const image_alt = truncate(
    `Example result generated from the ${title} ${kind.toLowerCase()}`,
    120,
  );

  const og_title = truncate(`${title} — ${kind}`, 70);
  const og_description = truncate(metaBase, 150);

  const faq = buildFaq({ title, kind, categoryName, model: clean(src.ai_model), useCases: clean(src.use_cases) });

  return {
    seo_title,
    meta_description,
    focus_keyword,
    secondary_keywords,
    seo_keywords,
    slug: src.slug ? slugify(src.slug) : slugify(title),
    image_alt,
    og_title,
    og_description,
    faq,
  };
}

function buildFaq(a: { title: string; kind: string; categoryName: string; model: string; useCases: string }) {
  const items: { question: string; answer: string }[] = [
    {
      question: `What does the ${a.title} prompt do?`,
      answer: `It gives you a ready-made ${a.kind.toLowerCase()} for ${
        a.categoryName ? a.categoryName.toLowerCase() : "creative"
      } work. Copy the prompt, paste it into your AI tool of choice and adjust the wording to match your subject.`,
    },
    {
      question: `Which AI model works best with this prompt?`,
      answer: a.model
        ? `${a.model} handles this prompt well, and it also works with other current models — results vary slightly between them.`
        : `It is written to be model-agnostic, so it works with the major current text and image models. Results vary between models, so try a couple and keep the one you prefer.`,
    },
    {
      question: `Is this prompt free to use?`,
      answer: `Yes. Every prompt on PromptCraft is free to copy and adapt, including for commercial projects. Check the usage terms of the AI tool you generate with.`,
    },
  ];
  if (a.useCases) {
    items.push({
      question: `Who is this prompt for?`,
      answer: a.useCases,
    });
  }
  return items;
}

/* ------------------------------------------------------------------ */
/* SEO quality score — an internal content helper, not a Google metric */
/* ------------------------------------------------------------------ */

export type SeoCheck = { label: string; state: "good" | "warn" | "bad"; hint: string };

export type ScoreInput = {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  prompt?: string | null;
  seo_title?: string | null;
  meta_description?: string | null;
  focus_keyword?: string | null;
  image_alt?: string | null;
  image_url?: string | null;
  tags?: string[] | null;
  faq?: unknown[] | null;
};

export function scoreSeo(v: ScoreInput): { score: number; checks: SeoCheck[] } {
  const checks: SeoCheck[] = [];
  const push = (label: string, state: SeoCheck["state"], hint: string) => checks.push({ label, state, hint });

  const st = clean(v.seo_title);
  if (!st) push("SEO title", "bad", "Add an SEO title — it becomes the Google result headline.");
  else if (st.length < 40 || st.length > 65)
    push("SEO title length", "warn", `Currently ${st.length} characters. Aim for 50–60.`);
  else push("SEO title", "good", `${st.length} characters — good length.`);

  const md = clean(v.meta_description);
  if (!md) push("Meta description", "bad", "Add a meta description that summarises the page in one sentence.");
  else if (md.length < 120 || md.length > 165)
    push("Meta description length", "warn", `Currently ${md.length} characters. Aim for 140–160.`);
  else push("Meta description", "good", `${md.length} characters — good length.`);

  const fk = clean(v.focus_keyword).toLowerCase();
  if (!fk) push("Focus keyword", "bad", "Set the main phrase this page should be found for.");
  else {
    const haystack = `${clean(v.title)} ${clean(v.description)} ${st} ${md}`.toLowerCase();
    const words = fk.split(" ").filter((w) => w.length > 3);
    const hit = words.length === 0 || words.some((w) => haystack.includes(w));
    push("Focus keyword used", hit ? "good" : "warn", hit
      ? "The focus keyword appears in the title or description."
      : "The focus keyword does not appear in the title or description.");
  }

  const slug = clean(v.slug);
  if (!slug) push("Slug", "bad", "A slug is required for the page URL.");
  else if (!/^[a-z0-9-]+$/.test(slug) || slug.length > 70)
    push("Slug", "warn", "Use short lowercase words separated by hyphens.");
  else push("Slug", "good", "Clean, readable URL.");

  if (!clean(v.image_alt)) push("Image alt text", v.image_url ? "bad" : "warn", "Describe the image in a natural sentence.");
  else push("Image alt text", "good", "Alt text set.");

  const desc = clean(v.description);
  if (desc.length < 60) push("Short description", "warn", "Write at least a full sentence describing the prompt.");
  else push("Short description", "good", "Description length is fine.");

  const tags = (v.tags ?? []).filter(Boolean);
  push("Tags / internal links", tags.length >= 2 ? "good" : "warn",
    tags.length >= 2 ? "Tags help link related prompts together." : "Add 2+ tags so related prompts link to each other.");

  const faqCount = (v.faq ?? []).length;
  push("FAQ content", faqCount > 0 ? "good" : "warn",
    faqCount > 0 ? `${faqCount} question(s) — eligible for FAQ rich results.` : "Add FAQs to enable FAQ structured data.");

  const weights = { good: 1, warn: 0.5, bad: 0 } as const;
  const score = Math.round((checks.reduce((s, c) => s + weights[c.state], 0) / checks.length) * 100);
  return { score, checks };
}

export function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-400";
  if (score >= 55) return "text-amber-400";
  return "text-red-400";
}
