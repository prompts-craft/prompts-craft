import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminCategoriesPage,
});

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  emoji: string;
  sort_order: number;
  media_type: string;
};

function AdminCategoriesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, slug, name, description, emoji, sort_order, media_type")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CategoryRow[];
    },
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [emoji, setEmoji] = useState("✨");
  const [description, setDescription] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [saving, setSaving] = useState(false);

  function reset() {
    setName(""); setSlug(""); setSlugTouched(false);
    setEmoji("✨"); setDescription(""); setMediaType("image");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const nextOrder = (data?.length ?? 0) + 1;
      const { error } = await supabase.from("categories").insert({
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        emoji: emoji.trim() || "✨",
        description: description.trim(),
        sort_order: nextOrder,
        media_type: mediaType,
      });
      if (error) throw error;
      toast.success("Category added");
      reset();
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["categories", "public"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add category");
    } finally {
      setSaving(false);
    }
  }

  async function setPage(id: string, media_type: string) {
    const { error } = await supabase.from("categories").update({ media_type }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Moved to ${media_type} page`);
    qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    qc.invalidateQueries({ queryKey: ["categories", "public"] });
  }


  async function remove(id: string) {
    if (!confirm("Delete this category?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Category deleted");
    qc.invalidateQueries({ queryKey: ["admin", "categories"] });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the categories prompts can be assigned to.
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> Add category
        </button>
      </div>

      {open && (
        <form
          onSubmit={submit}
          className="rounded-lg border border-border bg-card/40 p-5 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs text-muted-foreground">
              Name *
              <input
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
            <label className="block text-xs text-muted-foreground">
              Slug *
              <input
                required
                value={slug}
                onChange={(e) => { setSlugTouched(true); setSlug(slugify(e.target.value)); }}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono text-foreground"
              />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
            <label className="block text-xs text-muted-foreground">
              Emoji
              <input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={4}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground text-center"
              />
            </label>
            <label className="block text-xs text-muted-foreground">
              Description
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
              />
            </label>
          </div>
          <label className="block text-xs text-muted-foreground max-w-xs">
            Show on page
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as "image" | "video")}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="image">Image prompts (home page)</option>
              <option value="video">Video prompts (/video)</option>
            </select>
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save category"}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); reset(); }}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg border border-border bg-card/40 divide-y divide-border">
        {isLoading && <div className="p-4 text-sm text-muted-foreground">Loading…</div>}
        {!isLoading && (data?.length ?? 0) === 0 && (
          <div className="p-4 text-sm text-muted-foreground">No categories yet.</div>
        )}
        {data?.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xl">{c.emoji}</span>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground truncate font-mono">{c.slug}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <select
                value={c.media_type}
                onChange={(e) => setPage(c.id, e.target.value)}
                className="rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground"
                aria-label={`Page for ${c.name}`}
              >
                <option value="image">Image page</option>
                <option value="video">Video page</option>
              </select>
              <button
                onClick={() => remove(c.id)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
