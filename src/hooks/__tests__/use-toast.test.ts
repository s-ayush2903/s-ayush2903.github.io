import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { reducer } from '../use-toast';

// We need to re-import fresh module state for some tests
// First, test the reducer in isolation since it's exported

describe('use-toast reducer', () => {
  const baseToast = { id: '1', open: true, title: 'Test' } as any;

  it('ADD_TOAST adds a toast', () => {
    const state = { toasts: [] };
    const result = reducer(state, { type: 'ADD_TOAST', toast: baseToast });
    expect(result.toasts).toHaveLength(1);
    expect(result.toasts[0].id).toBe('1');
  });

  it('ADD_TOAST respects TOAST_LIMIT of 1', () => {
    const state = { toasts: [{ ...baseToast, id: 'existing' }] };
    const result = reducer(state, { type: 'ADD_TOAST', toast: { ...baseToast, id: 'new' } });
    expect(result.toasts).toHaveLength(1);
    expect(result.toasts[0].id).toBe('new');
  });

  it('UPDATE_TOAST updates matching toast', () => {
    const state = { toasts: [baseToast] };
    const result = reducer(state, { type: 'UPDATE_TOAST', toast: { id: '1', title: 'Updated' } });
    expect(result.toasts[0].title).toBe('Updated');
    expect(result.toasts[0].open).toBe(true);
  });

  it('UPDATE_TOAST does not affect non-matching toasts', () => {
    const state = { toasts: [baseToast] };
    const result = reducer(state, { type: 'UPDATE_TOAST', toast: { id: '999', title: 'Nope' } });
    expect(result.toasts[0].title).toBe('Test');
  });

  it('DISMISS_TOAST sets open to false for matching toast', () => {
    const state = { toasts: [baseToast] };
    const result = reducer(state, { type: 'DISMISS_TOAST', toastId: '1' });
    expect(result.toasts[0].open).toBe(false);
  });

  it('DISMISS_TOAST leaves non-matching toasts unchanged', () => {
    const state = { toasts: [baseToast, { ...baseToast, id: '2', open: true }] };
    const result = reducer(state, { type: 'DISMISS_TOAST', toastId: '1' });
    expect(result.toasts[0].open).toBe(false);
    expect(result.toasts[1].open).toBe(true);
  });

  it('DISMISS_TOAST without toastId dismisses all', () => {
    const state = { toasts: [baseToast, { ...baseToast, id: '2' }] };
    const result = reducer(state, { type: 'DISMISS_TOAST' });
    result.toasts.forEach(t => expect(t.open).toBe(false));
  });

  it('REMOVE_TOAST removes matching toast', () => {
    const state = { toasts: [baseToast, { ...baseToast, id: '2' }] };
    const result = reducer(state, { type: 'REMOVE_TOAST', toastId: '1' });
    expect(result.toasts).toHaveLength(1);
    expect(result.toasts[0].id).toBe('2');
  });

  it('REMOVE_TOAST without toastId removes all', () => {
    const state = { toasts: [baseToast, { ...baseToast, id: '2' }] };
    const result = reducer(state, { type: 'REMOVE_TOAST', toastId: undefined });
    expect(result.toasts).toHaveLength(0);
  });
});

describe('useToast hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('toast() creates a toast and returns id, dismiss, update', async () => {
    const { useToast, toast } = await import('../use-toast');
    const { result } = renderHook(() => useToast());

    let returned: any;
    act(() => {
      returned = toast({ title: 'Hello' });
    });

    expect(returned).toHaveProperty('id');
    expect(returned).toHaveProperty('dismiss');
    expect(returned).toHaveProperty('update');
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Hello');
    expect(result.current.toasts[0].open).toBe(true);
  });

  it('dismiss() sets toast open to false', async () => {
    const { useToast, toast } = await import('../use-toast');
    const { result } = renderHook(() => useToast());

    let returned: any;
    act(() => {
      returned = toast({ title: 'Bye' });
    });

    act(() => {
      returned.dismiss();
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it('update() modifies existing toast', async () => {
    const { useToast, toast } = await import('../use-toast');
    const { result } = renderHook(() => useToast());

    let returned: any;
    act(() => {
      returned = toast({ title: 'Original' });
    });

    act(() => {
      returned.update({ id: returned.id, title: 'Modified' } as any);
    });

    expect(result.current.toasts[0].title).toBe('Modified');
  });

  it('onOpenChange(false) triggers dismiss', async () => {
    const { useToast, toast } = await import('../use-toast');
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: 'Auto' });
    });

    const onOpenChange = result.current.toasts[0].onOpenChange;
    act(() => {
      onOpenChange?.(false);
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it('hook dismiss() without id dismisses all toasts', async () => {
    const { useToast, toast } = await import('../use-toast');
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: 'One' });
    });

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it('unsubscribes listener on unmount', async () => {
    const { useToast } = await import('../use-toast');
    const { unmount } = renderHook(() => useToast());
    unmount();
    // No error thrown — listener properly cleaned up
  });

  it('addToRemoveQueue fires and removes toast after delay', async () => {
    const { useToast, toast } = await import('../use-toast');
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: 'Temp' });
    });

    const toastId = result.current.toasts[0].id;

    // Dismiss to trigger addToRemoveQueue
    act(() => {
      result.current.dismiss(toastId);
    });

    expect(result.current.toasts[0].open).toBe(false);

    // Advance timer past TOAST_REMOVE_DELAY (1000000ms)
    act(() => {
      vi.advanceTimersByTime(1100000);
    });

    // Toast should be removed now
    expect(result.current.toasts.find(t => t.id === toastId)).toBeUndefined();
  });

  it('addToRemoveQueue is idempotent for same toastId', async () => {
    const { useToast, toast } = await import('../use-toast');
    const { result } = renderHook(() => useToast());

    act(() => {
      toast({ title: 'Idem' });
    });

    const toastId = result.current.toasts[0].id;

    // Dismiss twice — second call to addToRemoveQueue should be a no-op
    act(() => {
      result.current.dismiss(toastId);
    });
    act(() => {
      result.current.dismiss(toastId);
    });

    // Should still work fine
    act(() => {
      vi.advanceTimersByTime(1100000);
    });
    expect(result.current.toasts.find(t => t.id === toastId)).toBeUndefined();
  });
});
