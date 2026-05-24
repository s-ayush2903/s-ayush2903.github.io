import { describe, it, expect } from 'vitest';
import { getReadingTime } from '../blog';

describe('blog utilities', () => {
  describe('getReadingTime', () => {
    it('returns 1 for very short content', () => {
      expect(getReadingTime('hello')).toBe(1);
    });

    it('calculates reading time based on word count', () => {
      const words = new Array(460).fill('word').join(' ');
      expect(getReadingTime(words)).toBe(2);
    });

    it('rounds up', () => {
      const words = new Array(231).fill('word').join(' ');
      expect(getReadingTime(words)).toBe(2);
    });

    it('returns 1 for empty string', () => {
      expect(getReadingTime('')).toBe(1);
    });

    it('returns 1 for whitespace-only string', () => {
      expect(getReadingTime('   \n\t  ')).toBe(1);
    });

    it('handles very long content correctly', () => {
      const words = new Array(10000).fill('word').join(' ');
      // 10000 / 230 ≈ 43.48 → 44
      expect(getReadingTime(words)).toBe(44);
    });
  });
});
