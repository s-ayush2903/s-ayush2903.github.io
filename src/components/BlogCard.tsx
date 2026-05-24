import type { BlogPost } from '@/lib/blog';
import { formatDate } from '@/lib/utils';
import TagBadge from './TagBadge';

interface Props {
  post: BlogPost;
  onTagClick?: (tag: string) => void;
}

export default function BlogCard({ post, onTagClick }: Props) {
  const displayDate = formatDate(post.updated || post.date);
  const label = post.updated ? 'updated' : 'posted';
  const readTime = post.readTime;

  return (
    <article className="group border-b border-border py-6 first:pt-0 last:border-b-0">
      <a href={`/posts/${post.slug}`} className="block">
        <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {post.title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{post.description}</p>
      </a>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground">
          {label} {displayDate}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          · {readTime} min read
        </span>
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map(tag => (
            <TagBadge key={tag} tag={tag} onClick={() => onTagClick?.(tag)} />
          ))}
        </div>
      </div>
    </article>
  );
}
