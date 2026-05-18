import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/60 backdrop-blur sticky top-0 z-40 bg-background/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="w-6 h-6 rounded-md bg-gradient-to-br from-accent to-primary inline-block" />
            <span>PromptStack</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/blog" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
              Blog
            </Link>
            <Link to="/about" className="hover:text-foreground transition-colors" activeProps={{ className: "text-foreground" }}>
              About
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/60 mt-24">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between gap-4 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} PromptStack. Free for everyone.</div>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/blog" className="hover:text-foreground">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
