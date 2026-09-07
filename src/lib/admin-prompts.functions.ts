import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const faqSchema = z
  .array(
    z.object({
      question: z.string().trim().min(1).max(300),
      answer: z.string().trim().min(1).max(2000),
    }),
  )
  .max(20)
  .default([]);

const promptPayloadSchema = z.object({
  title: z.string().trim().min(1).max(180),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{1,180}$/),
  category: z.string().trim().min(1).max(80),
  description: z.string().trim().max(600).nullable(),
  prompt: z.string().trim().min(1).max(20000),
  example: z.string().trim().max(10000).nullable(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20),
  image_url: z.string().trim().max(1000).nullable(),
  trending: z.boolean(),
  featured: z.boolean(),
  showcase: z.boolean().default(false),
  media_type: z.enum(["image", "video"]).default("image"),

  // Extended content
  subcategory: z.string().trim().max(80).nullable().default(null),
  ai_model: z.string().trim().max(120).nullable().default(null),
  difficulty: z.string().trim().max(40).nullable().default(null),
  author: z.string().trim().max(120).nullable().default(null),
  how_to_use: z.string().trim().max(6000).nullable().default(null),
  customization_tips: z.string().trim().max(6000).nullable().default(null),
  use_cases: z.string().trim().max(6000).nullable().default(null),
  faq: faqSchema,

  // SEO
  seo_title: z.string().trim().max(200).nullable().default(null),
  meta_description: z.string().trim().max(400).nullable().default(null),
  focus_keyword: z.string().trim().max(120).nullable().default(null),
  secondary_keywords: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  seo_keywords: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
  canonical_url: z.string().trim().max(500).nullable().default(null),
  og_title: z.string().trim().max(200).nullable().default(null),
  og_description: z.string().trim().max(400).nullable().default(null),
  og_image: z.string().trim().max(1000).nullable().default(null),
  image_alt: z.string().trim().max(300).nullable().default(null),
  schema_type: z.string().trim().max(40).default("CreativeWork"),
  index_status: z.enum(["index", "noindex"]).default("index"),
  status: z.enum(["published", "draft"]).default("published"),
});

export type AdminPromptPayload = z.infer<typeof promptPayloadSchema>;

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

export const createAdminPrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => promptPayloadSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    // Re-uploading the same prompt (same slug) replaces the previous one.
    const { data: row, error } = await context.supabase
      .from("prompts")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert(data as any, { onConflict: "slug" })
      .select("id")
      .single();

    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const updateAdminPrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), values: promptPayloadSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("prompts")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(data.values as any)
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAdminPrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("prompts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Duplicate detection for the editor and importer. */
export const checkPromptDuplicates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid().nullable().default(null),
        title: z.string().trim().max(180).default(""),
        slug: z.string().trim().max(180).default(""),
        prompt: z.string().trim().max(20000).default(""),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: rows, error } = await context.supabase
      .from("prompts")
      .select("id, title, slug, prompt")
      .limit(2000);
    if (error) throw new Error(error.message);

    const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
    const others = (rows ?? []).filter((r) => r.id !== data.id);
    return {
      slug: others.filter((r) => norm(r.slug) === norm(data.slug)).map((r) => r.title),
      title: others.filter((r) => norm(r.title) === norm(data.title)).map((r) => r.slug),
      content: data.prompt
        ? others.filter((r) => norm(r.prompt) === norm(data.prompt)).map((r) => r.title)
        : [],
    };
  });

/** Bulk SEO generation for the admin SEO dashboard. */
export const bulkUpdatePromptSeo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        updates: z
          .array(
            z.object({
              id: z.string().uuid(),
              values: z.record(z.string(), z.union([z.string(), z.array(z.string()), z.null()])),
            }),
          )
          .min(1)
          .max(500),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    let updated = 0;
    for (const u of data.updates) {
      const { error } = await context.supabase
        .from("prompts")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(u.values as any)
        .eq("id", u.id);
      if (error) throw new Error(error.message);
      updated++;
    }
    return { updated };
  });
