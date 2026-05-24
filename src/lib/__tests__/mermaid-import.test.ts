/**
 * Smoke test — imports the real mermaid library (NO mock).
 *
 * This catches dependency resolution failures like the dayjs CJS/ESM bug
 * where `import('mermaid')` silently failed at runtime because Vite
 * served dayjs.min.js (CJS) as an ES module with no default export.
 *
 * mermaid.render() won't produce valid SVG in jsdom (no SVG layout engine),
 * but the import + initialize must not throw.
 */
import { describe, it, expect } from 'vitest';

describe('mermaid library (unmocked)', () => {
  it('can be dynamically imported without error', async () => {
    const { default: mermaid } = await import('mermaid');
    expect(mermaid).toBeDefined();
    expect(typeof mermaid.initialize).toBe('function');
    expect(typeof mermaid.render).toBe('function');
  }, 15_000);

  it('can call initialize without throwing', async () => {
    const { default: mermaid } = await import('mermaid');
    expect(() => {
      mermaid.initialize({ startOnLoad: false, theme: 'neutral' });
    }).not.toThrow();
  }, 15_000);
});
