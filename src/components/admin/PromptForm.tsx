import { useEffect, useState, type FormEvent } from "react";
import { useCategories } from "@/lib/categories-api";
import { slugify } from "@/lib/admin-auth";
import { ImageUploadField } from "./ImageUploadField";

export type PromptFormValues = {
  title: string;
  slug: string;
  category: string;
  description: string;
  prompt: string;
  example: string;
  tags: string;
  image_url: string;
  trending: boolean;
  featured: boolean;
  showcase: boolean;
  media_type: "image" | "video";
};

export const emptyPromptForm: PromptFormValues = {
  title: "",
  slug: "",
  category: "",
  description: "",
  prompt: "",
  example: "",
  tags: "",
  image_url: "",
  trending: false,
  featured: false,
  showcase: false,
  media_type: "image",
};


export function PromptForm({
  initial,
  submitting,
  submitLabel,
  onSubmit,
}: {
  initial: PromptFormValues;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (values: PromptFormValues) => void;
}) {
  const [values, setValues] = useState<PromptFormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(initial.slug.length > 0);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Title" required>
        <input
          required
          value={values.title}
          onChange={(e) => handleTitle(e.target.value)}
          className="input"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Slug" hint="Auto-generated from title. Editable.">
          <input
            required
            value={values.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update("slug", slugify(e.target.value));
            }}
            className="input font-mono text-xs"
          />
        </Field>
        <Field label="Category" required>
          <select
            value={values.category}
            onChange={(e) => update("category", e.target.value)}
            className="input"
          >
            {!values.category && <option value="">Select a category…</option>}
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Short description">
        <input
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          className="input"
        />
      </Field>

      <Field label="Prompt content" required>
        <textarea
          required
          value={values.prompt}
          onChange={(e) => update("prompt", e.target.value)}
          rows={12}
          className="input font-mono text-sm leading-relaxed"
        />
      </Field>

      <Field label="Example output" hint="Optional. Shown on the prompt page.">
        <textarea
          value={values.example}
          onChange={(e) => update("example", e.target.value)}
          rows={4}
          className="input text-sm"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Tags" hint="Comma-separated.">
          <input
            value={values.tags}
            onChange={(e) => update("tags", e.target.value)}
            placeholder="seo, blog, marketing"
            className="input"
          />
        </Field>
        <Field label="Thumbnail image" hint="Paste an image URL or upload a file.">
          <ImageUploadField
            value={values.image_url}
            onChange={(v) => update("image_url", v)}
            folder="prompts"
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-4 pt-2">
        <Toggle
          label="Trending"
          checked={values.trending}
          onChange={(v) => update("trending", v)}
        />
        <Toggle
          label="Featured"
          checked={values.featured}
          onChange={(v) => update("featured", v)}
        />
      </div>

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

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 rounded-full transition ${
          checked ? "bg-accent" : "bg-muted"
        }`}
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
