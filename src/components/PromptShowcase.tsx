import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Prompt } from "@/lib/prompts-api";
import { promptThumb } from "@/lib/default-thumb";

function isVideoSrc(src: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(src);
}

export function PromptShowcase({ prompts }: { prompts: Prompt[] }) {
  const items = prompts.slice(0, 8);
  const [i, setI] = useState(0);
  if (items.length === 0) return null;

  const current = items[Math.min(i, items.length - 1)];
  const src = promptThumb(current.image_url);
  const go = (d: number) => setI((v) => (v + d + items.length) % items.length);

  return (
    <section className="max-w-[1500px] mx-auto px-6 pt-8">
      <div className="relative rounded-3xl border border-border bg-card/60 backdrop-blur overflow-hidden">
        <div className="relative flex items-center justify-center bg-muted/30 min-h-[280px] max-h-[70vh]">
          {isVideoSrc(src) ? (
            <video
              key={src}
              src={src}
              controls
              playsInline
              className="max-h-[70vh] w-auto max-w-full object-contain"
            />
          ) : (
            <img
              key={src}
              src={src}
              alt={current.title}
              className="max-h-[70vh] w-auto max-w-full object-contain"
            />
          )}

          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous showcase item"
                className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex w-10 h-10 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur hover:bg-background transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next showcase item"
                className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex w-10 h-10 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur hover:bg-background transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap border-t border-border/60 px-5 py-4">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.18em] text-accent">Showcase</div>
            <Link
              to="/prompts/$slug"
              params={{ slug: current.slug }}
              className="font-medium hover:underline truncate block"
            >
              {current.title}
            </Link>
          </div>
          <div className="flex items-center gap-1.5">
            {items.map((p, idx) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => setI(idx)}
                aria-label={`Show item ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? "w-6 bg-accent" : "w-1.5 bg-muted-foreground/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
