# Rendering

## Build pipeline

Every page is generated at deploy time. There is no runtime server.

```
src/content/blog/*.md
        │
        ▼  Content Collections  (zod schema — src/content.config.ts)
        │  validates frontmatter: title, date, tags, description
        │
        ▼  src/pages/blog/[slug].astro
        │  reads post data, passes to layout
        │
        ▼  src/layouts/Layout.astro
        │  injects OG tags, fonts, anti-flash theme script
        │  runs remark pipeline:
        │    ├── remarkCallouts   (:::tip / :::warning / :::gotcha)
        │    ├── remark-gfm       (tables, task lists, strikethrough)
        │    ├── remark-math      ($$…$$ math blocks)
        │    └── rehype-katex     (renders math to HTML)
        │  runs Shiki for syntax highlighting
        │    ├── light theme: one-light
        │    └── dark theme:  one-dark-pro
        ▼
    dist/blog/<slug>/index.html   →  uploaded to GitHub Pages
```

## React islands

Most markup is static Astro — no JS shipped. JS hydrates only where the browser needs it:

| Component | Directive | Why |
|---|---|---|
| `Navbar.tsx` | `client:load` | Theme switcher + palette picker need localStorage |
| `BlogListIsland.tsx` | `client:load` | Tag filter + sort are interactive |
| `MermaidIsland.tsx` | `client:idle` | Mermaid's renderer is browser-only |
| `BlogPostMeta.tsx` | `client:load` | Reading time + date display |

`client:load` hydrates immediately on page load. `client:idle` waits until the browser is idle — used for non-critical rendering like diagrams.

Everything else (blog cards, layout, static text) is zero-JS Astro.
