# Prompt Craft — SEO, CMS & Admin Upgrade

A large upgrade delivered in phases on top of the existing site. Nothing is rebuilt: current prompts, categories, blogs, users, admin panel and URLs all stay exactly as they are.

## Phase 1 — Database (additive only)

Add new optional columns to the existing prompt, category and blog tables. No existing data is touched, no tables replaced.

- Prompts gain: subcategory, AI model, difficulty, author, how to use, customization tips, use cases, FAQ, example output (already present), plus SEO title, meta description, focus keyword, secondary keywords, keywords, canonical URL, OG title, OG description, OG image, image alt text, schema type, index/noindex, published status.
- Categories gain: SEO title, meta description, long description, focus keyword, secondary keywords, OG title/description/image, image alt.
- Blogs gain: focus keyword, secondary keywords, canonical URL, OG title/description/image, featured image alt, author.

## Phase 2 — Prompt editor in the admin panel

- New grouped editor: Content, Details, SEO. Every new field above, with character counters and limit hints on SEO title (50–60), meta description (140–160), slug and alt text.
- "Generate SEO" button that drafts title, description, focus/secondary keywords, slug, alt text, OG text and FAQ suggestions from the prompt's own content — fully editable before saving, and unique per prompt.
- Live SEO score (0–100) with green/amber/red checks, labelled as an internal content helper, not a Google ranking.
- Duplicate warnings for matching title, slug or prompt text before saving.

## Phase 3 — Import system

- Support all new columns plus every old column, so existing spreadsheets keep working.
- Preview table before import, clear per-row validation errors, duplicate slug/prompt detection, auto slug generation, optional "auto generate missing SEO" that never overwrites values you supplied, success/failure counts and a downloadable error report.

## Phase 4 — Public pages

- Prompt pages: unique title/description/canonical/OG/Twitter tags from the saved SEO fields, single H1, clean H2/H3 structure, breadcrumbs, and sections (What it does, How to use, Who it's for, Customization tips, Example output, Best AI model, Use cases, Related prompts, FAQ) shown only when data exists.
- Related prompts scored by category, tags, model and keywords; plus related categories and popular/recent prompts for internal linking.
- Category pages: unique SEO text, intro, description, FAQs, featured/popular prompts, related categories, breadcrumb + collection schema.
- Homepage: one keyword-relevant H1, short intro, sections for categories, featured, trending, how it works, who it's for, latest guides, FAQ, CTA — current design kept.
- Blog: full SEO field support, table of contents, related prompts and posts, Article schema.
- Structured data centralised so nothing is duplicated across root and page.

## Phase 5 — Admin SEO dashboard and validator

- New Admin > SEO page: counts of public prompts, items missing SEO title / meta description / focus keyword / alt text, duplicate slugs and titles, categories and blogs missing SEO, noindex pages.
- Filters (missing / complete / duplicate / draft / published), safe bulk actions (generate missing SEO, generate missing alt text, validate, export CSV) that never overwrite manual SEO unless "overwrite" is explicitly chosen.
- Validation scan reporting missing/duplicate titles, descriptions, H1s, canonicals, alt text, OG data, structured data and sitemap mismatches, each with a fix recommendation.

## Phase 6 — Technical SEO, trust pages, performance

- Sitemap: homepage, all published prompts, categories, blogs, static pages; excludes admin, auth, drafts and noindex items; regenerates on every request so publishing updates it immediately.
- robots.txt verified: public content allowed, admin/auth blocked, correct sitemap URL.
- New Privacy Policy, Terms and Contact pages linked in the footer, with clear navigation and breadcrumbs on deeper pages (needed for AdSense readiness; no claims about approval).
- Image alt text, width/height, lazy loading below the fold, hero image eager; code splitting and reduced re-renders.

## Notes

- Existing URLs are preserved; nothing needs a redirect.
- The SEO generator uses the prompt's own content rather than an external AI service, so there is no extra cost or key. If you'd prefer AI-written SEO text, say so and I'll route it through the built-in AI instead.
- Contact details, privacy and terms wording need real information from you — I'll leave clear placeholders rather than invent facts.
- Going live requires publishing after each phase.
