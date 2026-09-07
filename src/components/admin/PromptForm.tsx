import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useCategories } from "@/lib/categories-api";
import { slugify } from "@/lib/admin-auth";
import { ImageUploadField } from "./ImageUploadField";
import { generateSeo, scoreSeo, scoreColor, SITE_URL } from "@/lib/seo";
import type { AdminPromptPayload } from "@/lib/admin-prompts.functions";
import type { Prompt, PromptFaq } from "@/lib/prompts-api";
import { Wand2, AlertTriangle } from "lucide-react";

export type PromptFormValues = {
  title: string;
  slug: string;
  category: string;
  subcategory: string;
  description: string;
  prompt: string;
  example: string;
  tags: string;
  image_url: string;
  trending: boolean;
  featured: boolean;
  showcase: boolean;
  media_type: "image" | "video";
  ai_model: string;
  difficulty: string;
  author: string;
  how_to_use: string;
  customization_tips: string;
  use_cases: string;
  faq: PromptFaq[];
  // SEO
  seo_title: string;
  meta_description: string;
  focus_keyword: string;
  secondary_keywords: string;
  seo_keywords: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string;
  image_alt: string;
  schema_type: string;
  index_status: "index" | "noindex";
  status: "published" | "draft";
};

export const emptyPromptForm: PromptFormValues = {
  title: "",
  slug: "",
  category: "",
  subcategory: "",
  description: "",
  prompt: "",
  example: "",
  tags: "",
  image_url: "",
  trending: false,
  featured: false,
  showcase: false,
  media_type: "image",
  ai_model: "",
  difficulty: "",
  author: "",
  how_to_use: "",
  customization_tips: "",
  use_cases: "",
  faq: [],
  seo_title: "",
  meta_description: "",
  focus_keyword: "",
  secondary_keywords: "",
  seo_keywords: "",
  canonical_url: "",
  og_title: "",
  og_description: "",
  og_image: "",
  image_alt: "",
  schema_type: "CreativeWork",
  index_status: "index",
  status: "published",
};

const list = (s: string) => s.split(",").map((t) => t.trim()).filter(Boolean);
const nn = (s: string) => (s.trim() ? s.trim() : null);

export function promptToForm(data: Prompt): PromptFormValues {
  return {
    title: data.title,
    slug: data.slug,
    category: data.category,
    subcategory: data.subcategory ?? "",
    description: data.description ?? "",
    prompt: data.prompt,
    example: data.example ?? "",
    tags: (data.tags ?? []).join(", "),
    image_url: data.image_url ?? "",
    trending: data.trending,
    featured: data.featured ?? false,
    showcase: data.showcase ?? false,
    media_type: data.media_type === "video" ? "video" : "image",
    ai_model: data.ai_model ?? "",
    difficulty: data.difficulty ?? "",
    author: data.author ?? "",
    how_to_use: data.how_to_use ?? "",
    customization_tips: data.customization_tips ?? "",
    use_cases: data.use_cases ?? "",
    faq: Array.isArray(data.faq) ? data.faq : [],
    seo_title: data.seo_title ?? "",
    meta_description: data.meta_description ?? "",
    focus_keyword: data.focus_keyword ?? "",
    secondary_keywords: (data.secondary_keywords ?? []).join(", "),
    seo_keywords: (data.seo_keywords ?? []).join(", "),
    canonical_url: data.canonical_url ?? "",
    og_title: data.og_title ?? "",
    og_description: data.og_description ?? "",
    og_image: data.og_image ?? "",
    image_alt: data.image_alt ?? "",
    schema_type: data.schema_type ?? "CreativeWork",
    index_status: data.index_status === "noindex" ? "noindex" : "index",
    status: data.status === "draft" ? "draft" : "published",
  };
}

export function formToPayload(v: PromptFormValues): AdminPromptPayload {
  return {
    title: v.title.trim(),
    slug: v.slug.trim(),
    category: v.category,
    description: nn(v.description),
    prompt: v.prompt,
    example: nn(v.example),
    tags: list(v.tags),
    image_url: nn(v.image_url),
    trending: v.trending,
    featured: v.featured,
    showcase: v.showcase,
    media_type: v.media_type,
    subcategory: nn(v.subcategory),
    ai_model: nn(v.ai_model),
    difficulty: nn(v.difficulty),
    author: nn(v.author),
    how_to_use: nn(v.how_to_use),
    customization_tips: nn(v.customization_tips),
    use_cases: nn(v.use_cases),
    faq: v.faq.filter((f) => f.question.trim() && f.answer.trim()),
    seo_title: nn(v.seo_title),
    meta_description: nn(v.meta_description),
    focus_keyword: nn(v.focus_keyword),
    secondary_keywords: list(v.secondary_keywords),
    seo_keywords: list(v.seo_keywords),
    canonical_url: nn(v.canonical_url),
    og_title: nn(v.og_title),
    og_description: nn(v.og_description),
    og_image: nn(v.og_image),
    image_alt: nn(v.image_alt),
    schema_type: v.schema_type || "CreativeWork",
    index_status: v.index_status,
    status: v.status,
  };
}

