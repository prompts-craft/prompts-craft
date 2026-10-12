import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Prompt } from "@/lib/prompts-api";
import { promptThumb, DEFAULT_PROMPT_THUMB } from "@/lib/default-thumb";

const VIDEO_RE = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i;
const AUTOPLAY_MS = 6000;

function mediaFor(p: Prompt) {
  const urls = [p.image_url ?? "", ...(p.gallery ?? [])].filter(Boolean);
  const video = urls.find((u) => VIDEO_RE.test(u)) ?? null;
  const image = urls.find((u) => !VIDEO_RE.test(u)) ?? DEFAULT_PROMPT_THUMB;
  return { video, image };
}

function HeroVideo({ src, poster, active }: { src: string; poster: string; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) v.play().catch(() => {});
    else v.pause();
  }, [active]);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      disablePictureInPicture
      controls={false}
      className="absolute inset-0 h-full w-full object-cover pointer-events-none"
    />
  );
}

export function PromptShowcase({ prompts }: { prompts: Prompt[] }) {
  const items = prompts.slice(0, 8);
  const [i, setI] = useState(0);
  const count = items.length;

  useEffect(() => {
    if (count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((v) => (v + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [count]);

  if (count === 0) return null;
  const index = Math.min(i, count - 1);
  const current = items[index];

  return (
    <section
      aria-label="Featured prompt"
      className="relative w-full overflow-hidden bg-black"
    >
      {/* Blurred backdrop tinted by the active slide's colors */}
      {items.map((item, idx) => {
        const { image } = mediaFor(item);
        return (
          <div
            key={`bg-${item.slug}`}
            aria-hidden
            className={`absolute inset-0 transition-opacity duration-1000 ease-out ${idx === index ? "opacity-100" : "opacity-0"}`}
          >
            <img
              src={promptThumb(image)}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover scale-125 blur-3xl saturate-150 brightness-[0.55]"
            />
          </div>
        );
      })}
      <div className="relative max-w-[1500px] mx-auto grid lg:grid-cols-[2fr_3fr] items-center gap-6 lg:gap-0 px-4 sm:px-6 lg:pr-0 py-8 lg:py-0">
        {/* Text — 40% */}
        <div className="relative z-10 lg:pr-10 lg:py-12 order-2 lg:order-1">
          <div className="text-xs uppercase tracking-[0.22em] text-hero-ink-muted">Featured prompt</div>
          <div key={current.slug} className="page-fade">
            <h2 className="mt-3 text-2xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight text-hero-ink line-clamp-3">
              {current.title}
            </h2>
            {current.description && (
              <p className="mt-4 text-sm sm:text-base leading-relaxed text-hero-ink-muted line-clamp-3 max-w-lg">
                {current.description}
              </p>
            )}
          </div>
          <Link
            to="/prompts/$slug"
            params={{ slug: current.slug }}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-hero-ink text-background px-5 py-2.5 text-sm font-medium transition hover:opacity-90"
          >
            Use this prompt <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Media — 60% */}
        <div className="relative order-1 lg:order-2 aspect-video w-full overflow-hidden rounded-xl lg:rounded-none">
          {items.map((item, idx) => {
            const { video, image } = mediaFor(item);
            const active = idx === index;
            return (
              <div
                key={item.slug}
                aria-hidden={!active}
                className={`absolute inset-0 transition-opacity duration-1000 ease-out ${active ? "opacity-100" : "opacity-0"}`}
              >
                {video ? (
                  <HeroVideo src={video} poster={promptThumb(image)} active={active} />
                ) : (
                  <img
                    src={image}
                    alt={item.image_alt || item.title}
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </div>
            );
          })}
          {/* Soft blend into the gradient on the left edge */}
          <div aria-hidden className="hidden lg:block absolute inset-y-0 left-0 w-24 pointer-events-none" style={{ backgroundImage: "linear-gradient(90deg, oklch(0.2 0 0 / 0.6), transparent)" }} />
        </div>
      </div>
    </section>
  );
}
