import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');

  const sorted = posts.sort((a, b) => {
    const dateA = new Date(a.data.updated ?? a.data.date).getTime();
    const dateB = new Date(b.data.updated ?? b.data.date).getTime();
    return dateB - dateA;
  });

  return rss({
    title: 'Dev Portfolio & Blog',
    description: 'Software developer portfolio and technical blog',
    site: context.site,
    items: sorted.map(post => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
  });
}
