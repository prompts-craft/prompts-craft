import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Link as LinkIcon, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Internal link block — SEO-friendly anchor with descriptive text and a
 * short context line. Use to cross-link between related pages on the site.
 */
export function InternalLink({
  to,
  params,
  title,
  description,
  icon,
}: {
  to: string;
  params?: Record<string, string>;
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <Link
      to={to}
      params={params as never}
      className="group flex items-start gap-3 rounded-xl border border-border bg-card/60 backdrop-blur p-4 hover:border-accent/60 transition"
    >
      <span className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-accent-soft text-accent shrink-0">
        {icon ?? <LinkIcon className="w-4 h-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 font-medium text-foreground group-hover:text-accent transition-colors">
          {title}
          <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
        </span>
        {description && (
          <span className="block text-xs text-muted-foreground mt-1 leading-relaxed">
            {description}
          </span>
        )}
      </span>
    </Link>
  );
}

/**
 * External reference — annotated outbound link with rel attributes safe for
 * SEO (nofollow-optional, noopener) and a visible source label. Use inside
 * article prose or in a "Further reading" list.
 */
export function ExternalReference({
  href,
  title,
  source,
  description,
  nofollow = false,
}: {
  href: string;
  title: string;
  source?: string;
  description?: string;
  nofollow?: boolean;
}) {
  const rel = ["noopener", "noreferrer", nofollow ? "nofollow" : null, "external"]
    .filter(Boolean)
    .join(" ");
  let host = source;
  if (!host) {
    try {
      host = new URL(href).hostname.replace(/^www\./, "");
    } catch {
      host = "External source";
    }
  }
  return (
    <a
      href={href}
      target="_blank"
      rel={rel}
      className="group flex items-start gap-3 rounded-xl border border-border bg-card/60 backdrop-blur p-4 hover:border-accent/60 transition"
    >
      <span className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-muted text-foreground/80 shrink-0">
        <ExternalLink className="w-4 h-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 font-medium text-foreground group-hover:text-accent transition-colors">
          {title}
          <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
        </span>
        <span className="block text-[11px] uppercase tracking-wider text-muted-foreground mt-1">
          {host}
        </span>
        {description && (
          <span className="block text-xs text-muted-foreground mt-1 leading-relaxed">
            {description}
          </span>
        )}
      </span>
    </a>
  );
}
