import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Normalises both YAML-parsed Date objects (ISO frontmatter) and
 * ordinal date strings ("25th January 2025 04:12:00") to YYYY-MM-DD.
 */
function toISODate(val: unknown): string {
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  if (typeof val === 'string') {
    // Strip ordinal suffixes: "25th" → "25", "1st" → "1", etc.
    const cleaned = val.replace(/(\d+)(st|nd|rd|th)\b/i, '$1');
    const d = new Date(cleaned);
    if (isNaN(d.getTime())) throw new Error(`Cannot parse date: "${val}"`);
    return d.toISOString().split('T')[0];
  }
  throw new Error(`Expected a date string or Date object, got ${typeof val}`);
}

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.preprocess(toISODate, z.string()),
    updated: z.preprocess(val => (val == null ? undefined : toISODate(val)), z.string().optional()),
    tags: z.array(z.string()),
    description: z.string().optional().default(''),
  }),
});

export const collections = { blog };
