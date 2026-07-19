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

const singleton = (name: string) => defineCollection({
  loader: glob({ pattern: '**/*.json', base: `./src/content/${name}` }),
  schema: z.any(),
});

const menuItem = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/menuFood' }),
  schema: z.object({
    slug: z.string(),
    category: z.literal('food'),
    name: z.string(),
    description: z.string(),
    image: z.string().nullable(),
    alt: z.string(),
  }),
});

const menuBrunch = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/menuBrunch' }),
  schema: z.object({
    slug: z.string(),
    category: z.literal('brunch'),
    name: z.string(),
    description: z.string(),
    image: z.string().nullable(),
    alt: z.string(),
  }),
});

const menuCocktails = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/menuCocktails' }),
  schema: z.object({
    slug: z.string(),
    category: z.literal('cocktails'),
    name: z.string(),
    description: z.string(),
    image: z.string().nullable(),
    alt: z.string(),
  }),
});

const menuCategoryCards = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/menuCategoryCards' }),
  schema: z.object({
    slug: z.string(),
    label: z.string(),
    desc: z.string(),
    image: z.string(),
    alt: z.string(),
  }),
});

const privateEventTypes = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/privateEventTypes' }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    metaTitle: z.string(),
    description: z.string(),
    cardDesc: z.string(),
    eyebrow: z.string(),
    capacity: z.string(),
    body: z.array(z.string()),
    includes: z.array(z.string()),
  }),
});

const processStep = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/privateEventsProcessSteps' }),
  schema: z.object({ step: z.string(), title: z.string(), body: z.string() }),
});

const faq = (name: string) => defineCollection({
  loader: glob({ pattern: '**/*.json', base: `./src/content/${name}` }),
  schema: z.object({ q: z.string(), a: z.string() }),
});

export const collections = {
  blog,
  siteSettings: singleton('siteSettings'),
  navigation: singleton('navigation'),
  footer: singleton('footer'),
  home: singleton('home'),
  brunchPage: singleton('brunchPage'),
  menuPage: singleton('menuPage'),
  contactPage: singleton('contactPage'),
  faqPage: singleton('faqPage'),
  spacePage: singleton('spacePage'),
  privateEventsIndexPage: singleton('privateEventsIndexPage'),
  blogIndexPage: singleton('blogIndexPage'),
  menuFood: menuItem,
  menuBrunch,
  menuCocktails,
  menuCategoryCards,
  privateEventTypes,
  privateEventsProcessSteps: processStep,
  brunchFaqs: faq('brunchFaqs'),
  generalFaqs: faq('generalFaqs'),
};
