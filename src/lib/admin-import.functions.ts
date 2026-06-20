import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const rowSchema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().max(180).optional().nullable(),
  category: z.string().trim().min(1).max(80),
  description: z.string().trim().max(2000).optional().nullable(),
  prompt: z.string().trim().min(1).max(20000),
  example: z.string().trim().max(10000).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(60)).max(30).optional().nullable(),
  image_url: z.string().trim().max(1000).optional().nullable(),
});

const inputSchema = z.object({ rows: z.array(rowSchema).min(1).max(500) });

async function assertAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data?.role !== "admin") throw new Error("Admin access required");
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";
}

export const bulkImportPrompts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const supabase = context.supabase;

    // Existing categories
    const { data: cats, error: catErr } = await supabase
      .from("categories")
      .select("slug, name");
    if (catErr) throw new Error(catErr.message);
    const bySlug = new Map(cats?.map((c) => [c.slug, c.name]) ?? []);
    const byName = new Map(cats?.map((c) => [c.name.toLowerCase(), c.slug]) ?? []);

    const createdCategories: string[] = [];

    // Existing prompt slugs
    const { data: existing } = await supabase.from("prompts").select("slug");
    const usedSlugs = new Set((existing ?? []).map((p) => p.slug));

    const inserts: Database["public"]["Tables"]["prompts"]["Insert"][] = [];
    const errors: { row: number; error: string }[] = [];

    for (let i = 0; i < data.rows.length; i++) {
      const r = data.rows[i];
      try {
        let catSlug = byName.get(r.category.toLowerCase()) ?? (bySlug.has(r.category) ? r.category : null);
        if (!catSlug) {
          const newSlug = slugify(r.category);
          const { error: insCatErr } = await supabase
            .from("categories")
            .insert({ slug: newSlug, name: r.category, description: "", emoji: "✨", sort_order: 0 });
          if (insCatErr && !insCatErr.message.includes("duplicate")) throw new Error(`category: ${insCatErr.message}`);
          bySlug.set(newSlug, r.category);
          byName.set(r.category.toLowerCase(), newSlug);
          catSlug = newSlug;
          createdCategories.push(r.category);
        }

        let slug = r.slug?.trim() ? slugify(r.slug) : slugify(r.title);
        let candidate = slug;
        let n = 1;
        while (usedSlugs.has(candidate)) {
          n++;
          candidate = `${slug}-${n}`;
        }
        usedSlugs.add(candidate);

        inserts.push({
          title: r.title,
          slug: candidate,
          category: catSlug,
          prompt: r.prompt,
          description: r.description ?? null,
          example: r.example ?? null,
          tags: r.tags ?? [],
          image_url: r.image_url ?? null,
        });
      } catch (e) {
        errors.push({ row: i + 2, error: e instanceof Error ? e.message : "Unknown error" });
      }
    }

    let inserted = 0;
    if (inserts.length) {
      const { error: insErr, count } = await supabase
        .from("prompts")
        .insert(inserts, { count: "exact" });
      if (insErr) throw new Error(insErr.message);
      inserted = count ?? inserts.length;
    }

    return {
      inserted,
      createdCategories: Array.from(new Set(createdCategories)),
      errors,
    };
  });
