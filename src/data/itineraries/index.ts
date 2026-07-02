import { lightItineraries } from "./data";
import type { ItineraryCategory, LightItinerary } from "./types";

export { lightItineraries };
export type { LightItinerary, ItineraryCategory } from "./types";

const BY_SLUG = new Map(lightItineraries.map((i) => [i.slug, i]));

export function getLightItinerary(slug: string): LightItinerary | null {
  return BY_SLUG.get(slug) ?? null;
}

export function isLightItinerary(slug: string): boolean {
  return BY_SLUG.has(slug);
}

export function lightByCategory(category: ItineraryCategory): LightItinerary[] {
  return lightItineraries.filter((i) => i.category === category);
}
