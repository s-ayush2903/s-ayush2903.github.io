import { formatDate } from '@/lib/utils';
import TagBadge from './TagBadge';

interface Props {
  title: string;
  date: string;
  updated?: string;
  tags: string[];
  readTime: number;
}

export default function BlogPostMeta({ title, date, updated, tags, readTime }: Props) {
  return (
    <>
      <a
        href="/blog"
        className="font-mono text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        ← all posts
      </a>

      <header className="mt-6 mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">posted {formatDate(date)}</span>
          {updated && (
            <span className="font-mono text-xs text-muted-foreground">· updated {formatDate(updated)}</span>
          )}
          <span className="font-mono text-xs text-muted-foreground">· {readTime} min read</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <a key={tag} href={`/blog?tag=${tag}`}>
              <TagBadge tag={tag} />
            </a>
          ))}
        </div>
      </header>
    </>
  );
}
