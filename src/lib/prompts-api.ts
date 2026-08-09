import { supabase } from "@/integrations/supabase/client";

export type Prompt = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  prompt: string;
  example: string | null;
  tags: string[];
  trending: boolean;
  copy_count: number;
  created_at: string;
  image_url: string | null;
  featured?: boolean;
  showcase?: boolean;
  media_type?: "image" | "video";
};


export type SortKey = "latest" | "trending" | "most-copied";

function applySort<T extends Prompt>(rows: T[], sort: SortKey): T[] {
  const arr = [...rows];
  if (sort === "trending") {
    arr.sort((a, b) => Number(b.trending) - Number(a.trending) || b.copy_count - a.copy_count);
  } else if (sort === "most-copied") {
    arr.sort((a, b) => b.copy_count - a.copy_count);
  } else {
    arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
  return arr;
}

export async function fetchAllPrompts(): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Prompt[];
}

export async function fetchPromptsByCategory(category: string, sort: SortKey = "latest"): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("category", category);
  if (error) throw error;
  return applySort((data ?? []) as Prompt[], sort);
}

export async function fetchPromptBySlug(slug: string): Promise<Prompt | null> {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as Prompt | null;
}

export async function fetchRelated(category: string, excludeSlug: string, n = 10): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("category", category)
    .neq("slug", excludeSlug)
    .limit(n);
  if (error) throw error;
  let rows = (data ?? []) as Prompt[];
  if (rows.length < n) {
    const { data: extra } = await supabase
      .from("prompts")
      .select("*")
      .neq("category", category)
      .neq("slug", excludeSlug)
      .limit(n - rows.length);
    rows = [...rows, ...((extra ?? []) as Prompt[])];
  }
  return rows;
}
