import { supabase } from "@/integrations/supabase/client";

export type PromptFaq = { question: string; answer: string };

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
  updated_at?: string | null;
  // Extended content
  subcategory?: string | null;
  ai_model?: string | null;
  difficulty?: string | null;
  author?: string | null;
  how_to_use?: string | null;
  customization_tips?: string | null;
  use_cases?: string | null;
  faq?: PromptFaq[] | null;
  // SEO
  seo_title?: string | null;
  meta_description?: string | null;
  focus_keyword?: string | null;
  secondary_keywords?: string[] | null;
  seo_keywords?: string[] | null;
  canonical_url?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  image_alt?: string | null;
  schema_type?: string | null;
  index_status?: string | null;
  status?: string | null;
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

/** Public reads only ever return published prompts. */
const PUBLISHED = "published";

export async function fetchAllPrompts(): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("status", PUBLISHED)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Prompt[];
}

export async function fetchPromptsByCategory(category: string, sort: SortKey = "latest"): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("status", PUBLISHED)
    .eq("category", category);
  if (error) throw error;
  return applySort((data ?? []) as unknown as Prompt[], sort);
}

export async function fetchPromptBySlug(slug: string): Promise<Prompt | null> {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as unknown as Prompt | null;
}

/**
 * Related prompts scored on category, subcategory, shared tags, AI model
 * and keyword overlap so internal links stay genuinely relevant.
 */
export async function fetchRelated(category: string, excludeSlug: string, n = 8, base?: Prompt): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("status", PUBLISHED)
    .neq("slug", excludeSlug)
    .limit(200);
  if (error) throw error;
  const rows = (data ?? []) as unknown as Prompt[];

  const baseTags = new Set((base?.tags ?? []).map((t) => t.toLowerCase()));
  const baseWords = new Set(
    `${base?.title ?? ""} ${base?.description ?? ""}`
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 4),
  );

  const scored = rows.map((r) => {
    let score = 0;
    if (r.category === category) score += 5;
    if (base?.subcategory && r.subcategory && r.subcategory === base.subcategory) score += 3;
    if (base?.ai_model && r.ai_model && r.ai_model === base.ai_model) score += 2;
    for (const t of r.tags ?? []) if (baseTags.has(t.toLowerCase())) score += 2;
    for (const w of `${r.title} ${r.description ?? ""}`.toLowerCase().split(/[^a-z0-9]+/)) {
      if (w.length > 4 && baseWords.has(w)) score += 0.5;
    }
    if (r.media_type === base?.media_type) score += 0.5;
    score += Math.min(r.copy_count, 20) * 0.02;
    return { r, score };
  });

  return scored
    .sort((a, b) => b.score - a.score || new Date(b.r.created_at).getTime() - new Date(a.r.created_at).getTime())
    .slice(0, n)
    .map((s) => s.r);
}

export async function fetchPopularPrompts(n = 6, excludeSlug?: string): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("status", PUBLISHED)
    .order("copy_count", { ascending: false })
    .limit(n + 1);
  if (error) throw error;
  return ((data ?? []) as unknown as Prompt[]).filter((p) => p.slug !== excludeSlug).slice(0, n);
}
