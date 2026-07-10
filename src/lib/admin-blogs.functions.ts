import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const blogPayloadSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]{1,200}$/),
  description: z.string().trim().max(500).nullable(),
  meta_title: z.string().trim().max(200).nullable(),
  meta_description: z.string().trim().max(400).nullable(),
  featured_image: z.string().trim().max(2000).nullable(),
  content: z.string().max(200000),
  category: z.string().trim().max(80).nullable(),
  tags: z.array(z.string().trim().min(1).max(60)).max(30),
  related_slugs: z.array(z.string().trim().min(1).max(200)).max(20),
  status: z.enum(["draft", "published"]),
});

async function assertAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "super_admin"]);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Admin access required");
}

export const createAdminBlog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => blogPayloadSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload = {
      ...data,
      published_at: data.status === "published" ? new Date().toISOString() : null,
    };
    const { data: row, error } = await context.supabase
      .from("blogs")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const updateAdminBlog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), values: blogPayloadSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    // fetch current to preserve published_at when already published
    const { data: current } = await context.supabase
      .from("blogs")
      .select("status, published_at")
      .eq("id", data.id)
      .maybeSingle();
    let published_at = current?.published_at ?? null;
    if (data.values.status === "published" && !published_at) {
      published_at = new Date().toISOString();
    }
    if (data.values.status === "draft") {
      // keep original publish time as null when converting to draft? keep history — set null
      published_at = null;
    }
    const { error } = await context.supabase
      .from("blogs")
      .update({ ...data.values, published_at })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAdminBlog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("blogs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
