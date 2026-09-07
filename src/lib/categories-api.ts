import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MediaType = "image" | "video";

export type CategoryFaq = { question: string; answer: string };

export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  emoji: string;
  sort_order: number;
  media_type: MediaType;
  seo_title?: string | null;
  meta_description?: string | null;
  long_description?: string | null;
  focus_keyword?: string | null;
  secondary_keywords?: string[] | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  image_alt?: string | null;
  faq?: CategoryFaq[] | null;
};

const COLUMNS =
  "id, slug, name, description, emoji, sort_order, media_type, seo_title, meta_description, long_description, focus_keyword, secondary_keywords, og_title, og_description, og_image, image_alt, faq";

export async function fetchCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("categories")
    .select(COLUMNS)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as CategoryRow[];
}

export async function fetchCategoryBySlug(slug: string): Promise<CategoryRow | null> {
  const { data, error } = await supabase
    .from("categories")
    .select(COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as unknown as CategoryRow | null;
}

export function useCategories(initialData?: CategoryRow[]) {
  return useQuery<CategoryRow[]>({
    queryKey: ["categories", "public"],
    queryFn: fetchCategories,
    initialData,
    staleTime: 30_000,
  });
}
