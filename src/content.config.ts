import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    // YAML auto-parses ISO date strings (2024-03-15) as Date objects
    date: z.coerce.date().transform(d => d.toISOString().split('T')[0]),
    updated: z.coerce.date().transform(d => d.toISOString().split('T')[0]).optional(),
    tags: z.array(z.string()),
    description: z.string(),
  }),
});

export const collections = { blog };
