import { supabase } from "@/integrations/supabase/client";

export type Blog = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  featured_image: string | null;
  content: string;
  category: string | null;
  tags: string[];
  related_slugs: string[];
  status: "draft" | "published";
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function fetchPublishedBlogs(): Promise<Blog[]> {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Blog[];
}

export async function fetchBlogBySlug(slug: string): Promise<Blog | null> {
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return (data as Blog) ?? null;
}

export async function fetchBlogsBySlugs(slugs: string[]): Promise<Blog[]> {
  if (slugs.length === 0) return [];
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .in("slug", slugs)
    .eq("status", "published");
  if (error) throw error;
  return (data ?? []) as Blog[];
}
