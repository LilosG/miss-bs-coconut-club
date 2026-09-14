export const CANONICAL_SITE_ORIGIN = 'https://missbcoconutclub.com';

/**
 * Return an absolute canonical page URL on the production origin.
 * Query parameters and fragments are intentionally excluded from canonicals.
 */
export function getCanonicalUrl(input: string | URL = '/'): string {
  const url = new URL(input.toString(), `${CANONICAL_SITE_ORIGIN}/`);
  const pathname = url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '');

  return `${CANONICAL_SITE_ORIGIN}${pathname || '/'}`;
}
