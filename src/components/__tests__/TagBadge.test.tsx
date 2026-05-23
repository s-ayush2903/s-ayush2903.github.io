import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TagBadge from '../TagBadge';

describe('TagBadge', () => {
  it('renders the tag text', () => {
    render(<TagBadge tag="docker" />);
    expect(screen.getByText('docker')).toBeInTheDocument();
  });

  it('applies active styles when active', () => {
    render(<TagBadge tag="react" active />);
    const btn = screen.getByText('react');
    expect(btn.className).toContain('bg-primary');
    expect(btn.className).toContain('text-primary-foreground');
  });

  it('applies inactive styles when not active', () => {
    render(<TagBadge tag="react" />);
    const btn = screen.getByText('react');
    expect(btn.className).toContain('bg-secondary');
    expect(btn.className).toContain('text-muted-foreground');
  });

  it('calls onClick when clicked', () => {
    const handler = vi.fn();
    render(<TagBadge tag="ts" onClick={handler} />);
    fireEvent.click(screen.getByText('ts'));
    expect(handler).toHaveBeenCalledOnce();
  });
});
