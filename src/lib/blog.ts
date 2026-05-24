export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  tags: string[];
  description: string;
  readTime: number;
}

export function getReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.floor(words / 230));
}
