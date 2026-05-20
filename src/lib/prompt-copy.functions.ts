import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const incrementPromptCopyCount = createServerFn({ method: "POST" })
  .inputValidator((input: { slug: string }) => {
    const slug = String(input.slug ?? "").trim();
    if (!/^[a-z0-9-]{1,160}$/.test(slug)) throw new Error("Invalid prompt slug");
    return { slug };
  })
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("prompts")
      .select("copy_count")
      .eq("slug", data.slug)
      .maybeSingle();

    if (error) throw error;
    if (!row) return { copyCount: 0 };

    const nextCount = (row.copy_count ?? 0) + 1;
    const { error: updateError } = await supabaseAdmin
      .from("prompts")
      .update({ copy_count: nextCount })
      .eq("slug", data.slug);

    if (updateError) throw updateError;
    return { copyCount: nextCount };
  });