import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, LayoutGrid } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import type { CategoryRow } from "@/lib/categories-api";

export function CategoryBar({ categories }: { categories: CategoryRow[] }) {
  const [open, setOpen] = useState(false);
  if (categories.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-4 py-2 text-sm font-medium hover:border-accent/60 transition"
      >
        <LayoutGrid className="w-4 h-4 text-accent" />
        Categories
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/categories/$slug"
              params={{ slug: c.slug }}
              search={{ sort: "latest" as const }}
              className="group prompt-glow gradient-border relative rounded-2xl border border-border bg-card/60 backdrop-blur p-5 hover:bg-card transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
            >
              <div className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-gradient-accent text-primary-foreground mb-4 group-hover:scale-105 transition-transform shadow-glow-soft">
                <CategoryIcon slug={c.slug} className="w-5 h-5" />
              </div>
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                {c.description}
              </div>
              <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-muted-foreground/40 group-hover:text-accent transition" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
