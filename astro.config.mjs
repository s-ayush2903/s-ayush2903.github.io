import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { remarkCallouts } from './src/plugins/remarkCallouts.ts';

export default defineConfig({
  // Update this to your production domain before deploying
  site: 'https://example.com',
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
  ],
  markdown: {
    // remark-gfm is included by Astro by default — no need to add it
    remarkPlugins: [remarkMath, remarkDirective, remarkCallouts],
    rehypePlugins: [rehypeKatex, rehypeRaw],
    shikiConfig: {
      // Dual-theme: light/dark toggled by the .dark class on <html>
      // CSS in index.css wires --shiki-light / --shiki-dark vars to the active theme
      themes: {
        light: 'one-light',
        dark: 'one-dark-pro',
      },
      defaultColor: false,
      wrap: false,
    },
  },
  server: {
    port: 8080,
  },
});
