// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://missbcoconutclub.com',
  trailingSlash: 'never',

  redirects: {
    '/specials': '/blog/mission-beach-happy-hour-guide',
    '/gallery': '/space',
    '/cocktails': '/menu',
  },
  integrations: [mdx(), sitemap(), react(), keystatic()],
  vite: {
    plugins: [tailwindcss()]
  },

  // Keystatic still requires the Vercel adapter for its server-side admin/API
  // routes. Public site pages remain prerendered, and local image transforms are
  // handled by Astro/Sharp during the build instead of Vercel's runtime image
  // service.
  adapter: vercel(),

  image: {
    domains: ['missbcoconutclub.com', 'popmenucloud.com'],
  },
});
