import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import MermaidIsland from '../MermaidIsland';

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg id="mock">mock</svg>' }),
  },
}));

function addMermaidBlock(code = 'graph TD;\nA-->B;') {
  const pre = document.createElement('pre');
  pre.setAttribute('data-language', 'mermaid');
  const codeEl = document.createElement('code');
  codeEl.textContent = code;
  pre.appendChild(codeEl);
  document.body.appendChild(pre);
  return pre;
}

beforeEach(() => {
  document.documentElement.classList.remove('dark');
});

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  document.documentElement.classList.remove('dark');
});

describe('MermaidIsland', () => {
  it('replaces mermaid pre element with rendered SVG container', async () => {
    addMermaidBlock();
    render(<MermaidIsland />);

    await waitFor(() => {
      expect(document.querySelector('pre[data-language="mermaid"]')).toBeNull();
      expect(document.querySelector('.my-6.flex.justify-center')).toBeInTheDocument();
    });
  });

  it('shows error fallback when mermaid.render throws', async () => {
    addMermaidBlock();
    const mermaidMod = await import('mermaid');
    vi.mocked(mermaidMod.default.render).mockRejectedValueOnce(new Error('parse error'));

    render(<MermaidIsland />);

    await waitFor(() => {
      expect(document.querySelector('pre[data-language="mermaid"]')).toBeNull();
      const fallback = document.querySelector('.my-6.flex.justify-center');
      expect(fallback?.textContent).toBe('Failed to render diagram');
    });
  });

  it('initializes mermaid with dark theme when dark class is set', async () => {
    document.documentElement.classList.add('dark');
    addMermaidBlock();
    const mermaidMod = await import('mermaid');

    render(<MermaidIsland />);

    await waitFor(() => {
      expect(mermaidMod.default.initialize).toHaveBeenCalledWith(
        expect.objectContaining({ theme: 'dark' }),
      );
    });
  });

  it('passes page fontFamily to mermaid.initialize', async () => {
    addMermaidBlock();
    const mermaidMod = await import('mermaid');

    render(<MermaidIsland />);

    await waitFor(() => {
      expect(mermaidMod.default.initialize).toHaveBeenCalledWith(
        expect.objectContaining({
          fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        }),
      );
    });
  });

  it('re-renders diagrams on theme toggle without page reload', async () => {
    addMermaidBlock();
    const mermaidMod = await import('mermaid');

    const { rerender } = render(<MermaidIsland />);

    // Wait for first render to complete (light mode)
    await waitFor(() => {
      expect(document.querySelector('pre[data-language="mermaid"]')).toBeNull();
      const container = document.querySelector('[data-mermaid-source]');
      expect(container).toBeInTheDocument();
    });

    // Reset mock call history so we can assert the next initialize call
    vi.mocked(mermaidMod.default.initialize).mockClear();
    vi.mocked(mermaidMod.default.render).mockClear();

    // Toggle to dark mode — MutationObserver in useIsDark fires, isDark changes
    document.documentElement.classList.add('dark');
    rerender(<MermaidIsland />);

    await waitFor(() => {
      expect(mermaidMod.default.initialize).toHaveBeenCalledWith(
        expect.objectContaining({ theme: 'dark' }),
      );
      expect(mermaidMod.default.render).toHaveBeenCalled();
    });

    // Container still present with data-mermaid-source for subsequent toggles
    expect(document.querySelector('[data-mermaid-source]')).toBeInTheDocument();
  });

  it('renders null — mounts no visible DOM node itself', () => {
    const { container } = render(<MermaidIsland />);
    expect(container.firstChild).toBeNull();
  });

  it('replaces multiple mermaid blocks on the same page', async () => {
    addMermaidBlock('graph TD;\nA-->B;');
    addMermaidBlock('graph LR;\nC-->D;');
    render(<MermaidIsland />);

    await waitFor(() => {
      expect(document.querySelectorAll('pre[data-language="mermaid"]')).toHaveLength(0);
      expect(document.querySelectorAll('.my-6.flex.justify-center')).toHaveLength(2);
    });
  });

  it('skips pre block with empty code element', async () => {
    // Add one valid and one empty
    addMermaidBlock('graph TD;\nA-->B;');
    const emptyPre = document.createElement('pre');
    emptyPre.setAttribute('data-language', 'mermaid');
    emptyPre.appendChild(document.createElement('code')); // empty code
    document.body.appendChild(emptyPre);

    render(<MermaidIsland />);

    await waitFor(() => {
      // Only the valid block gets replaced
      const containers = document.querySelectorAll('.my-6.flex.justify-center');
      expect(containers).toHaveLength(1);
    });
    // The empty pre stays in the DOM (skipped)
    expect(document.querySelectorAll('pre[data-language="mermaid"]')).toHaveLength(1);
  });

  it('preserves data-mermaid-source attribute with original source', async () => {
    const source = 'graph TD;\nA-->B;';
    addMermaidBlock(source);
    render(<MermaidIsland />);

    await waitFor(() => {
      const container = document.querySelector('[data-mermaid-source]');
      expect(container).toBeInTheDocument();
      expect(container!.getAttribute('data-mermaid-source')).toBe(source);
    });
  });

  it('does not mutate DOM after unmount (cancelled effect)', async () => {
    addMermaidBlock('graph TD;\nA-->B;');
    const { unmount } = render(<MermaidIsland />);
    // Unmount immediately before mermaid.render resolves
    unmount();

    // Wait a tick for any pending promises
    await new Promise(r => setTimeout(r, 50));

    // The pre should still be in the DOM (never replaced because cancelled)
    expect(document.querySelectorAll('pre[data-language="mermaid"]')).toHaveLength(1);
    expect(document.querySelectorAll('[data-mermaid-source]')).toHaveLength(0);
  });
});
