import { describe, it, expect } from 'vitest';
import { toISODate } from '../dates';

describe('toISODate', () => {
  it('converts a Date object to YYYY-MM-DD', () => {
    expect(toISODate(new Date('2026-01-25T00:00:00Z'))).toBe('2026-01-25');
  });

  it('passes through a standard ISO string', () => {
    expect(toISODate('2026-01-25')).toBe('2026-01-25');
  });

  it('strips "st" ordinal suffix', () => {
    expect(toISODate('1st January 2025')).toBe('2025-01-01');
  });

  it('strips "nd" ordinal suffix', () => {
    expect(toISODate('2nd March 2026')).toBe('2026-03-02');
  });

  it('strips "rd" ordinal suffix', () => {
    expect(toISODate('3rd June 2026')).toBe('2026-06-03');
  });

  it('strips "th" ordinal suffix', () => {
    expect(toISODate('25th January 2025')).toBe('2025-01-25');
  });

  it('handles ordinal with time part (time is discarded)', () => {
    expect(toISODate('25th January 2025 04:12:00')).toBe('2025-01-25');
  });

  it('throws on invalid date string', () => {
    expect(() => toISODate('not-a-date')).toThrow('Cannot parse date');
  });

  it('throws on non-string/non-Date input', () => {
    expect(() => toISODate(12345)).toThrow('Expected a date string or Date object');
    expect(() => toISODate(true)).toThrow('Expected a date string or Date object');
  });

  it('throws on null', () => {
    expect(() => toISODate(null)).toThrow();
  });

  it('throws on undefined', () => {
    expect(() => toISODate(undefined)).toThrow();
  });
});
