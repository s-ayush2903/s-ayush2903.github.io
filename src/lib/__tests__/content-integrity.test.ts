// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { toISODate } from '../dates';

const BLOG_DIR = resolve(__dirname, '../../content/blog');

function parseFrontmatter(raw: string): Record<string, unknown> {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const result: Record<string, unknown> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      result[key] = val
        .slice(1, -1)
        .split(',')
        .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
    } else {
      result[key] = val.replace(/^['"]|['"]$/g, '');
    }
  }
  return result;
}

const posts = readdirSync(BLOG_DIR)
  .filter(f => f.endsWith('.md'))
  .map(file => ({ file, fm: parseFrontmatter(readFileSync(join(BLOG_DIR, file), 'utf-8')) }));

describe('content integrity', () => {
  it('finds at least one blog post', () => {
    expect(posts.length).toBeGreaterThan(0);
  });

  for (const { file, fm } of posts) {
    describe(file, () => {
      it('has a non-empty title', () => {
        expect(typeof fm.title).toBe('string');
        expect((fm.title as string).trim()).not.toBe('');
      });

      it('has a parseable date that normalises to YYYY-MM-DD', () => {
        expect(() => toISODate(fm.date)).not.toThrow();
        expect(toISODate(fm.date)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });

      it('has at least one non-empty tag', () => {
        const tags = fm.tags as string[];
        expect(Array.isArray(tags)).toBe(true);
        expect(tags.length).toBeGreaterThan(0);
        tags.forEach(t => expect(t.trim()).not.toBe(''));
      });

      it('description is a string when present', () => {
        if (fm.description !== undefined && fm.description !== '') {
          expect(typeof fm.description).toBe('string');
        }
      });
    });
  }
});
