/**
 * Curated TBO hotel destinations (city name → TBO CityCode).
 *
 * The Hotel Search API needs a numeric TBO CityCode, not a free-text city. For
 * now we seed the destinations TBO enabled for test bookings; codes were read
 * live from the static CityList API. Extend this list (or swap for a live
 * city-autocomplete endpoint backed by /lib/tbo-hotel-static.cityList) as more
 * destinations go live.
 */
export type HotelCity = {
  /** URL slug used in /hotels?city=… */
  slug: string;
  label: string;
  /** TBO CityCode passed to Search. */
  cityCode: string;
  countryCode: string;
};

export const HOTEL_CITIES: HotelCity[] = [
  { slug: "delhi", label: "Delhi NCR", cityCode: "418069", countryCode: "IN" },
  { slug: "mumbai", label: "Mumbai", cityCode: "144306", countryCode: "IN" },
  { slug: "dubai", label: "Dubai", cityCode: "115936", countryCode: "AE" },
];

/** Resolve a slug, label, or raw CityCode to a known destination. */
export function resolveHotelCity(input?: string): HotelCity | undefined {
  if (!input) return undefined;
  const q = input.trim().toLowerCase();
  return (
    HOTEL_CITIES.find((c) => c.slug === q) ||
    HOTEL_CITIES.find((c) => c.cityCode === q) ||
    HOTEL_CITIES.find((c) => c.label.toLowerCase() === q) ||
    HOTEL_CITIES.find((c) => c.label.toLowerCase().includes(q) || q.includes(c.slug))
  );
}
