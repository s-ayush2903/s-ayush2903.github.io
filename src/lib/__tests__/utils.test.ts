import { describe, it, expect } from 'vitest';
import { cn, formatDate } from '../utils';

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('merges tailwind conflicts correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('handles undefined and null', () => {
    expect(cn('a', undefined, null, 'b')).toBe('a b');
  });
});

describe('formatDate', () => {
  it('formats ISO date with 1st ordinal', () => {
    expect(formatDate('2026-01-01')).toBe('1st January 2026');
  });

  it('formats 2nd ordinal', () => {
    expect(formatDate('2026-03-02')).toBe('2nd March 2026');
  });

  it('formats 3rd ordinal', () => {
    expect(formatDate('2026-06-03')).toBe('3rd June 2026');
  });

  it('formats 4th–20th ordinals (th suffix)', () => {
    expect(formatDate('2026-07-11')).toBe('11th July 2026');
    expect(formatDate('2026-07-12')).toBe('12th July 2026');
    expect(formatDate('2026-07-13')).toBe('13th July 2026');
    expect(formatDate('2026-08-04')).toBe('4th August 2026');
  });

  it('formats 21st, 22nd, 23rd ordinals', () => {
    expect(formatDate('2026-05-21')).toBe('21st May 2026');
    expect(formatDate('2026-05-22')).toBe('22nd May 2026');
    expect(formatDate('2026-05-23')).toBe('23rd May 2026');
  });

  it('handles leap year date', () => {
    expect(formatDate('2024-02-29')).toBe('29th February 2024');
  });

  it('handles end-of-year date', () => {
    expect(formatDate('2025-12-31')).toBe('31st December 2025');
  });
});
