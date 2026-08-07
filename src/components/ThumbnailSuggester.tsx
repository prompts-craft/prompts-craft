import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Search, Sparkles, ArrowUpRight } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";
import { fetchAllPrompts, type Prompt } from "@/lib/prompts-api";
import { promptThumb } from "@/lib/default-thumb";

const STOP = new Set([
  "the","a","an","and","or","for","to","of","in","on","with","how","best","top","my","your","you","is","are","it","this","that","vs","2024","2025","2026",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function matchPrompts(title: string, niche: string, prompts: Prompt[], n = 6): Prompt[] {
  const words = [...tokenize(title), ...tokenize(niche)];
  const scored = prompts.map((p) => {
    const hay = `${p.title} ${p.description ?? ""} ${p.category} ${(p.tags ?? []).join(" ")}`.toLowerCase();
    const score = words.reduce((s, w) => (hay.includes(w) ? s + 1 : s), 0);
    const bonus = p.category === "youtube-thumbnail" ? 1 : 0;
    return { p, score: score + (score > 0 ? bonus : 0) };
  });
  const hits = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || b.p.copy_count - a.p.copy_count)
    .slice(0, n)
    .map((s) => s.p);
  if (hits.length >= n) return hits;
  const fill = prompts
    .filter((p) => !hits.includes(p))
    .sort((a, b) => Number(b.trending) - Number(a.trending) || b.copy_count - a.copy_count)
    .slice(0, n - hits.length);
  return [...hits, ...fill];
}

export function ThumbnailSuggester({ prompts }: { prompts: Prompt[] }) {
  const [title, setTitle] = useState("");
  const [niche, setNiche] = useState("");
  const [results, setResults] = useState<Prompt[] | null>(null);

  const { data: allPrompts } = useQuery({
    queryKey: ["all-prompts"],
    queryFn: fetchAllPrompts,
    staleTime: 5 * 60 * 1000,
  });

  const pool = allPrompts && allPrompts.length ? allPrompts : prompts;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) return;
    setResults(matchPrompts(title.trim(), niche.trim(), pool));
  };

  return (
    <div className="relative gradient-border rounded-2xl border border-border bg-card/60 backdrop-blur p-6 sm:p-8 overflow-hidden">
      <div aria-hidden className="glow-orb w-[300px] h-[300px] right-[-80px] top-[-80px] bg-[oklch(0.7_0.2_300)]" />
      <div className="relative">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-wider font-medium text-accent bg-accent-soft px-2 py-0.5 rounded-full mb-3">
          <Sparkles className="w-3 h-3" /> Thumbnail finder
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Paste your YouTube video title</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl leading-relaxed">
          We'll match your title with thumbnails from our library so you can preview and copy the exact prompt.
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
            disabled={title.trim().length < 3}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-accent text-primary-foreground px-5 py-3 text-sm font-medium disabled:opacity-50 shadow-glow-soft hover:opacity-95 transition"
          >
            <Search className="w-4 h-4" />
            Find thumbnails
          </button>
        </form>

        {results && (
          <div className="mt-8">
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
              Suggested thumbnails
            </div>
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matching thumbnails yet — try a different title.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((p) => (
                  <div
                    key={p.slug}
                    className="prompt-glow rounded-xl border border-border bg-background/50 overflow-hidden flex flex-col"
                  >
                    <Link to="/prompts/$slug" params={{ slug: p.slug }} className="block">
                      <img
                        src={promptThumb(p.image_url)}
                        alt={`${p.title} thumbnail preview`}
                        loading="lazy"
                        className="w-full h-auto object-cover"
                      />
                    </Link>
                    <div className="p-4 flex flex-col flex-1">
                      <Link
                        to="/prompts/$slug"
                        params={{ slug: p.slug }}
                        className="font-medium leading-snug hover:text-accent transition inline-flex items-start gap-1"
                      >
                        {p.title} <ArrowUpRight className="w-3.5 h-3.5 mt-1 shrink-0" />
                      </Link>
                      {p.description && (
                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                          {p.description}
                        </p>
                      )}
                      <div className="mt-4">
                        <CopyButton text={p.prompt} label="Copy prompt" size="sm" fullWidth />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
