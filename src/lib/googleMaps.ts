export interface SiteProfileForGoogleMaps {
  venueName: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
  };
  coordinates: {
    latitude: string;
    longitude: string;
  };
}

export interface GoogleMapsPlace {
  placeId: string | null;
  placeUrl: string;
  directionsUrl: string;
  embedUrl: string | null;
}

const placeCache = new Map<string, Promise<GoogleMapsPlace>>();

function buildBusinessQuery(siteProfile: SiteProfileForGoogleMaps) {
  const { address } = siteProfile;
  return `${siteProfile.venueName}, ${address.streetAddress}, ${address.addressLocality}, ${address.addressRegion} ${address.postalCode}`;
}

async function resolvePlaceId(siteProfile: SiteProfileForGoogleMaps): Promise<string | null> {
  const apiKey = import.meta.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.warn('[google-maps] GOOGLE_PLACES_API_KEY is not configured; using name/address fallback.');
    return null;
  }

  const latitude = Number(siteProfile.coordinates.latitude);
  const longitude = Number(siteProfile.coordinates.longitude);

  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id',
      },
      body: JSON.stringify({
        textQuery: buildBusinessQuery(siteProfile),
        pageSize: 1,
        ...(Number.isFinite(latitude) && Number.isFinite(longitude)
          ? {
              locationBias: {
                circle: {
                  center: { latitude, longitude },
                  radius: 250,
                },
              },
            }
          : {}),
      }),
    });

    if (!response.ok) {
      console.warn(`[google-maps] Places API lookup failed with ${response.status}; using name/address fallback.`);
      return null;
    }

    const data = (await response.json()) as { places?: Array<{ id?: string }> };
    return data.places?.[0]?.id ?? null;
  } catch (error) {
    console.warn('[google-maps] Places API lookup failed; using name/address fallback.', error);
    return null;
  }
}

async function buildGoogleMapsPlace(siteProfile: SiteProfileForGoogleMaps): Promise<GoogleMapsPlace> {
  const businessQuery = buildBusinessQuery(siteProfile);
  const placeId = await resolvePlaceId(siteProfile);

  const placeParams = new URLSearchParams({
    api: '1',
    query: placeId ? siteProfile.venueName : businessQuery,
  });
  if (placeId) placeParams.set('query_place_id', placeId);

  const directionsParams = new URLSearchParams({
    api: '1',
    destination: businessQuery,
    dir_action: 'navigate',
  });
  if (placeId) directionsParams.set('destination_place_id', placeId);

  const embedApiKey =
    import.meta.env.PUBLIC_GOOGLE_MAPS_EMBED_API_KEY ??
    import.meta.env.GOOGLE_MAPS_EMBED_API_KEY;

  const embedUrl = embedApiKey
    ? `https://www.google.com/maps/embed/v1/place?${new URLSearchParams({
        key: embedApiKey,
        q: placeId ? `place_id:${placeId}` : businessQuery,
      }).toString()}`
    : null;

  if (!embedApiKey) {
    console.warn('[google-maps] Maps Embed API key is not configured; map iframe will not render.');
  }

  return {
    placeId,
    placeUrl: `https://www.google.com/maps/search/?${placeParams.toString()}`,
    directionsUrl: `https://www.google.com/maps/dir/?${directionsParams.toString()}`,
    embedUrl,
  };
}

export function getGoogleMapsPlace(siteProfile: SiteProfileForGoogleMaps) {
  const cacheKey = buildBusinessQuery(siteProfile);
  const cached = placeCache.get(cacheKey);
  if (cached) return cached;

  const place = buildGoogleMapsPlace(siteProfile);
  placeCache.set(cacheKey, place);
  return place;
}
