import { useEffect, useState } from 'react';

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  );
}

function useTheme() {
  const [dark, setDark] = useState(() => {
    /* v8 ignore next -- SSR guard, never reached in jsdom */
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return { dark, toggle: () => setDark(d => !d) };
}

interface Props {
  pathname: string;
}

export default function Navbar({ pathname }: Props) {
  const { dark, toggle } = useTheme();

  const linkClass = (href: string) => {
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
    return `font-mono text-sm transition-colors hover:text-primary ${
      active ? 'text-primary font-semibold' : 'text-muted-foreground'
    }`;
  };

  return (
    <header className="border-b border-border">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <a href="/" className="font-mono text-base font-semibold text-foreground tracking-tight">
          ~/dev
        </a>
        <div className="flex items-center gap-6">
          <a href="/" className={linkClass('/')}>about</a>
          <a href="/blog" className={linkClass('/blog')}>blog</a>
          <button
            onClick={toggle}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </nav>
    </header>
  );
}
