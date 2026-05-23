import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../use-mobile';

let listeners: Array<(e: MediaQueryListEvent) => void> = [];

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockReturnValue({
      matches,
      addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
        listeners.push(cb);
      },
      removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
        listeners = listeners.filter(l => l !== cb);
      },
    }),
  });
}

beforeEach(() => {
  listeners = [];
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useIsMobile', () => {
  it('returns false on desktop widths', () => {
    mockMatchMedia(false);
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true on mobile widths', () => {
    mockMatchMedia(true);
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 500 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('reacts to media query change events', () => {
    mockMatchMedia(false);
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate resize to mobile
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 500 });
    act(() => {
      listeners.forEach(cb => cb({ matches: true } as MediaQueryListEvent));
    });
    expect(result.current).toBe(true);
  });

  it('cleans up event listener on unmount', () => {
    mockMatchMedia(false);
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
    const { unmount } = renderHook(() => useIsMobile());
    expect(listeners.length).toBe(1);
    unmount();
    expect(listeners.length).toBe(0);
  });
});
