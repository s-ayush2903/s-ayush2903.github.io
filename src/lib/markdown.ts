import { useState, useEffect } from 'react';

// ---------------------------------------------------------------------------
// Callout preprocessor
// Converts :::tip / :::warning / :::gotcha blocks to HTML divs.
// Used by MarkdownRenderer (React runtime) — Astro pipeline uses remarkCallouts instead.
// ---------------------------------------------------------------------------

const CALLOUT_LABELS: Record<string, string> = {
  tip: '💡 Tip',
  warning: '⚠️ Warning',
  gotcha: '🚨 Gotcha',
};

export function preprocessCallouts(md: string): string {
  return md.replace(
    /:::(tip|warning|gotcha)\s*\n([\s\S]*?):::/gi,
    (_, type, content) => {
      const t = type.toLowerCase();
      /* v8 ignore next -- regex only matches keys in CALLOUT_LABELS */
      const label = CALLOUT_LABELS[t] || t;
      return `<div class="callout callout-${t}"><span class="callout-label">${label}</span>\n\n${content.trim()}\n\n</div>`;
    },
  );
}

// ---------------------------------------------------------------------------
// Dark mode hook
// Watches document.documentElement for the 'dark' class via MutationObserver.
// ---------------------------------------------------------------------------

export function useIsDark(): boolean {
  const [dark, setDark] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return dark;
}
