import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MediaType = "image" | "video";

export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  emoji: string;
  sort_order: number;
  media_type: MediaType;
};

export async function fetchCategories(): Promise<CategoryRow[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, description, emoji, sort_order, media_type")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CategoryRow[];
}

export async function fetchCategoryBySlug(slug: string): Promise<CategoryRow | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, slug, name, description, emoji, sort_order, media_type")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as CategoryRow | null;
}

export function useCategories(initialData?: CategoryRow[]) {
  return useQuery<CategoryRow[]>({
    queryKey: ["categories", "public"],
    queryFn: fetchCategories,
    initialData,
    staleTime: 30_000,
  });
}
