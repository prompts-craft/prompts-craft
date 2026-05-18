import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { categories } from "@/data/prompts";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-card focus:text-foreground focus:px-3 focus:py-1.5 focus:rounded-md focus:border focus:border-border"
      >
        Skip to content
      </a>
      <header className="border-b border-border/60 backdrop-blur sticky top-0 z-40 bg-background/80">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold tracking-tight shrink-0"
            aria-label="PromptStack — Home"
          >
            <img src="/favicon.svg" alt="" width={24} height={24} className="w-6 h-6 rounded-md" />
            <span>PromptStack</span>
          </Link>
          <nav
            className="flex items-center gap-3 sm:gap-6 text-sm text-muted-foreground"
            aria-label="Primary"
          >
            <Link
              to="/categories/$slug"
              params={{ slug: "teachers" }}
              search={{ sort: "latest" as const }}
              className="hidden sm:inline hover:text-foreground transition-colors"
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
        </div>
      </header>

      <main id="main" className="flex-1 page-fade">
        {children}
      </main>

      <footer className="border-t border-border/60 mt-24" aria-label="Site footer">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <img src="/favicon.svg" alt="" width={20} height={20} className="w-5 h-5 rounded" />
              <span>PromptStack</span>
            </Link>
            <p className="text-sm text-muted-foreground mt-3 max-w-xs">
              Free AI prompts for real work. Copy, paste, ship.
            </p>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Categories
            </div>
            <ul className="space-y-2 text-sm">
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
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Resources
            </div>
            <ul className="space-y-2 text-sm">
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
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              About
            </div>
            <p className="text-sm text-muted-foreground">
              Built for everyone who works with AI. No signup, no paywall.
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
