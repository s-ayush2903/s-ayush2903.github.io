import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../Navbar';

beforeEach(() => {
  document.documentElement.classList.remove('dark');
  document.documentElement.removeAttribute('data-theme');
  localStorage.clear();
});

function renderNavbar(pathname = '/') {
  return render(<Navbar pathname={pathname} />);
}

describe('Navbar', () => {
  it('renders the site title', () => {
    renderNavbar();
    expect(screen.getByText('systems & code')).toBeInTheDocument();
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

  it('renders the palette select with Default selected', () => {
    renderNavbar();
    const select = screen.getByLabelText('Select colour theme') as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.value).toBe('default');
  });

  it('sets data-theme attribute when palette changes', () => {
    renderNavbar();
    const select = screen.getByLabelText('Select colour theme');
    fireEvent.change(select, { target: { value: 'rose-pine' } });
    expect(document.documentElement.getAttribute('data-theme')).toBe('rose-pine');
  });

  it('persists palette choice to localStorage', () => {
    renderNavbar();
    const select = screen.getByLabelText('Select colour theme');
    fireEvent.change(select, { target: { value: 'nord' } });
    expect(localStorage.getItem('palette')).toBe('nord');
  });

  it('removes data-theme when palette reset to default', () => {
    renderNavbar();
    const select = screen.getByLabelText('Select colour theme');
    fireEvent.change(select, { target: { value: 'gruvbox' } });
    fireEvent.change(select, { target: { value: 'default' } });
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('restores palette from localStorage on mount', () => {
    localStorage.setItem('palette', 'nord');
    renderNavbar();
    const select = screen.getByLabelText('Select colour theme') as HTMLSelectElement;
    expect(select.value).toBe('nord');
    expect(document.documentElement.getAttribute('data-theme')).toBe('nord');
  });

  it('restores dark mode from localStorage on mount', () => {
    localStorage.setItem('theme', 'dark');
    renderNavbar();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('dark mode and palette coexist correctly', () => {
    renderNavbar();
    const btn = screen.getByLabelText('Toggle theme');
    const select = screen.getByLabelText('Select colour theme');
    fireEvent.change(select, { target: { value: 'rose-pine' } });
    fireEvent.click(btn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('rose-pine');
  });

  it('renders all five palette options', () => {
    renderNavbar();
    const select = screen.getByLabelText('Select colour theme') as HTMLSelectElement;
    const options = Array.from(select.options).map(o => o.value);
    expect(options).toEqual(['default', 'rose-pine', 'gruvbox', 'nord', 'one-dark']);
  });

  it('renders human-readable palette labels', () => {
    renderNavbar();
    const select = screen.getByLabelText('Select colour theme') as HTMLSelectElement;
    const labels = Array.from(select.options).map(o => o.text);
    expect(labels).toEqual(['Default', 'Rosé Pine', 'Gruvbox', 'Nord', 'One Dark Pro']);
  });
});
