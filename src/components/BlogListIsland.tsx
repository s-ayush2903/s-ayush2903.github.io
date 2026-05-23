import { useState, useMemo } from 'react';
import type { BlogPost } from '@/lib/blog';
import BlogCard from '@/components/BlogCard';
import TagBadge from '@/components/TagBadge';

type SortBy = 'newest' | 'oldest';

interface Props {
  posts: BlogPost[];
}

export default function BlogListIsland({ posts }: Props) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('newest');

  const allTags = useMemo(
    () => [...new Set(posts.flatMap(p => p.tags))].sort(),
    [posts],
  );

  const filtered = useMemo(() => {
    let result = activeTag ? posts.filter(p => p.tags.includes(activeTag)) : posts;
    if (sortBy === 'oldest') result = [...result].reverse();
    return result;
  }, [posts, activeTag, sortBy]);

  const toggleTag = (tag: string) => {
    setActiveTag(prev => (prev === tag ? null : tag));
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Blog</h1>
      <p className="mt-2 text-muted-foreground">
        Thoughts on software, systems, and the things I'm learning.
      </p>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Tags:</span>
        {allTags.map(tag => (
          <TagBadge
            key={tag}
            tag={tag}
            active={activeTag === tag}
            onClick={() => toggleTag(tag)}
          />
        ))}
        {activeTag && (
          <button
            onClick={() => setActiveTag(null)}
            className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            clear
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="mt-4 flex items-center gap-2">
        <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Sort:</span>
        {(['newest', 'oldest'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`font-mono text-xs transition-colors ${
              sortBy === s
                ? 'text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div className="mt-8">
        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm">No posts found.</p>
        ) : (
          filtered.map(post => (
            <BlogCard key={post.slug} post={post} onTagClick={toggleTag} />
          ))
        )}
      </div>
    </main>
  );
}
