import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { categories } from "@/data/prompts";

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-card focus:text-foreground focus:px-3 focus:py-1.5 focus:rounded-md focus:border focus:border-border"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-border/60 glass-strong">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold tracking-tight shrink-0"
            aria-label="PromptStack — Home"
          >
            <span className="relative inline-flex w-7 h-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent/40 shadow-glow">
              <Sparkles className="w-4 h-4 text-accent-foreground" strokeWidth={2.25} />
            </span>
            <span>PromptStack</span>
          </Link>

          <nav
            className="hidden sm:flex items-center gap-7 text-sm text-muted-foreground"
            aria-label="Primary"
          >
            <Link
              to="/categories/$slug"
              params={{ slug: "teachers" }}
              search={{ sort: "latest" as const }}
              className="hover:text-foreground transition-colors"
            >
              Browse
            </Link>
            <Link
              to="/blog"
              className="hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground" }}
            >
              Blog
            </Link>
            <Link
              to="/about"
              className="hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground" }}
            >
              About
            </Link>
          </nav>

          <div className="hidden sm:flex items-center gap-2">
            <Link
              to="/categories/$slug"
              params={{ slug: "teachers" }}
              search={{ sort: "trending" as const }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3.5 py-1.5 text-sm font-medium text-foreground hover:border-accent/50 hover:bg-card transition"
            >
              Explore prompts
            </Link>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-card/60"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {open && (
          <div className="sm:hidden border-t border-border/60 bg-background/95 backdrop-blur">
            <nav className="px-5 py-4 flex flex-col gap-1 text-sm" aria-label="Mobile">
              <Link
                to="/categories/$slug"
                params={{ slug: "teachers" }}
                search={{ sort: "latest" as const }}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-muted/60"
              >
                Browse
              </Link>
              <Link to="/blog" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md hover:bg-muted/60">
                Blog
              </Link>
              <Link to="/about" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md hover:bg-muted/60">
                About
              </Link>
              <div className="h-px bg-border my-2" />
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  to="/categories/$slug"
                  params={{ slug: c.slug }}
                  search={{ sort: "latest" as const }}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60"
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main id="main" className="flex-1 page-fade">
        {children}
      </main>

      <footer className="border-t border-border/60 mt-24" aria-label="Site footer">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-gradient-to-br from-accent to-accent/40">
                <Sparkles className="w-3.5 h-3.5 text-accent-foreground" strokeWidth={2.25} />
              </span>
              <span>PromptStack</span>
            </Link>
            <p className="text-sm text-muted-foreground mt-3 max-w-xs leading-relaxed">
              A curated library of AI prompts for real work. Free, fast, no signup.
            </p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
              Categories
            </div>
            <ul className="space-y-2.5 text-sm">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/categories/$slug"
                    params={{ slug: c.slug }}
                    search={{ sort: "latest" as const }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
              Resources
            </div>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sitemap
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
              About
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Built for everyone who works with AI. No signup, no paywall — just prompts that ship.
            </p>
          </div>
        </div>
        <div className="border-t border-border/60">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 py-5 text-xs text-muted-foreground flex flex-col sm:flex-row gap-2 justify-between">
            <div>© {new Date().getFullYear()} PromptStack. Free for everyone.</div>
            <div>Made for builders, teachers, and curious humans.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
