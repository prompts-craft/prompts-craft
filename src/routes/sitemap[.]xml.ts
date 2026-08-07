import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { fetchCategories } from "@/lib/categories-api";
import { blogPosts } from "@/data/blog-posts";
import { fetchAllPrompts } from "@/lib/prompts-api";
import { fetchPublishedBlogs } from "@/lib/blogs-api";

const BASE_URL = "https://prompts-craft.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/about", changefreq: "monthly", priority: "0.5" },
          { path: "/blog", changefreq: "daily", priority: "0.8" },
          { path: "/video", changefreq: "weekly", priority: "0.6" },
          { path: "/auth", changefreq: "yearly", priority: "0.2" },
        ];

        const categories = await fetchCategories().catch(() => []);
        for (const c of categories) {
          entries.push({ path: `/categories/${c.slug}`, changefreq: "weekly", priority: "0.8" });
        }

        // Static / seed blog posts (kept for backwards compatibility)
        const seenBlogSlugs = new Set<string>();
        for (const b of blogPosts) {
          seenBlogSlugs.add(b.slug);
          entries.push({ path: `/blog/${b.slug}`, changefreq: "monthly", priority: "0.7" });
        }

        // Published DB blogs — auto-include with lastmod for freshness signals
        try {
          const blogs = await fetchPublishedBlogs();
          for (const b of blogs) {
            if (seenBlogSlugs.has(b.slug)) continue;
            seenBlogSlugs.add(b.slug);
            entries.push({
              path: `/blog/${b.slug}`,
              lastmod: (b.updated_at ?? b.published_at ?? b.created_at)?.slice(0, 10),
              changefreq: "monthly",
              priority: "0.7",
            });
          }
        } catch {
          // Ignore fetch failures; keep static entries
        }

        try {
          const prompts = await fetchAllPrompts();
          for (const p of prompts) {
            entries.push({
              path: `/prompts/${p.slug}`,
              lastmod: p.created_at?.slice(0, 10),
              changefreq: "monthly",
              priority: "0.7",
            });
          }
        } catch {
          // If fetching fails, still serve static entries
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
