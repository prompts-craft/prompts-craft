import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Prompt } from "@/lib/prompts-api";
import { promptThumb } from "@/lib/default-thumb";

function isVideoSrc(src: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(src);
}

const AUTOPLAY_MS = 5000;

export function PromptShowcase({ prompts }: { prompts: Prompt[] }) {
  const items = prompts.slice(0, 8);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (count < 2 || paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timer.current = setInterval(() => setI((v) => (v + 1) % count), AUTOPLAY_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [count, paused]);

  if (count === 0) return null;

  const index = Math.min(i, count - 1);
  const current = items[index];
  const go = (d: number) => setI((v) => (v + d + count) % count);

  return (
    <section className="max-w-[1500px] mx-auto px-6 pt-8">
      <div
        className="relative rounded-3xl border border-border bg-card/60 backdrop-blur overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative flex items-center justify-center bg-muted/30 min-h-[280px] max-h-[70vh]">
          {items.map((item, idx) => {
            const src = promptThumb(item.image_url);
            const active = idx === index;
            return (
              <div
                key={item.slug}
                aria-hidden={!active}
                className={`${active ? "relative" : "absolute inset-0"} flex items-center justify-center transition-all duration-700 ease-out ${
                  active ? "opacity-100 scale-100" : "opacity-0 scale-[1.03] pointer-events-none"
                }`}
              >
                {isVideoSrc(src) ? (
                  <video
                    src={src}
                    controls
                    playsInline
                    muted
                    className="max-h-[70vh] w-auto max-w-full object-contain"
                  />
                ) : (
                  <img
                    src={src}
                    alt={item.title}
                    loading={active ? "eager" : "lazy"}
                    className="max-h-[70vh] w-auto max-w-full object-contain"
                  />
                )}
              </div>
            );
          })}

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous showcase item"
                className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex w-10 h-10 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur hover:bg-background hover:scale-110 active:scale-95 transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next showcase item"
                className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex w-10 h-10 items-center justify-center rounded-full border border-border bg-background/80 backdrop-blur hover:bg-background hover:scale-110 active:scale-95 transition-all duration-300"
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
              className="font-medium hover:underline truncate block transition-colors"
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
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === index ? "w-6 bg-accent" : "w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground/70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
