import type { ImageMetadata } from 'astro';

type ImageModule = { default: ImageMetadata };

const localImages = import.meta.glob<ImageModule>(
  '/src/assets/images/site/**/*.{avif,gif,jpeg,jpg,png,webp}',
);

/**
 * Resolve legacy /images/* content paths to source-controlled Astro assets.
 *
 * Keeping this mapping in one place lets Keystatic/content continue to store
 * stable string references while Astro receives ImageMetadata and performs
 * responsive image transforms at build time for prerendered pages.
 */
export async function resolveSiteImage(
  source: string | ImageMetadata,
): Promise<string | ImageMetadata> {
  if (typeof source !== 'string') return source;

  let assetPath: string | null = null;

  if (source.startsWith('/images/')) {
    assetPath = `/src/assets/images/site/${source.slice('/images/'.length)}`;
  } else if (source.startsWith('/src/assets/images/site/')) {
    assetPath = source;
  }

  if (!assetPath) return source;

  const load = localImages[assetPath];
  if (!load) {
    throw new Error(`Local image is not registered with Astro: ${source}`);
  }

  return (await load()).default;
}
