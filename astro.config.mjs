// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://missbcoconutclub.com',
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel()
});