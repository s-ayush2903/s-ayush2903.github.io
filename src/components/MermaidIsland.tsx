import { useEffect, useRef } from 'react';
import { useIsDark } from '@/lib/markdown';

/**
 * Client-side island that finds all Shiki-rendered mermaid code blocks
 * (pre[data-language="mermaid"]) and replaces them with rendered SVGs.
 *
 * On theme toggle, re-renders existing diagrams by reading the stored
 * source from data-mermaid-source attributes on previously rendered containers.
 *
 * Renders nothing itself — purely a DOM side-effect component.
 * Mount once per blog post page with client:load.
 */
export default function MermaidIsland() {
  const isDark = useIsDark();
  const renderCount = useRef(0);

  useEffect(() => {
    let cancelled = false;

    // Unprocessed blocks (first render on page load)
    const fresh = Array.from(
      document.querySelectorAll<HTMLElement>('pre[data-language="mermaid"]'),
    );
    // Already-rendered containers (theme toggle re-render)
    const existing = Array.from(
      document.querySelectorAll<HTMLElement>('[data-mermaid-source]'),
    );

    // Build unified target list: { element to replace, diagram source }
    const targets: { element: HTMLElement; source: string }[] = [];

    for (const pre of fresh) {
      const code = pre.querySelector('code');
      if (!code) continue;
      const source = code.textContent ?? '';
      if (source) targets.push({ element: pre, source });
    }
    for (const container of existing) {
      const source = container.getAttribute('data-mermaid-source') ?? '';
      if (source) targets.push({ element: container, source });
    }

    // Bail before importing mermaid if the page has no diagrams.
    // This prevents mermaid from loading during ClientRouter transitions where
    // the island may briefly fire its effect before unmounting on a non-post page.
    if (targets.length === 0) return;

    const batch = renderCount.current++;

    import('mermaid').then(async ({ default: mermaid }) => {
      if (cancelled) return;

      // Block until IBM Plex Sans is renderable. Mermaid sizes nodes via SVG
      // getBBox() — if the swap-fallback font is active, measurements are wrong
      // and text overflows the rects once the real font loads.
      //
      // document.fonts.check() is the only authoritative signal.
      // document.fonts.load() can no-op if Vite hasn't injected the @font-face
      // yet, so we also listen for loadingdone as a fallback.
      if (document.fonts && !document.fonts.check('16px "IBM Plex Sans"')) {
        await new Promise<void>((resolve) => {
          const tid = setTimeout(resolve, 3000);
          const onDone = () => {
            if (document.fonts!.check('16px "IBM Plex Sans"')) {
              clearTimeout(tid);
              document.fonts!.removeEventListener('loadingdone', onDone);
              resolve();
            }
          };
          document.fonts!.addEventListener('loadingdone', onDone);
          document.fonts!.load('16px "IBM Plex Sans"').then(onDone).catch(onDone);
        });
      }

      if (cancelled) return;

      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'neutral',
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
      });

      targets.forEach(async ({ element, source }, i) => {
        if (cancelled) return;

        const container = document.createElement('div');
        container.className = 'my-6 flex justify-center overflow-x-auto';
        container.setAttribute('data-mermaid-source', source);

        try {
          const { svg } = await mermaid.render(
            `mermaid-island-${batch}-${i}`,
            source,
          );
          if (cancelled) return;
          container.innerHTML = svg;
          container.setAttribute('data-mermaid-source', source);
        } catch {
          if (cancelled) return;
          container.textContent = 'Failed to render diagram';
          container.setAttribute('data-mermaid-source', source);
        }

        element.replaceWith(container);
      });
    });

    return () => { cancelled = true; };
  }, [isDark]);

  return null;
}
