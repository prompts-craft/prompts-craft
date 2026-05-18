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
  created_at: string;
};

export async function fetchAllPrompts(): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Prompt[];
}

export async function fetchPromptsByCategory(category: string): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Prompt[];
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

export async function fetchRelated(category: string, excludeSlug: string, n = 3): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("category", category)
    .neq("slug", excludeSlug)
    .limit(n);
  if (error) throw error;
  return (data ?? []) as Prompt[];
}
