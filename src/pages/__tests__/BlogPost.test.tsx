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
});
