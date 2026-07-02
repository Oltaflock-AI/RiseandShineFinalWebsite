/**
 * Package catalogue, 11 real Rise & Shine tours ported from the
 * riseandshine-itinerary repo (feature/catalog-ui), sourced from the agency's
 * own listings. Each package carries a full day-by-day itinerary, flights,
 * hotels, visa info and traveller intel. Prices are shown "on enquiry".
 */
import { ANDAMAN_PACKAGE } from "./andaman";
import { RAJASTHAN, KERALA, GOA, GOLDEN_TRIANGLE } from "./domestic-tours";
import {
  THAILAND,
  MAURITIUS,
  HONG_KONG,
  MAURITIUS_DUBAI,
} from "./international-tours";
import { SINGAPORE_CRUISE, SINGAPORE_BALI_CRUISE } from "./cruise-tours";
import type {
  CatalogPackage,
  CatalogPackageKey,
  PackageCategory,
} from "./types";

export const CATALOG_PACKAGES = {
  andaman: ANDAMAN_PACKAGE,
  rajasthan: RAJASTHAN,
  kerala: KERALA,
  goa: GOA,
  "golden-triangle": GOLDEN_TRIANGLE,
  thailand: THAILAND,
  mauritius: MAURITIUS,
  "hong-kong": HONG_KONG,
  "mauritius-dubai": MAURITIUS_DUBAI,
  "singapore-cruise": SINGAPORE_CRUISE,
  "singapore-bali-cruise": SINGAPORE_BALI_CRUISE,
} satisfies Record<CatalogPackageKey, CatalogPackage>;

export const PACKAGE_LIST: CatalogPackage[] = Object.values(CATALOG_PACKAGES);

export const CATALOG_KEYS = Object.keys(
  CATALOG_PACKAGES,
) as CatalogPackageKey[];

export function isCatalogPackage(key: string): key is CatalogPackageKey {
  return key in CATALOG_PACKAGES;
}

export function getPackage(key: CatalogPackageKey): CatalogPackage {
  return CATALOG_PACKAGES[key];
}

export function packagesByCategory(category: PackageCategory): CatalogPackage[] {
  return PACKAGE_LIST.filter((p) => p.category === category);
}

/** A small, hand-picked set for the homepage "Featured" strip. */
export const FEATURED_KEYS: CatalogPackageKey[] = [
  "kerala",
  "mauritius-dubai",
  "singapore-bali-cruise",
  "rajasthan",
  "thailand",
  "andaman",
];

export const featuredPackages: CatalogPackage[] = FEATURED_KEYS.map(
  (k) => CATALOG_PACKAGES[k],
);

export type {
  CatalogPackage,
  CatalogPackageKey,
  PackageCategory,
} from "./types";
