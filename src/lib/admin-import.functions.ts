import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { generateSeo } from "@/lib/seo";

const rowSchema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().max(180).optional().nullable(),
  category: z.string().trim().min(1).max(80),
  description: z.string().trim().max(2000).optional().nullable(),
  prompt: z.string().trim().min(1).max(20000),
  example: z.string().trim().max(10000).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(60)).max(30).optional().nullable(),
  image_url: z.string().trim().max(1000).optional().nullable(),
  media_type: z.enum(["image", "video"]).optional().nullable(),
  subcategory: z.string().trim().max(80).optional().nullable(),
  ai_model: z.string().trim().max(120).optional().nullable(),
  difficulty: z.string().trim().max(40).optional().nullable(),
  author: z.string().trim().max(120).optional().nullable(),
  how_to_use: z.string().trim().max(6000).optional().nullable(),
  customization_tips: z.string().trim().max(6000).optional().nullable(),
  use_cases: z.string().trim().max(6000).optional().nullable(),
  seo_title: z.string().trim().max(200).optional().nullable(),
  meta_description: z.string().trim().max(400).optional().nullable(),
  focus_keyword: z.string().trim().max(120).optional().nullable(),
  secondary_keywords: z.array(z.string().trim().min(1).max(80)).max(20).optional().nullable(),
  image_alt: z.string().trim().max(300).optional().nullable(),
  status: z.enum(["published", "draft"]).optional().nullable(),
});


const inputSchema = z.object({
  rows: z.array(rowSchema).min(1).max(500),
  generateMissingSeo: z.boolean().optional().default(true),
});

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

    // Latest row wins when the same slug is uploaded twice.
    const bySlugInsert = new Map<string, Database["public"]["Tables"]["prompts"]["Insert"]>();
    const errors: { row: number; error: string }[] = [];

    for (let i = 0; i < data.rows.length; i++) {
      const r = data.rows[i];
      try {
        const mediaType = r.media_type ?? "image";
        let catSlug = byName.get(r.category.toLowerCase()) ?? (bySlug.has(r.category) ? r.category : null);
        if (!catSlug) {
          const newSlug = slugify(r.category);
          const { error: insCatErr } = await supabase
            .from("categories")
            .insert({ slug: newSlug, name: r.category, description: "", emoji: "✨", sort_order: 0, media_type: mediaType });
          if (insCatErr && !insCatErr.message.includes("duplicate")) throw new Error(`category: ${insCatErr.message}`);
          bySlug.set(newSlug, r.category);
          byName.set(r.category.toLowerCase(), newSlug);
          catSlug = newSlug;
          createdCategories.push(r.category);
        }

        const slug = r.slug?.trim() ? slugify(r.slug) : slugify(r.title);

        const seo = data.generateMissingSeo
          ? generateSeo({
              title: r.title,
              slug,
              description: r.description,
              prompt: r.prompt,
              category: catSlug,
              categoryName: bySlug.get(catSlug) ?? r.category,
              subcategory: r.subcategory,
              tags: r.tags ?? [],
              ai_model: r.ai_model,
              use_cases: r.use_cases,
              media_type: mediaType,
            })
          : null;

        bySlugInsert.set(slug, {
          title: r.title,
          slug,
          category: catSlug,
          prompt: r.prompt,
          description: r.description ?? null,
          example: r.example ?? null,
          tags: r.tags ?? [],
          image_url: r.image_url ?? null,
          media_type: mediaType,
          subcategory: r.subcategory ?? null,
          ai_model: r.ai_model ?? null,
          difficulty: r.difficulty ?? null,
          author: r.author ?? null,
          how_to_use: r.how_to_use ?? null,
          customization_tips: r.customization_tips ?? null,
          use_cases: r.use_cases ?? null,
          status: r.status ?? "published",
          seo_title: r.seo_title ?? seo?.seo_title ?? null,
          meta_description: r.meta_description ?? seo?.meta_description ?? null,
          focus_keyword: r.focus_keyword ?? seo?.focus_keyword ?? null,
          secondary_keywords: r.secondary_keywords ?? seo?.secondary_keywords ?? [],
          seo_keywords: seo?.seo_keywords ?? [],
          image_alt: r.image_alt ?? seo?.image_alt ?? null,
          og_title: seo?.og_title ?? null,
          og_description: seo?.og_description ?? null,
          faq: seo?.faq ?? [],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      } catch (e) {
        errors.push({ row: i + 2, error: e instanceof Error ? e.message : "Unknown error" });
      }
    }

    const inserts = Array.from(bySlugInsert.values());
    let inserted = 0;
    if (inserts.length) {
      const { error: insErr, count } = await supabase
        .from("prompts")
        .upsert(inserts, { onConflict: "slug", count: "exact" });
      if (insErr) throw new Error(insErr.message);
      inserted = count ?? inserts.length;

    }

    return {
      inserted,
      createdCategories: Array.from(new Set(createdCategories)),
      errors,
    };
  });