type Tab = "content" | "details" | "seo";

export function PromptForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
  duplicateWarnings,
}: {
  initial: PromptFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: PromptFormValues) => void;
  duplicateWarnings?: string[];
}) {
  const [values, setValues] = useState<PromptFormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(initial.slug.length > 0);
  const [tab, setTab] = useState<Tab>("content");
  const { data: categories = [] } = useCategories();

  useEffect(() => {
    setValues(initial);
    setSlugTouched(initial.slug.length > 0);
  }, [initial]);

  function update<K extends keyof PromptFormValues>(key: K, value: PromptFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleTitle(v: string) {
    update("title", v);
    if (!slugTouched) update("slug", slugify(v));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  const categoryName = categories.find((c) => c.slug === values.category)?.name ?? values.category;

  const { score, checks } = useMemo(
    () =>
      scoreSeo({
        title: values.title,
        slug: values.slug,
        description: values.description,
        prompt: values.prompt,
        seo_title: values.seo_title,
        meta_description: values.meta_description,
        focus_keyword: values.focus_keyword,
        image_alt: values.image_alt,
        image_url: values.image_url,
        tags: list(values.tags),
        faq: values.faq,
      }),
    [values],
  );

  function runGenerate(overwrite: boolean) {
    const gen = generateSeo({
      title: values.title,
      slug: values.slug,
      description: values.description,
      prompt: values.prompt,
      category: values.category,
      categoryName,
      subcategory: values.subcategory,
      tags: list(values.tags),
      ai_model: values.ai_model,
      use_cases: values.use_cases,
      media_type: values.media_type,
    });
    setValues((v) => ({
      ...v,
      seo_title: overwrite || !v.seo_title ? gen.seo_title : v.seo_title,
      meta_description: overwrite || !v.meta_description ? gen.meta_description : v.meta_description,
      focus_keyword: overwrite || !v.focus_keyword ? gen.focus_keyword : v.focus_keyword,
      secondary_keywords:
        overwrite || !v.secondary_keywords ? gen.secondary_keywords.join(", ") : v.secondary_keywords,
      seo_keywords: overwrite || !v.seo_keywords ? gen.seo_keywords.join(", ") : v.seo_keywords,
      slug: v.slug || gen.slug,
      image_alt: overwrite || !v.image_alt ? gen.image_alt : v.image_alt,
      og_title: overwrite || !v.og_title ? gen.og_title : v.og_title,
      og_description: overwrite || !v.og_description ? gen.og_description : v.og_description,
      faq: overwrite || v.faq.length === 0 ? gen.faq : v.faq,
    }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-2">
        {(["content", "details", "seo"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm rounded-md capitalize transition ${
              tab === t ? "bg-accent/15 text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "seo" ? "SEO" : t}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">
          SEO score{" "}
          <span className={`font-semibold ${scoreColor(score)}`}>{score}/100</span>
        </span>
      </div>

      {duplicateWarnings && duplicateWarnings.length > 0 && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200 space-y-1">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" /> Possible duplicate
          </div>
          {duplicateWarnings.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
      )}

      {tab === "content" && (
        <div className="space-y-5">
          <Field label="Prompt Title" required>
            <input required value={values.title} onChange={(e) => handleTitle(e.target.value)} className="input" />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Slug" hint="Auto-generated from the title. Lowercase, hyphen-separated.">
              <input
                required
                value={values.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update("slug", slugify(e.target.value));
                }}
                className="input font-mono text-xs"
              />
              <Counter value={values.slug} min={3} max={70} />
            </Field>
            <Field label="Category" required>
              <select value={values.category} onChange={(e) => update("category", e.target.value)} className="input">
                {!values.category && <option value="">Select a category…</option>}
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Short Description" hint="One or two sentences. Used on cards and as SEO fallback text.">
            <input value={values.description} onChange={(e) => update("description", e.target.value)} className="input" />
            <Counter value={values.description} min={60} max={200} />
          </Field>

          <Field label="Full Prompt" required>
            <textarea
              required
              value={values.prompt}
              onChange={(e) => update("prompt", e.target.value)}
              rows={12}
              className="input font-mono text-sm leading-relaxed"
            />
          </Field>

          <Field label="Example Output" hint="Optional. Shown on the prompt page.">
            <textarea value={values.example} onChange={(e) => update("example", e.target.value)} rows={4} className="input text-sm" />
          </Field>

          <Field label="How To Use" hint="Step-by-step guidance. Shown as its own section when filled in.">
            <textarea value={values.how_to_use} onChange={(e) => update("how_to_use", e.target.value)} rows={4} className="input text-sm" />
          </Field>

          <Field label="Customization Tips" hint="One tip per line.">
            <textarea
              value={values.customization_tips}
              onChange={(e) => update("customization_tips", e.target.value)}
              rows={4}
              className="input text-sm"
            />
          </Field>

          <Field label="Use Cases" hint="Who this prompt is for and where it helps. One per line.">
            <textarea value={values.use_cases} onChange={(e) => update("use_cases", e.target.value)} rows={3} className="input text-sm" />
          </Field>

          <FaqEditor value={values.faq} onChange={(f) => update("faq", f)} />
        </div>
      )}

      {tab === "details" && (
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Subcategory" hint="Optional narrower grouping, e.g. 'gaming thumbnails'.">
              <input value={values.subcategory} onChange={(e) => update("subcategory", e.target.value)} className="input" />
            </Field>
            <Field label="AI Model / Platform" hint="The model this prompt was written for, e.g. Nano Banana Pro.">
              <input value={values.ai_model} onChange={(e) => update("ai_model", e.target.value)} className="input" />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Difficulty">
              <select value={values.difficulty} onChange={(e) => update("difficulty", e.target.value)} className="input">
                <option value="">Auto</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </Field>
            <Field label="Author" hint="Defaults to the PromptCraft Team when left empty.">
              <input value={values.author} onChange={(e) => update("author", e.target.value)} className="input" />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Tags" hint="Comma-separated. Used for related prompts and internal links.">
              <input value={values.tags} onChange={(e) => update("tags", e.target.value)} placeholder="seo, blog, marketing" className="input" />
            </Field>
            <Field label="Thumbnail / Cover Image" hint="Paste an image URL or upload a file.">
              <ImageUploadField value={values.image_url} onChange={(v) => update("image_url", v)} folder="prompts" />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Type" hint="Video prompts appear on the /video page.">
              <select
                value={values.media_type}
                onChange={(e) => update("media_type", e.target.value as "image" | "video")}
                className="input"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </Field>
            <Field label="Status" hint="Drafts are hidden from the site and the sitemap.">
              <select
                value={values.status}
                onChange={(e) => update("status", e.target.value as "published" | "draft")}
                className="input"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </Field>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Toggle label="Trending" checked={values.trending} onChange={(v) => update("trending", v)} />
            <Toggle label="Featured" checked={values.featured} onChange={(v) => update("featured", v)} />
            <Toggle label="Showcase" checked={values.showcase} onChange={(v) => update("showcase", v)} />
          </div>
        </div>
      )}

      {tab === "seo" && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => runGenerate(false)}
              className="inline-flex items-center gap-2 rounded-md bg-accent/15 px-3 py-2 text-sm hover:bg-accent/25"
            >
              <Wand2 className="w-4 h-4" /> Generate SEO
            </button>
            <button
              type="button"
              onClick={() => runGenerate(true)}
              className="rounded-md border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Regenerate &amp; overwrite
            </button>
            <span className="text-xs text-muted-foreground">
              Fills empty fields from this prompt's own content — edit anything before saving.
            </span>
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-4">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium">SEO score</span>
              <span className={`text-xl font-semibold ${scoreColor(score)}`}>{score}/100</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              An internal content-quality helper — it does not represent Google's ranking algorithm.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs">
              {checks.map((c) => (
                <li key={c.label} className="flex gap-2">
                  <span
                    className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                      c.state === "good" ? "bg-emerald-400" : c.state === "warn" ? "bg-amber-400" : "bg-red-400"
                    }`}
                  />
                  <span>
                    <span className="text-foreground/90">{c.label}</span>{" "}
                    <span className="text-muted-foreground">— {c.hint}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Field label="SEO Title" hint="The headline shown in Google. Aim for 50–60 characters.">
            <input value={values.seo_title} onChange={(e) => update("seo_title", e.target.value)} className="input" />
            <Counter value={values.seo_title} min={50} max={60} />
          </Field>

          <Field label="Meta Description" hint="The snippet under the Google result. Aim for 140–160 characters.">
            <textarea
              value={values.meta_description}
              onChange={(e) => update("meta_description", e.target.value)}
              rows={3}
              className="input text-sm"
            />
            <Counter value={values.meta_description} min={140} max={160} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Focus Keyword" hint="The single phrase this page should be found for.">
              <input value={values.focus_keyword} onChange={(e) => update("focus_keyword", e.target.value)} className="input" />
            </Field>
            <Field label="Secondary Keywords" hint="Comma-separated supporting phrases.">
              <input
                value={values.secondary_keywords}
                onChange={(e) => update("secondary_keywords", e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <Field label="SEO Keywords" hint="Comma-separated. Used for the keywords meta tag and schema.">
            <input value={values.seo_keywords} onChange={(e) => update("seo_keywords", e.target.value)} className="input" />
          </Field>

          <Field label="Canonical URL" hint={`Leave empty to use ${SITE_URL}/prompts/<slug>.`}>
            <input value={values.canonical_url} onChange={(e) => update("canonical_url", e.target.value)} className="input font-mono text-xs" />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Open Graph Title" hint="Headline used when the page is shared on social media.">
              <input value={values.og_title} onChange={(e) => update("og_title", e.target.value)} className="input" />
              <Counter value={values.og_title} min={30} max={70} />
            </Field>
            <Field label="Open Graph Description" hint="Share preview text. Around 150 characters.">
              <input value={values.og_description} onChange={(e) => update("og_description", e.target.value)} className="input" />
              <Counter value={values.og_description} min={80} max={150} />
            </Field>
          </div>

          <Field label="Social Share Image (OG Image)" hint="Ideally 1200×630. Falls back to the thumbnail.">
            <ImageUploadField value={values.og_image} onChange={(v) => update("og_image", v)} folder="prompts" />
          </Field>

          <Field label="Image Alt Text" hint="Describe the image naturally for screen readers and image search.">
            <input value={values.image_alt} onChange={(e) => update("image_alt", e.target.value)} className="input" />
            <Counter value={values.image_alt} min={20} max={125} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Schema Type" hint="Structured data type used for this page.">
              <select value={values.schema_type} onChange={(e) => update("schema_type", e.target.value)} className="input">
                <option value="CreativeWork">CreativeWork</option>
                <option value="Article">Article</option>
                <option value="HowTo">HowTo</option>
                <option value="Product">Product</option>
              </select>
            </Field>
            <Field label="Search Engine Indexing" hint="Noindex keeps the page live but out of Google.">
              <select
                value={values.index_status}
                onChange={(e) => update("index_status", e.target.value as "index" | "noindex")}
                className="input"
              >
                <option value="index">Index</option>
                <option value="noindex">Noindex</option>
              </select>
            </Field>
          </div>
        </div>
      )}

      <div className="pt-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>

      <style>{`
        .input {
          width: 100%;
          background: hsl(var(--background) / 0);
          background-color: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: var(--foreground);
          outline: none;
        }
        .input:focus { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
      `}</style>
    </form>
  );
}

function Counter({ value, min, max }: { value: string; min: number; max: number }) {
  const len = value.trim().length;
  const state = len === 0 ? "muted" : len < min || len > max ? "warn" : "good";
  return (
    <div
      className={`mt-1 text-[11px] ${
        state === "good" ? "text-emerald-400" : state === "warn" ? "text-amber-400" : "text-muted-foreground"
      }`}
    >
      {len} characters · recommended {min}–{max}
    </div>
  );
}

function FaqEditor({ value, onChange }: { value: PromptFaq[]; onChange: (v: PromptFaq[]) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">FAQ</span>
        <button
          type="button"
          onClick={() => onChange([...value, { question: "", answer: "" }])}
          className="text-xs rounded-md border border-border px-2 py-1 hover:bg-muted/40"
        >
          Add question
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1">
        Shown on the page and used for FAQ structured data. Only added when questions exist.
      </p>
      <div className="mt-3 space-y-3">
        {value.map((f, i) => (
          <div key={i} className="rounded-lg border border-border/60 p-3 space-y-2">
            <input
              value={f.question}
              placeholder="Question"
              onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)))}
              className="input"
            />
            <textarea
              value={f.answer}
              placeholder="Answer"
              rows={3}
              onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)))}
              className="input text-sm"
            />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="text-xs text-destructive hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 rounded-full transition ${checked ? "bg-accent" : "bg-muted"}`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-background shadow translate-y-0.5 transition ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
      <span className="text-sm">{label}</span>
    </label>
  );
}
