/**
 * "Light" itinerary destinations — sourced from the agency's day-wise itinerary
 * library (docs/*.docx). These are broader destination pages with a day-by-day
 * plan and standard inclusions, but no per-package flights/hotels/pricing (those
 * are confirmed on enquiry). They complement the 11 fully-structured catalogue
 * packages in src/data/catalog.
 */
export type ItineraryCategory = "domestic" | "international";

export interface ItineraryDay {
  day: number;
  text: string;
}

export interface LightItinerary {
  slug: string;
  name: string;
  category: ItineraryCategory;
  /** Short cities/route summary. */
  region: string;
  tagline: string;
  minNights: number;
  maxNights: number;
  itinerary: ItineraryDay[];
  /** Optional hero photo; when absent the page uses a branded gradient hero. */
  heroImage?: string;
}
