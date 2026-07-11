import { useEffect, useState } from "react";
import { Sparkles, BadgeCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StarRating } from "@/components/StarRating";

type AIRating = {
  id: string;
  ai_model: string;
  stars: number;
  is_recommended: boolean;
  notes: string | null;
  sort_order: number;
};

export function PromptAIRatings({ promptId }: { promptId: string }) {
  const [rows, setRows] = useState<AIRating[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("prompt_ai_ratings")
        .select("id, ai_model, stars, is_recommended, notes, sort_order")
        .eq("prompt_id", promptId)
        .order("is_recommended", { ascending: false })
        .order("stars", { ascending: false })
        .order("sort_order", { ascending: true });
      if (!cancelled) setRows((data ?? []) as AIRating[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [promptId]);

  if (!rows || rows.length === 0) return null;

  const sorted = [...rows].sort((a, b) => {
    if (a.is_recommended !== b.is_recommended) return a.is_recommended ? -1 : 1;
    if (b.stars !== a.stars) return b.stars - a.stars;
    return a.sort_order - b.sort_order;
  });

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-accent" /> AI Model Ratings
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        How different AI models perform with this prompt, rated out of 5.
      </p>
      <ul className="mt-4 divide-y divide-border/60 rounded-2xl border border-border bg-card/60 backdrop-blur overflow-hidden">
        {sorted.map((r) => (
          <li key={r.id} className="flex items-center justify-between gap-3 flex-wrap p-4 sm:p-5">
            <div className="flex items-center gap-3 min-w-0">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-accent-soft text-accent font-semibold shrink-0">
                {r.ai_model.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground/90">{r.ai_model}</span>
                  {r.is_recommended && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <BadgeCheck className="w-3 h-3" /> Recommended
                    </span>
                  )}
                </div>
                {r.notes && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.notes}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StarRating value={r.stars} />
              <span className="text-xs text-muted-foreground tabular-nums">{r.stars}/5</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
