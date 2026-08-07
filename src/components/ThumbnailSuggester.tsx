import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Loader2, Search, Sparkles, ArrowUpRight } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { suggestThumbnails, type ThumbnailIdea } from "@/lib/thumbnail-suggest.functions";
import type { Prompt } from "@/lib/prompts-api";

const STOP = new Set([
  "the","a","an","and","or","for","to","of","in","on","with","how","best","top","my","your","you","is","are","it","this","that","vs","2024","2025","2026",
]);

function matchPrompts(title: string, prompts: Prompt[], n = 3): Prompt[] {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
  if (!words.length) return prompts.slice(0, n);
  const scored = prompts.map((p) => {
    const hay = `${p.title} ${p.description ?? ""} ${(p.tags ?? []).join(" ")}`.toLowerCase();
    const score = words.reduce((s, w) => (hay.includes(w) ? s + 1 : s), 0);
    return { p, score };
  });
  return scored
    .sort((a, b) => b.score - a.score || b.p.copy_count - a.p.copy_count)
    .filter((s) => s.score > 0)
    .slice(0, n)
    .map((s) => s.p);
}

export function ThumbnailSuggester({ prompts }: { prompts: Prompt[] }) {
  const [title, setTitle] = useState("");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<ThumbnailIdea[] | null>(null);
  const [matches, setMatches] = useState<Prompt[]>([]);
  const suggest = useServerFn(suggestThumbnails);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3 || loading) return;
    setLoading(true);
    setError(null);
    setIdeas(null);
    setMatches(matchPrompts(title, prompts));
    try {
      const res = await suggest({ data: { title: title.trim(), niche: niche.trim() } });
      setIdeas(res.ideas);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(
        msg.includes("429")
          ? "Too many requests right now — please try again in a moment."
          : msg.includes("402")
            ? "AI suggestions are temporarily unavailable."
            : msg,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative gradient-border rounded-2xl border border-border bg-card/60 backdrop-blur p-6 sm:p-8 overflow-hidden">
      <div aria-hidden className="glow-orb w-[300px] h-[300px] right-[-80px] top-[-80px] bg-[oklch(0.7_0.2_300)]" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-wider font-medium text-accent bg-accent-soft px-2 py-0.5 rounded-full mb-3">
          <Sparkles className="w-3 h-3" /> AI thumbnail finder
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Paste your YouTube video title</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">
          We'll detect your niche and suggest ready-to-use thumbnail prompts tailored to your video.
        </p>

        <form onSubmit={onSubmit} className="mt-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="e.g. I Tried Waking Up at 5AM For 30 Days"
              aria-label="YouTube video title"
              className="w-full rounded-xl border border-border bg-background/70 pl-9 pr-3 py-3 text-sm outline-none focus:border-accent/70 transition"
            />
          </div>
          <input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            maxLength={60}
            placeholder="Niche (optional)"
            aria-label="Channel niche"
            className="sm:w-44 rounded-xl border border-border bg-background/70 px-3 py-3 text-sm outline-none focus:border-accent/70 transition"
          />
          <button
            type="submit"
            disabled={loading || title.trim().length < 3}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-accent text-primary-foreground px-5 py-3 text-sm font-medium disabled:opacity-50 shadow-glow-soft hover:opacity-95 transition"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Thinking..." : "Suggest thumbnails"}
          </button>
        </form>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        {ideas && (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {ideas.map((idea, i) => (
              <div
                key={i}
                className="prompt-glow rounded-xl border border-border bg-background/50 p-4 flex flex-col"
              >
                <div className="text-xs text-accent mb-1">{idea.niche || "Thumbnail"}</div>
                <div className="font-medium leading-snug">{idea.concept}</div>
                {idea.text_overlay && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Overlay text: <span className="text-foreground font-medium">{idea.text_overlay}</span>
                  </div>
                )}
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-6 flex-1">
                  {idea.prompt}
                </p>
                <div className="mt-4">
                  <CopyButton text={idea.prompt} label="Copy prompt" size="sm" fullWidth />
                </div>
              </div>
            ))}
          </div>
        )}

        {ideas && matches.length > 0 && (
          <div className="mt-8">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Matching prompts from the library
            </div>
            <div className="flex flex-wrap gap-2">
              {matches.map((p) => (
                <Link
                  key={p.slug}
                  to="/prompts/$slug"
                  params={{ slug: p.slug }}
                  className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-border hover:border-accent/60 hover:text-accent transition"
                >
                  {p.title} <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
