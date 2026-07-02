/**
 * Package catalogue types — ported from the riseandshine-itinerary repo
 * (feature/catalog-ui). Self-contained plain-TS interfaces (no zod runtime),
 * covering only what the marketing site renders. Pricing benchmarks are kept in
 * the data but not displayed — the site shows "Price on enquiry".
 */

export type PackageCategory = "domestic" | "international" | "cruise";

export type CatalogPackageKey =
  | "andaman"
  | "rajasthan"
  | "kerala"
  | "goa"
  | "golden-triangle"
  | "thailand"
  | "mauritius"
  | "hong-kong"
  | "mauritius-dubai"
  | "singapore-cruise"
  | "singapore-bali-cruise";

/** A physical place referenced in a day's activities. */
export interface Place {
  name: string;
  category: string;
  lat: number;
  lng: number;
  rating: number | null;
  reviews: number | null;
  priceLevel: number | null;
  photoUrl: string | null;
  mapsUrl: string;
  vegFriendly: boolean;
  tag: string | null;
}

export interface FlightLeg {
  label: string;
  route: string;
  flights: string;
  dep: string;
  arr: string;
  dur: string;
  stops: string;
}

export interface FlightAlt {
  carrier: string;
  perAdultUSD: number;
  outbound: FlightLeg;
  inbound: FlightLeg;
  fareNote: string;
}

export interface Flights {
  carrier: string;
  outbound: FlightLeg;
  inbound: FlightLeg;
  fareNote: string;
  perAdultUSD: number;
  source: "live" | "sample";
  alternatives: FlightAlt[];
}

export interface Hotel {
  name: string;
  area: string;
  stars: number;
  rating: number;
  reviews: number;
  nights: number;
  totalUSD: number;
  strikeUSD: number | null;
  lat: number;
  lng: number;
  bookUrl: string;
  photoUrl: string | null;
  source: "live" | "sample";
  alternatives: Hotel[];
}

export interface Intel {
  do: string[];
  skip: string[];
  miss: string[];
  diet: string;
  sources: string;
  source: "live" | "sample";
}

export interface VisaInfo {
  type: string;
  validity: string;
  processing: string;
  fee: string;
  docs: string;
}

export interface NarrativeActivity {
  period: string;
  title: string;
  detail: string;
  place: Place | null;
}

export interface CatalogPackageMeta {
  key: CatalogPackageKey;
  category: PackageCategory;
  name: string;
  title: string;
  tagline: string;
  tourName: string;
  durationNights: number;
  durationDays: number;
  routeSummary: string;
  heroImageUrl: string;
  originAirport: string;
  arrivalAirport: string;
  flightRouteLabel: string;
  domestic: boolean;
}

export interface CatalogDayTemplate {
  dayIndex: number;
  cityLabel: string;
  headline: string;
  overnight: string;
  activities: NarrativeActivity[];
}

export interface CatalogPackage extends CatalogPackageMeta {
  narrativeDays: CatalogDayTemplate[];
  flights: Flights;
  hotels: Hotel[];
  visa: VisaInfo | null;
  intel: Intel;
  /** INR benchmarks (retained from source; not shown — prices are on enquiry). */
  pricingINR: {
    flightPerAdult: number;
    hotels: { nightly: number; nights: number }[];
    transfersPerPax: number;
    activitiesPerPax: number;
    insurancePerPax: number;
    servicePct: number;
  };
}
