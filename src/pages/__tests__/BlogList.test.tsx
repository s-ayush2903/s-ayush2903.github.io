import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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

function setWindowLocation(search: string) {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...window.location, search, href: `http://localhost/blog${search}` },
  });
}

function renderBlogList(posts: BlogPost[] = realPosts) {
  return render(<BlogListIsland posts={posts} />);
}

describe('BlogList page', () => {
  beforeEach(() => {
    // Set a valid http location so replaceState works in jsdom
    setWindowLocation('');
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { search: '', href: 'http://localhost/' },
    });
  });

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

describe('URL query param initialisation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { search: '', href: 'http://localhost/' },
    });
  });

  it('?tag=docker pre-selects docker filter', () => {
    setWindowLocation('?tag=docker');
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    renderBlogList();
    expect(screen.getByText('clear')).toBeInTheDocument();
    expect(screen.queryByText('Another Post')).not.toBeInTheDocument();
  });

  it('?tag=nonexistent shows No posts found', () => {
    setWindowLocation('?tag=nonexistent');
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    renderBlogList();
    expect(screen.getByText('No posts found.')).toBeInTheDocument();
  });

  it('no query param shows all posts', () => {
    setWindowLocation('');
    vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    renderBlogList();
    expect(screen.getByText('Getting Started with Docker')).toBeInTheDocument();
    expect(screen.getByText('Another Post')).toBeInTheDocument();
  });

  it('clicking a tag calls replaceState with ?tag=<name>', () => {
    setWindowLocation('');
    const spy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    renderBlogList();
    const dockerTag = screen.getAllByText('docker')[0];
    fireEvent.click(dockerTag);
    expect(spy).toHaveBeenCalled();
    const calledUrl = spy.mock.calls[spy.mock.calls.length - 1][2] as string;
    expect(calledUrl).toContain('?tag=docker');
  });

  it('clearing tag calls replaceState without tag param', () => {
    setWindowLocation('');
    const spy = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    renderBlogList();
    const dockerTag = screen.getAllByText('docker')[0];
    fireEvent.click(dockerTag);
    fireEvent.click(screen.getByText('clear'));
    const lastCall = spy.mock.calls[spy.mock.calls.length - 1][2] as string;
    expect(lastCall).not.toContain('tag=');
  });
});
