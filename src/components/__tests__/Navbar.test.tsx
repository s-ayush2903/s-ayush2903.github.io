import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../Navbar';

beforeEach(() => {
  document.documentElement.classList.remove('dark');
  localStorage.clear();
});

function renderNavbar(pathname = '/') {
  return render(<Navbar pathname={pathname} />);
}

describe('Navbar', () => {
  it('renders the site title', () => {
    renderNavbar();
    expect(screen.getByText('~/dev')).toBeInTheDocument();
  });

  it('renders about and blog links', () => {
    renderNavbar();
    expect(screen.getByText('about')).toBeInTheDocument();
    expect(screen.getByText('blog')).toBeInTheDocument();
  });

  it('renders a theme toggle button', () => {
    renderNavbar();
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
  });

  it('toggles dark mode on button click', () => {
    renderNavbar();
    const btn = screen.getByLabelText('Toggle theme');
    fireEvent.click(btn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    fireEvent.click(btn);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persists theme to localStorage', () => {
    renderNavbar();
    const btn = screen.getByLabelText('Toggle theme');
    fireEvent.click(btn);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('highlights about link on home route', () => {
    renderNavbar('/');
    const aboutLink = screen.getByText('about');
    expect(aboutLink.className).toContain('text-primary');
    expect(aboutLink.className).toContain('font-semibold');
  });

  it('highlights blog link on blog route', () => {
    renderNavbar('/blog');
    const blogLink = screen.getByText('blog');
    expect(blogLink.className).toContain('text-primary');
  });
});
