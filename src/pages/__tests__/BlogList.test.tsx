import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BlogListIsland from '@/components/BlogListIsland';
import type { BlogPost } from '@/lib/blog';

// Inline fixture — no dependency on getAllPosts/import.meta.glob
const realPosts: BlogPost[] = [
  {
    slug: 'getting-started-with-docker',
    title: 'Getting Started with Docker',
    date: '2024-03-15',
    updated: '2024-04-01',
    tags: ['docker', 'devops'],
    description: 'A practical intro to Docker for developers.',
    readTime: 1,
  },
  {
    slug: 'another-post',
    title: 'Another Post',
    date: '2024-01-01',
    tags: ['general'],
    description: 'Another post description.',
    readTime: 1,
  },
];

function renderBlogList(posts: BlogPost[] = realPosts) {
  return render(<BlogListIsland posts={posts} />);
}

describe('BlogList page', () => {
  it('renders the Blog heading', () => {
    renderBlogList();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Blog');
  });

  it('renders blog post cards', () => {
    renderBlogList();
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
  });

  it('renders tag filter buttons', () => {
    renderBlogList();
    expect(screen.getByText('Tags:')).toBeInTheDocument();
  });

  it('renders sort buttons', () => {
    renderBlogList();
    expect(screen.getByText('newest')).toBeInTheDocument();
    expect(screen.getByText('oldest')).toBeInTheDocument();
  });

  it('filters by tag when clicked', () => {
    renderBlogList();
    const dockerTag = screen.getAllByText('docker')[0];
    fireEvent.click(dockerTag);
    expect(screen.getByText('clear')).toBeInTheDocument();
  });

  it('clears tag filter', () => {
    renderBlogList();
    const dockerTag = screen.getAllByText('docker')[0];
    fireEvent.click(dockerTag);
    fireEvent.click(screen.getByText('clear'));
    expect(screen.queryByText('clear')).not.toBeInTheDocument();
  });

  it('sorts posts by oldest when oldest button is clicked', () => {
    renderBlogList();
    const oldestBtn = screen.getByText('oldest');
    fireEvent.click(oldestBtn);
    expect(oldestBtn.className).toContain('font-semibold');
  });

  it('toggles tag off when clicking the same tag twice', () => {
    renderBlogList();
    const dockerTag = screen.getAllByText('docker')[0];
    fireEvent.click(dockerTag);
    expect(screen.getByText('clear')).toBeInTheDocument();
    fireEvent.click(dockerTag);
    expect(screen.queryByText('clear')).not.toBeInTheDocument();
  });

  it('shows "No posts found" when no posts are passed', () => {
    render(<BlogListIsland posts={[]} />);
    expect(screen.getByText('No posts found.')).toBeInTheDocument();
  });
});
