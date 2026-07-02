/**
 * Package card view-models — derived from the real tour catalogue in
 * `src/data/catalog`. This file is the thin adapter the marketing UI consumes
 * (cards, category listings, featured strip); the rich per-package data (day by
 * day, flights, hotels, visa, intel) lives in the catalogue and drives the
 * detail pages at /packages/[category]/[slug].
 *
 * Prices are shown "on enquiry" — no fabricated numbers or ratings on cards.
 */
import {
  PACKAGE_LIST,
  packagesByCategory,
  featuredPackages as featuredCatalog,
} from "./catalog";
import type { CatalogPackage, PackageCategory } from "./catalog/types";
import { lightByCategory, lightItineraries } from "./itineraries";
import type { LightItinerary } from "./itineraries/types";

export type { PackageCategory } from "./catalog/types";

/** Card view-model rendered by <PackageCard>. */
export type Package = {
  slug: string;
  category: PackageCategory;
  /** Sellable tour name shown as the card heading. */
  title: string;
  /** City route summary, e.g. "Jaipur · Jodhpur · Udaipur". */
  location: string;
  days: number;
  nights: number;
  description: string;
  /** Full image URL (local /packages/*.jpg or remote). Optional → gradient card. */
  heroImage?: string;
  /** Overrides the "NN / MD" badge (e.g. a duration range for library pages). */
  durationLabel?: string;
  /** Link to the detail page. */
  href: string;
};

/** Build an optimized Unsplash URL from a photo id (used by page/section heroes). */
export function photo(id: string, w = 800): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
}

export const categoryMeta: Record<
  PackageCategory,
  { label: string; title: string; blurb: string; photoId: string }
> = {
  domestic: {
    label: "Domestic",
    title: "Domestic Escapes",
    blurb:
      "Discover the beauty of India: backwaters, palaces, deserts, hills and islands, all fully managed from Ahmedabad.",
    photoId: "photo-1506905925346-21bda4d32df4",
  },
  international: {
    label: "International",
    title: "International Holidays",
    blurb:
      "Island honeymoons to city breaks, with flights, stays, visas and sightseeing handled end to end.",
    photoId: "photo-1514282401047-d79a71a590e8",
  },
  cruise: {
    label: "Cruise",
    title: "Cruise Voyages",
    blurb:
      "City stays paired with a cruise at sea, the right cabin, route and shore excursions arranged for you.",
    photoId: "photo-1548574505-5e239809ee19",
  },
};

function toCard(p: CatalogPackage): Package {
  return {
    slug: p.key,
    category: p.category,
    title: p.tourName,
    location: p.routeSummary,
    days: p.durationDays,
    nights: p.durationNights,
    description: p.tagline,
    heroImage: p.heroImageUrl,
    href: `/packages/${p.category}/${p.key}`,
  };
}

function lightToCard(i: LightItinerary): Package {
  return {
    slug: i.slug,
    category: i.category,
    title: i.name,
    location: i.region,
    days: i.maxNights + 1,
    nights: i.maxNights,
    description: i.tagline,
    heroImage: i.heroImage,
    durationLabel:
      i.minNights === i.maxNights
        ? `${i.minNights} nights`
        : `${i.minNights}–${i.maxNights} nights`,
    href: `/packages/${i.category}/${i.slug}`,
  };
}

export const packages: Package[] = [
  ...PACKAGE_LIST.map(toCard),
  ...lightItineraries.map(lightToCard),
];

/** Catalogue packages first (photo-rich), then the wider destination library. */
export const getByCategory = (c: PackageCategory): Package[] => [
  ...packagesByCategory(c).map(toCard),
  ...(c === "cruise" ? [] : lightByCategory(c).map(lightToCard)),
];

export const featuredPackages: Package[] = featuredCatalog.map(toCard);
