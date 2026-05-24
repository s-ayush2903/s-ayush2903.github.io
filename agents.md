# North Star

## What this is

Personal portfolio and technical blog for Ayush Shrivastava — backend engineer focused on distributed systems, JVM internals, and infrastructure reliability.

This site gets linked in job applications to big tech companies and surfaces when engineers find blog posts via search. The goal is to be **simple, fast, and credible**. Visitors should find what they need without the site getting in the way.

## Two content pillars — nothing more

1. **Bio** (`/`) — who I am, what I'm working on, where to find me
2. **Writing** (`/blog`) — technical posts that demonstrate depth

Blog posts ARE the project showcase. There is no separate projects page.

## Design principles

1. **Text-first.** Content is the product. UI chrome should recede.
2. **Every byte earns its place.** No dependency without a visible, rendered feature. No component that isn't imported by a real page.
3. **No framework churn.** The stack is Astro + React islands + Tailwind + IBM Plex. Change it only with a concrete reason.
4. **No feature creep.** Do not add: comment systems, newsletter signups, social share widgets, analytics scripts, contact forms, "related posts" carousels, project showcase pages.
5. **Latency matters.** Static generation at build time, self-hosted fonts, no runtime servers, no client-side data fetching.

## What to keep

- **5 color palettes + dark/light toggle** — intentional developer-facing touch; already built and maintained in `src/components/Navbar.tsx`
- **IBM Plex Sans/Mono** — self-hosted woff2 in `public/fonts/`, no CDN dependency
- **Mermaid diagrams, KaTeX math, custom callouts** — serve technical writing
- **Shiki dual-theme syntax highlighting** — light: `one-light`, dark: `one-dark-pro`
- **RSS feed** at `/rss.xml`

## What NOT to add (ever)

- Analytics or tracking scripts
- Third-party comment systems
- Newsletter / email capture
- A projects page (blog posts serve this purpose)
- shadcn/ui components that aren't rendered anywhere
- npm packages without a visible feature tied to them

## Tech decisions

- **Astro 6** for static generation — all pages pre-built at deploy time via GitHub Actions → GitHub Pages
- **React islands** (`client:load`, `client:idle`) only for components that need browser interactivity. Currently: `Navbar`, `BlogListIsland`, `MermaidIsland`, `BlogPostMeta`
- **Tailwind utilities** only — no CSS-in-JS, no styled-components
- **Self-hosted fonts** — copied from `@fontsource` devDeps to `public/fonts/` via `scripts/copy-fonts.cjs` at `postinstall`
- **`zod`** — used in `src/content.config.ts` for blog post schema validation; keep
- **`date-fns`** — used in `src/lib/utils.ts`; keep
- **`clsx`** + **`tailwind-merge`** — used in `src/lib/utils.ts` `cn()` helper; keep

## Adding blog posts

Frontmatter schema (all fields except `title`, `date`, `tags` are optional):

```yaml
---
title: Post Title
date: 30th January 2026 20:12:00
tags: [tag1, tag2]
description: One or two sentence summary shown in the blog index and search snippets.
---
```

Every post should have a `description`. Dates use ordinal format (`30th January 2026`) which `src/lib/dates.ts` normalizes to ISO.

## Adding dependencies

Before adding a package:
1. Grep to confirm the feature doesn't already exist in the codebase
2. Confirm it will be rendered on a real page (not just sitting in a component file)
3. Remove an equal or larger package if the bundle is already sufficient

## File map

| What | Where |
|------|-------|
| Pages | `src/pages/{index,404,blog/index,blog/[slug]}.astro` |
| Layout + OG tags | `src/layouts/Layout.astro` |
| Navbar + themes | `src/components/Navbar.tsx` |
| Blog list + tag filter | `src/components/BlogListIsland.tsx` |
| Blog card | `src/components/BlogCard.tsx` |
| Mermaid renderer | `src/components/MermaidIsland.tsx` |
| Blog post meta | `src/components/BlogPostMeta.tsx` |
| Content | `src/content/blog/*.md` |
| Global styles + themes | `src/index.css` |
| Tailwind config | `tailwind.config.ts` |
| Blog utilities | `src/lib/blog.ts` |
| Date normalization | `src/lib/dates.ts` |
| CSS utilities | `src/lib/utils.ts` |
| Callout remark plugin | `src/plugins/remarkCallouts.ts` |
| Fonts (source) | `public/fonts/*.woff2` |
| Deploy | `.github/workflows/deploy.yml` |
