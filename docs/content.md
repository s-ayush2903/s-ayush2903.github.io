# Content

## Adding a blog post

1. Create `src/content/blog/your-slug.md`
2. Add frontmatter:

```yaml
---
title: Post Title
date: 30th January 2026 20:12:00
tags: [systems, jvm]
description: One or two sentences shown in the blog index and search snippets.
---
```

3. Write the body in markdown (see extras below).
4. `npm run dev` → visit `/blog` to preview.

## Frontmatter schema

| Field | Required | Notes |
|---|---|---|
| `title` | yes | Shown in the post header and blog list |
| `date` | yes | Ordinal format: `30th January 2026` |
| `tags` | yes | Array of strings; used for filtering |
| `description` | recommended | Shown in the blog index; omit and the excerpt is empty |
| `updated` | no | Show a last-edited date alongside the publish date |

> **Date format:** `src/lib/dates.ts` normalizes ordinal dates (`30th January 2026`) to ISO 8601 internally. Always use ordinal format in frontmatter.

## Supported markdown extras

| Syntax | What it renders |
|---|---|
| ` ```math ` | KaTeX math block |
| ` ```mermaid ` | Mermaid diagram (hydrated client-side) |
| `:::tip` | Tip callout box |
| `:::warning` | Warning callout box |
| `:::gotcha` | Gotcha / watch-out callout box |
| GFM tables | Standard pipe tables |
| GFM task lists | `- [ ]` / `- [x]` checkboxes |

## What not to add

See [agents.md](../agents.md) — specifically the "What NOT to add (ever)" section. The blog is the project showcase; there is no projects page.
