import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { toISODate } from './lib/dates';

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
