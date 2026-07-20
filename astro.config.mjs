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
  integrations: [mdx(), sitemap(), react(), keystatic()],
  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel()
});
