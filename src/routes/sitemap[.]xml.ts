import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { categories } from "@/data/prompts";
import { blogPosts } from "@/data/blog-posts";
import { fetchAllPrompts } from "@/lib/prompts-api";

// TODO: replace with your project URL once a project name or custom domain is set.
const BASE_URL = "";

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
          { path: "/blog", changefreq: "weekly", priority: "0.6" },
        ];

        for (const c of categories) {
          entries.push({ path: `/categories/${c.slug}`, changefreq: "weekly", priority: "0.8" });
        }

        for (const b of blogPosts) {
          entries.push({ path: `/blog/${b.slug}`, changefreq: "monthly", priority: "0.6" });
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
