import { Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, X, Moon, Sun, LogIn, LogOut, User } from "lucide-react";
import logoSymbol from "@/assets/logo-symbol.svg";
import logoAsset from "@/assets/promptcraft-logo.png.asset.json";
import { useTheme } from "@/hooks/use-theme";
import { SocialLinks } from "@/components/SocialLinks";
import { supabase } from "@/integrations/supabase/client";

import { categories } from "@/data/prompts";

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { theme, toggle, mounted } = useTheme();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }


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
            className="flex items-center gap-2.5 font-semibold tracking-tight shrink-0 group"
            aria-label="PromptCraft — Home"
          >
            <span className="relative inline-flex items-center justify-center">
              <span aria-hidden className="absolute inset-0 rounded-xl bg-gradient-accent opacity-40 blur-md group-hover:opacity-70 transition" />
              <img src={logoSymbol} alt="" className="relative w-9 h-9 rounded-xl ring-1 ring-border bg-card/60" />
            </span>
            <span style={{ fontFamily: "var(--font-display)" }} className="text-lg tracking-wide text-gradient">PromptCraft</span>
          </Link>

          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <SocialLinks size="sm" />
          </div>


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
            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle theme"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card/60 text-foreground hover:border-accent/50 hover:bg-card transition"
            >
              {mounted ? theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" /> : <span className="w-4 h-4" />}
            </button>
            <Link
              to="/categories/$slug"
              params={{ slug: "teachers" }}
              search={{ sort: "trending" as const }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3.5 py-1.5 text-sm font-medium text-foreground hover:border-accent/50 hover:bg-card transition"
            >
              Explore prompts
            </Link>
            {userEmail ? (
              <div className="flex items-center gap-2 pl-1">
                <span
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground max-w-[140px] truncate"
                  title={userEmail}
                >
                  <User className="w-3.5 h-3.5" />
                  {userEmail}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-sm font-medium text-foreground hover:border-accent/50 hover:bg-card transition"
                >
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-sm font-medium text-foreground hover:border-accent/50 hover:bg-card transition"
                >
                  <LogIn className="w-4 h-4" /> Sign in
                </Link>
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:bg-primary/90 transition"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle theme"
              className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-card/60"
            >
              {mounted ? theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" /> : <span className="w-4 h-4" />}
            </button>
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
              <div className="h-px bg-border my-2" />
              {userEmail ? (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    handleSignOut();
                  }}
                  className="text-left px-3 py-2 rounded-md hover:bg-muted/60 inline-flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Sign out ({userEmail})
                </button>
              ) : (
                <>
                  <Link
                    to="/auth"
                    onClick={() => setOpen(false)}
                    className="px-3 py-2 rounded-md hover:bg-muted/60 inline-flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" /> Sign in
                  </Link>
                  <Link
                    to="/auth"
                    onClick={() => setOpen(false)}
                    className="px-3 py-2 rounded-md bg-primary text-primary-foreground font-medium"
                  >
                    Sign up
                  </Link>
                </>
              )}
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
              <img src={logoSymbol} alt="" className="w-7 h-7 rounded-md" />
              <span style={{ fontFamily: "var(--font-display)" }} className="text-gradient">PromptCraft</span>
            </Link>

            <p className="text-sm text-muted-foreground mt-3 max-w-xs leading-relaxed">
              Craft better prompts. Get better results. A free, curated library of AI prompts for real work.
            </p>

            <div className="mt-4">
              <SocialLinks size="sm" />
            </div>

            <img
              src={logoAsset.url}
              alt="PromptCraft"
              className="mt-5 w-32 opacity-80 hidden sm:block"
              loading="lazy"
            />
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
            <div>© {new Date().getFullYear()} PromptCraft. Craft better prompts.</div>
            <div>Made for builders, teachers, and curious humans.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
