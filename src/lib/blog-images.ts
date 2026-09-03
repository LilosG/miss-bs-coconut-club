const blogImageOverrides: Record<string, { image: string; imageAlt: string }> = {
  'beach-day-plan-mission-beach-guide': {
    image: '/images/venue/miss-bs-coconut-club-mission-beach-venue-15.webp',
    imageAlt: "Miss B's Coconut Club open-air venue in Mission Beach",
  },
  'best-happy-hour-mission-beach-local-guide': {
    image: '/images/venue/miss-bs-coconut-club-mission-beach-venue-05.webp',
    imageAlt: "Happy hour setting at Miss B's Coconut Club in Mission Beach",
  },
  'best-outdoor-patios-mission-beach-local-guide': {
    image: '/images/venue/miss-bs-coconut-club-mission-beach-venue-10.webp',
    imageAlt: "Outdoor patio at Miss B's Coconut Club in Mission Beach",
  },
  'best-rum-cocktails-san-diego-local-guide': {
    image: '/images/cocktails/miss-bs-coconut-club-cocktail-mission-beach-13.webp',
    imageAlt: "Rum cocktail at Miss B's Coconut Club in Mission Beach San Diego",
  },
  'mission-beach-bar-crawl-guide': {
    image: '/images/venue/miss-bs-coconut-club-mission-beach-venue-07.webp',
    imageAlt: "Miss B's Coconut Club bar in Mission Beach San Diego",
  },
  'mission-beach-happy-hour-guide': {
    image: '/images/cocktails/miss-bs-coconut-club-cocktail-mission-beach-02.webp',
    imageAlt: "Tropical happy hour cocktail at Miss B's Coconut Club in Mission Beach",
  },
};

export function resolveBlogImage(post: { id: string; data: { image?: string; imageAlt?: string; title: string } }) {
  const override = blogImageOverrides[post.id];
  return {
    image: override?.image ?? post.data.image ?? '/og-image.jpg',
    imageAlt: override?.imageAlt ?? post.data.imageAlt ?? post.data.title,
  };
}
