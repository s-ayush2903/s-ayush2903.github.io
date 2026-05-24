import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, renderHook } from '@testing-library/react';
import MarkdownRenderer, { preprocessCallouts, useIsDark } from '../MarkdownRenderer';

// Mock mermaid
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg>mock</svg>' }),
  },
}));

// Mock syntax highlighter to expose the actual code text it receives
vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children, language }: any) => (
    <pre data-testid="syntax-highlighter" data-language={language}>
      <code>{children}</code>
    </pre>
  ),
}));

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneLight: {},
  oneDark: {},
}));

// Mock clipboard
beforeEach(() => {
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

describe('MarkdownRenderer', () => {
  it('renders plain text', () => {
    render(<MarkdownRenderer content="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders headings', () => {
    render(<MarkdownRenderer content="## My Heading" />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('My Heading');
  });

  it('renders inline code without backticks', () => {
    render(<MarkdownRenderer content="Use `docker ps` to list containers" />);
    const code = screen.getByText('docker ps');
    expect(code.tagName).toBe('CODE');
    expect(code.textContent).not.toContain('`');
  });

  it('renders fenced code blocks with syntax highlighting', async () => {
    const md = '```javascript\nconsole.log("hi");\n```';
    render(<MarkdownRenderer content={md} />);
    await waitFor(() => {
      expect(screen.getByTestId('syntax-highlighter')).toBeInTheDocument();
      expect(screen.getByTestId('syntax-highlighter')).toHaveAttribute('data-language', 'javascript');
    });
  });

  it('does NOT render backticks in fenced code blocks', async () => {
    const md = '```yaml\nversion: "3.8"\n```';
    render(<MarkdownRenderer content={md} />);
    await waitFor(() => {
      const highlighter = screen.getByTestId('syntax-highlighter');
      expect(highlighter.textContent).not.toContain('```');
      expect(highlighter.textContent).not.toContain('`');
    });
  });

  it('does NOT render backticks in typescript code blocks', async () => {
    const md = '```typescript\nfunction first<T>(arr: T[]): T | undefined {\n  return arr[0];\n}\n```';
    render(<MarkdownRenderer content={md} />);
    await waitFor(() => {
      const highlighter = screen.getByTestId('syntax-highlighter');
      const text = highlighter.textContent || '';
      expect(text).not.toContain('```');
      expect(text).not.toMatch(/^`/);
      expect(text).not.toMatch(/`$/);
      expect(text).toContain('function first');
    });
  });

  it('does NOT render backticks in dockerfile code blocks', async () => {
    const md = '```dockerfile\nFROM node:20-alpine\nWORKDIR /app\n```';
    render(<MarkdownRenderer content={md} />);
    await waitFor(() => {
      const highlighter = screen.getByTestId('syntax-highlighter');
      const text = highlighter.textContent || '';
      expect(text).not.toContain('`');
      expect(text).toContain('FROM node:20-alpine');
    });
  });

  it('code block content has no leading or trailing backtick characters', async () => {
    const md = '```python\nprint("hello")\n```';
    render(<MarkdownRenderer content={md} />);
    await waitFor(() => {
      const highlighter = screen.getByTestId('syntax-highlighter');
      const text = highlighter.textContent || '';
      // Must not start or end with backtick
      expect(text.charAt(0)).not.toBe('`');
      expect(text.charAt(text.length - 1)).not.toBe('`');
    });
  });

  it('renders a copy button on code blocks', async () => {
    const md = '```bash\necho hello\n```';
    render(<MarkdownRenderer content={md} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Copy code')).toBeInTheDocument();
    });
  });

  it('copy button copies code to clipboard', async () => {
    const md = '```bash\necho hello\n```';
    render(<MarkdownRenderer content={md} />);
    await waitFor(() => {
      const btn = screen.getByLabelText('Copy code');
      fireEvent.click(btn);
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('echo hello');
  });

  it('renders tip callout', () => {
    const md = ':::tip\nThis is a tip\n:::';
    render(<MarkdownRenderer content={md} />);
    expect(screen.getByText('💡 Tip')).toBeInTheDocument();
    expect(screen.getByText('This is a tip')).toBeInTheDocument();
  });

  it('renders warning callout', () => {
    const md = ':::warning\nBe careful\n:::';
    render(<MarkdownRenderer content={md} />);
    expect(screen.getByText('⚠️ Warning')).toBeInTheDocument();
  });

  it('renders gotcha callout', () => {
    const md = ':::gotcha\nWatch out\n:::';
    render(<MarkdownRenderer content={md} />);
    expect(screen.getByText('🚨 Gotcha')).toBeInTheDocument();
  });

  it('renders tables', () => {
    const md = '| Col A | Col B |\n|-------|-------|\n| 1 | 2 |';
    render(<MarkdownRenderer content={md} />);
    expect(screen.getByText('Col A')).toBeInTheDocument();
    expect(screen.getByText('Col B')).toBeInTheDocument();
  });

  it('renders links', () => {
    const md = '[click me](https://example.com)';
    render(<MarkdownRenderer content={md} />);
    const link = screen.getByText('click me');
    expect(link.closest('a')).toHaveAttribute('href', 'https://example.com');
  });

  it('renders bold and italic', () => {
    render(<MarkdownRenderer content="**bold** and *italic*" />);
    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('italic')).toBeInTheDocument();
  });

  it('renders lists', () => {
    const md = '- item one\n- item two';
    render(<MarkdownRenderer content={md} />);
    expect(screen.getByText('item one')).toBeInTheDocument();
    expect(screen.getByText('item two')).toBeInTheDocument();
  });

  it('renders mermaid code blocks', async () => {
    const md = '```mermaid\ngraph TD;\nA-->B;\n```';
    render(<MarkdownRenderer content={md} />);
    await waitFor(() => {
      const container = document.querySelector('.my-6.flex.justify-center');
      expect(container).toBeInTheDocument();
    });
  });

  it('renders mermaid code blocks with dark theme when dark class is set', async () => {
    document.documentElement.classList.add('dark');
    const md = '```mermaid\ngraph TD;\nA-->B;\n```';
    render(<MarkdownRenderer content={md} />);
    await waitFor(() => {
      const container = document.querySelector('.my-6.flex.justify-center');
      expect(container).toBeInTheDocument();
    });
    document.documentElement.classList.remove('dark');
  });

  it('renders mermaid error fallback on failure', async () => {
    const mermaid = await import('mermaid');
    vi.mocked(mermaid.default.render).mockRejectedValueOnce(new Error('parse error'));

    const md = '```mermaid\ninvalid diagram\n```';
    render(<MarkdownRenderer content={md} />);
    await waitFor(() => {
      expect(screen.getByText('Failed to render diagram')).toBeInTheDocument();
    });
  });

  it('renders plain pre for language-less fenced code blocks', async () => {
    const md = '```\nplain code here\n```';
    render(<MarkdownRenderer content={md} />);
    await waitFor(() => {
      expect(screen.getByText('plain code here')).toBeInTheDocument();
      const wrapper = document.querySelector('.code-block-wrapper');
      expect(wrapper).toBeInTheDocument();
    });
  });

  it('renders copy button on language-less fenced code blocks', async () => {
    const md = '```\nsome code\n```';
    render(<MarkdownRenderer content={md} />);
    await waitFor(() => {
      expect(screen.getByLabelText('Copy code')).toBeInTheDocument();
    });
  });

  it('copy button shows "Copied" after click', async () => {
    const md = '```bash\necho hi\n```';
    render(<MarkdownRenderer content={md} />);
    await waitFor(() => {
      fireEvent.click(screen.getByLabelText('Copy code'));
    });
    await waitFor(() => {
      expect(screen.getByLabelText('Copied')).toBeInTheDocument();
    });
  });

  it('renders inline code with inline-code class', () => {
    render(<MarkdownRenderer content="Use `myVar` in code" />);
    const code = screen.getByText('myVar');
    expect(code.tagName).toBe('CODE');
    expect(code.className).toContain('inline-code');
  });

  it('renders raw HTML code element with className (L164)', () => {
    const md = '<code class="custom-lang">raw code</code>';
    render(<MarkdownRenderer content={md} />);
    const code = screen.getByText('raw code');
    expect(code.tagName).toBe('CODE');
    expect(code.className).toContain('custom-lang');
  });

  it('renders raw HTML pre without code child (bare pre fallback)', () => {
    const md = '<pre>bare pre text</pre>';
    render(<MarkdownRenderer content={md} />);
    expect(screen.getByText('bare pre text')).toBeInTheDocument();
  });

  it('renders code block with dark theme style when dark class is set', async () => {
    document.documentElement.classList.add('dark');
    const md = '```javascript\nconst x = 1;\n```';
    render(<MarkdownRenderer content={md} />);
    await waitFor(() => {
      expect(screen.getByTestId('syntax-highlighter')).toBeInTheDocument();
    });
    document.documentElement.classList.remove('dark');
  });
});

describe('preprocessCallouts', () => {
  it('converts tip callout syntax', () => {
    const result = preprocessCallouts(':::tip\nHello\n:::');
    expect(result).toContain('callout-tip');
    expect(result).toContain('💡 Tip');
    expect(result).toContain('Hello');
  });

  it('converts warning callout syntax', () => {
    const result = preprocessCallouts(':::warning\nCareful\n:::');
    expect(result).toContain('callout-warning');
    expect(result).toContain('⚠️ Warning');
  });

  it('converts gotcha callout syntax', () => {
    const result = preprocessCallouts(':::gotcha\nWatch out\n:::');
    expect(result).toContain('callout-gotcha');
    expect(result).toContain('🚨 Gotcha');
  });

  it('is case-insensitive', () => {
    const result = preprocessCallouts(':::TIP\nUpper\n:::');
    expect(result).toContain('callout-tip');
  });

  it('passes through text without callouts unchanged', () => {
    const input = 'Just normal markdown';
    expect(preprocessCallouts(input)).toBe(input);
  });
});

describe('useIsDark', () => {
  it('returns false when dark class is absent', () => {
    document.documentElement.classList.remove('dark');
    const { result } = renderHook(() => useIsDark());
    expect(result.current).toBe(false);
  });

  it('returns true when dark class is present', () => {
    document.documentElement.classList.add('dark');
    const { result } = renderHook(() => useIsDark());
    expect(result.current).toBe(true);
    document.documentElement.classList.remove('dark');
  });

  it('reacts to class mutations on documentElement', async () => {
    document.documentElement.classList.remove('dark');
    const { result } = renderHook(() => useIsDark());
    expect(result.current).toBe(false);

    act(() => {
      document.documentElement.classList.add('dark');
    });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    act(() => {
      document.documentElement.classList.remove('dark');
    });

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });
});
