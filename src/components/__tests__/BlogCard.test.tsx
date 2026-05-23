import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BlogCard from '../BlogCard';
import type { BlogPost } from '@/lib/blog';

const mockPost: BlogPost = {
  slug: 'test-post',
  title: 'Test Post Title',
  date: '2026-01-01',
  tags: ['react', 'typescript'],
  description: 'A short description of the test post.',
  readTime: 3,
};

function renderCard(props?: Partial<{ onTagClick: (tag: string) => void }>) {
  return render(<BlogCard post={mockPost} {...props} />);
}

describe('BlogCard', () => {
  it('renders the post title', () => {
    renderCard();
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('renders the post description', () => {
    renderCard();
    expect(screen.getByText('A short description of the test post.')).toBeInTheDocument();
  });

  it('renders tags', () => {
    renderCard();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('renders reading time', () => {
    renderCard();
    expect(screen.getByText(/min read/)).toBeInTheDocument();
  });

  it('renders date with "posted" label', () => {
    renderCard();
    expect(screen.getByText(/posted 1st January 2026/)).toBeInTheDocument();
  });

  it('renders "updated" label when post has updated date', () => {
    const updated = { ...mockPost, updated: '2026-02-01' };
    render(<BlogCard post={updated} />);
    expect(screen.getByText(/updated 1st February 2026/)).toBeInTheDocument();
  });

  it('links to the correct post URL', () => {
    renderCard();
    const link = screen.getByText('Test Post Title').closest('a');
    expect(link).toHaveAttribute('href', '/blog/test-post');
  });

  it('calls onTagClick when a tag is clicked', () => {
    const handler = vi.fn();
    renderCard({ onTagClick: handler });
    fireEvent.click(screen.getByText('react'));
    expect(handler).toHaveBeenCalledWith('react');
  });
});
