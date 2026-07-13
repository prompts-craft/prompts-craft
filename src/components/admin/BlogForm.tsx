import { useEffect, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/admin-auth";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUploadField } from "./ImageUploadField";

export type BlogFormValues = {
  title: string;
  slug: string;
  description: string;
  meta_title: string;
  meta_description: string;
  featured_image: string;
  content: string;
  category: string;
  tags: string;
  related_slugs: string[];
  status: "draft" | "published";
};

export const emptyBlogForm: BlogFormValues = {
  title: "",
  slug: "",
  description: "",
  meta_title: "",
  meta_description: "",
  featured_image: "",
  content: "",
  category: "",
  tags: "",
  related_slugs: [],
  status: "draft",
};

export function BlogForm({
  initial,
  submitting,
  submitLabel,
  currentId,
  onSubmit,
}: {
  initial: BlogFormValues;
  submitting: boolean;
  submitLabel: string;
  currentId?: string;
  onSubmit: (values: BlogFormValues) => void;
}) {
  const [values, setValues] = useState<BlogFormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(initial.slug.length > 0);

  useEffect(() => {
    setValues(initial);
    setSlugTouched(initial.slug.length > 0);
  }, [initial]);

  const { data: allBlogs } = useQuery({
    queryKey: ["admin", "blogs", "select-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("id, slug, title, status")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  function update<K extends keyof BlogFormValues>(key: K, v: BlogFormValues[K]) {
    setValues((s) => ({ ...s, [key]: v }));
  }

  function handleTitle(v: string) {
    update("title", v);
    if (!slugTouched) update("slug", slugify(v));
  }

  function toggleRelated(slug: string, checked: boolean) {
    setValues((s) => ({
      ...s,
      related_slugs: checked
        ? Array.from(new Set([...s.related_slugs, slug]))
        : s.related_slugs.filter((x) => x !== slug),
    }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  function submitAs(status: "draft" | "published") {
    onSubmit({ ...values, status });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Blog title" required>
        <input required value={values.title} onChange={(e) => handleTitle(e.target.value)} className="input" />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Slug" hint="Used in the URL: /blog/your-slug">
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
        <Field label="Category" hint="Optional label, e.g. SEO, Marketing">
          <input value={values.category} onChange={(e) => update("category", e.target.value)} className="input" />
        </Field>
      </div>

      <Field label="Short description" hint="Shown on the blog card and detail page.">
        <textarea value={values.description} onChange={(e) => update("description", e.target.value)} rows={2} className="input" />
      </Field>

      <Field label="Featured image" hint="Paste an image URL or upload a file. Used as OG image too.">

        <ImageUploadField
          value={values.featured_image}
          onChange={(v) => update("featured_image", v)}
          folder="blogs"
        />
      </Field>

      <Field label="Blog content" required>
        <RichTextEditor value={values.content} onChange={(v) => update("content", v)} />
      </Field>

      <fieldset className="rounded-lg border border-border bg-card/40 p-4 space-y-4">
        <legend className="px-1 text-xs uppercase tracking-wider text-muted-foreground">SEO</legend>
        <Field label="Meta title" hint="Up to ~60 characters. Falls back to title.">
          <input value={values.meta_title} onChange={(e) => update("meta_title", e.target.value)} className="input" />
        </Field>
        <Field label="Meta description" hint="Up to ~160 characters. Falls back to description.">
          <textarea value={values.meta_description} onChange={(e) => update("meta_description", e.target.value)} rows={2} className="input" />
        </Field>
        <Field label="Tags" hint="Comma-separated.">
          <input value={values.tags} onChange={(e) => update("tags", e.target.value)} placeholder="seo, marketing" className="input" />
        </Field>
      </fieldset>

      <Field label="Related blogs" hint="Shown at the bottom of the blog post.">
        <div className="rounded-md border border-border bg-card/40 max-h-56 overflow-y-auto divide-y divide-border">
          {(allBlogs ?? []).filter((b) => b.id !== currentId).length === 0 && (
            <div className="p-3 text-xs text-muted-foreground">No other blogs yet.</div>
          )}
          {(allBlogs ?? [])
            .filter((b) => b.id !== currentId)
            .map((b) => (
              <label key={b.id} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-muted/30">
                <input
                  type="checkbox"
                  checked={values.related_slugs.includes(b.slug)}
                  onChange={(e) => toggleRelated(b.slug, e.target.checked)}
                />
                <span className="flex-1 truncate">{b.title}</span>
                <span className="text-[10px] uppercase text-muted-foreground">{b.status}</span>
              </label>
            ))}
        </div>
      </Field>

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Status:</span>
          <select
            value={values.status}
            onChange={(e) => update("status", e.target.value as "draft" | "published")}
            className="input py-1 w-auto"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="flex-1" />
        <button
          type="button"
          disabled={submitting}
          onClick={() => submitAs("draft")}
          className="rounded-md border border-border bg-card px-4 py-2 text-sm hover:bg-muted disabled:opacity-60"
        >
          Save as draft
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => submitAs("published")}
          className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
      </div>

      <style>{`
        .input {
          width: 100%;
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
  label, hint, required, children,
}: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
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
