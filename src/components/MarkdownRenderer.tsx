import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { useEffect, useRef, useId, useState, useCallback } from 'react'; // useState still needed by CopyButton/MermaidBlock
import mermaid from 'mermaid';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Re-export so existing test imports continue to work without file changes
export { preprocessCallouts, useIsDark } from '@/lib/markdown';
import { preprocessCallouts, useIsDark } from '@/lib/markdown';

function MermaidBlock({ code, isDark }: { code: string; isDark: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, '_');

  useEffect(() => {
    let cancelled = false;
    mermaid.initialize({ startOnLoad: false, theme: isDark ? 'dark' : 'neutral' });
    mermaid.render(`mermaid${id}`, code).then(({ svg }) => {
      if (!cancelled && ref.current) ref.current.innerHTML = svg;
    }).catch(() => {
      if (!cancelled && ref.current) ref.current.textContent = 'Failed to render diagram';
    });
    return () => { cancelled = true; };
  }, [code, id, isDark]);

  return <div ref={ref} className="my-6 flex justify-center overflow-x-auto" />;
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <button
      onClick={handleCopy}
      className="copy-code-button"
      aria-label={copied ? 'Copied' : 'Copy code'}
      title={copied ? 'Copied!' : 'Copy code'}
    >
      {copied
        ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
      }
    </button>
  );
}

interface Props {
  content: string;
}

export default function MarkdownRenderer({ content }: Props) {
  const processed = preprocessCallouts(content);
  const isDark = useIsDark();

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          pre({ children, node, ...props }) {
            const child = children as any;
            const className = child?.props?.className || '';
            
            // react-markdown may pass children as array or string
            let rawChildren = child?.props?.children;
            let codeText: string;
            /* v8 ignore next 6 -- rawChildren is always a string in react-markdown v9 */
            if (Array.isArray(rawChildren)) {
              codeText = rawChildren
                .map((c: any) => String(c))
                .join('')
                .replace(/\n$/, '');
            } else {
              codeText = String(rawChildren || '').replace(/\n$/, '');
            }

            if (className.includes('language-mermaid')) {
              return <MermaidBlock code={codeText} isDark={isDark} />;
            }

            const lang = className.startsWith('language-') ? className.replace('language-', '') : '';
            if (lang && codeText) {
              return (
                <div className="code-block-wrapper">
                  <CopyButton code={codeText} />
                  <SyntaxHighlighter
                    style={isDark ? oneDark : oneLight}
                    language={lang}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    {codeText}
                  </SyntaxHighlighter>
                </div>
              );
            }

            // Plain pre without language
            if (codeText) {
              return (
                <div className="code-block-wrapper">
                  <CopyButton code={codeText} />
                  <pre className="bg-card border border-border rounded-lg overflow-x-auto p-4" {...props}>
                    <code>{codeText}</code>
                  </pre>
                </div>
              );
            }

            return <pre {...props}>{children}</pre>;
          },
          code({ className, children, ...props }: any) {
            if (!className) {
              return (
                <code className="inline-code" {...props}>
                  {children}
                </code>
              );
            }
            return <code className={className} {...props}>{children}</code>;
          },
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
