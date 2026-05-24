import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BlogPostMeta from '@/components/BlogPostMeta';

const baseProps = {
  title: 'Getting Started with Docker',
  date: '2024-03-15',
  tags: ['docker', 'devops'],
  readTime: 5,
};

describe('BlogPostMeta', () => {
  it('renders title', () => {
    render(<BlogPostMeta {...baseProps} />);
    expect(screen.getByText('Getting Started with Docker')).toBeInTheDocument();
  });

  it('shows reading time', () => {
    render(<BlogPostMeta {...baseProps} />);
    expect(screen.getByText(/5 min read/)).toBeInTheDocument();
  });

  it('shows tags', () => {
    render(<BlogPostMeta {...baseProps} />);
    expect(screen.getByText('docker')).toBeInTheDocument();
    expect(screen.getByText('devops')).toBeInTheDocument();
  });

  it('renders back link', () => {
    render(<BlogPostMeta {...baseProps} />);
    expect(screen.getByText('← all posts')).toBeInTheDocument();
  });

  it('renders updated date when provided', () => {
    render(<BlogPostMeta {...baseProps} updated="2024-04-01" />);
    expect(screen.getByText(/updated/)).toBeInTheDocument();
  });

  it('does not render updated span when absent', () => {
    render(<BlogPostMeta {...baseProps} />);
    expect(screen.queryByText(/updated/)).toBeNull();
  });

  it('renders date in human-readable ordinal format', () => {
    render(<BlogPostMeta {...baseProps} />);
    // date "2024-03-15" → "15th March 2024", not raw ISO
    expect(screen.getByText(/15th March 2024/)).toBeInTheDocument();
    expect(screen.queryByText('2024-03-15')).toBeNull();
  });

  it('renders updated date in human-readable ordinal format', () => {
    render(<BlogPostMeta {...baseProps} updated="2024-04-01" />);
    expect(screen.getByText(/1st April 2024/)).toBeInTheDocument();
    expect(screen.queryByText('2024-04-01')).toBeNull();
  });
});
