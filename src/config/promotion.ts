export interface PromotionConfig {
  feedOrigin: string;
  venueSlug: string;
}

/**
 * Public promotion-feed settings for Miss B's Coconut Club.
 */
export const PROMOTION_CONFIG = {
  feedOrigin: 'https://gph-site-manager.vercel.app',
  venueSlug: 'miss-bs',
} as const satisfies PromotionConfig;

export function getPromotionFeedUrl(siteSlug: string): string {
  return new URL(
    `/api/public/promotion/${encodeURIComponent(siteSlug)}`,
    PROMOTION_CONFIG.feedOrigin,
  ).href;
}
