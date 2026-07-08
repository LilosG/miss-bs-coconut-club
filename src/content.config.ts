import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    metaTitle: z.string(),
    description: z.string(),
    category: z.string(),
    date: z.string(),
    image: z.string(),
    imageAlt: z.string(),
  }),
});

export const collections = { blog };
