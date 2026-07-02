/**
 * Editorial content blocks used across pages: why-choose-us, brand values,
 * and headline stats. `icon` values map to the Icon registry.
 */
import type { IconName } from "@/components/ui/Icon";

export type Feature = {
  icon: IconName;
  title: string;
  description: string;
};

/** "Why Rise & Shine" — shown on the home about split. */
export const whyUs: Feature[] = [
  {
    icon: "target",
    title: "Made for you",
    description: "Itineraries shaped around how you like to travel.",
  },
  {
    icon: "headset",
    title: "Real humans, 24/7",
    description: "Someone who knows your trip is always a call away.",
  },
  {
    icon: "wallet",
    title: "Honest pricing",
    description: "Best value, clearly explained. No nasty surprises.",
  },
  {
    icon: "shield",
    title: "Accredited & trusted",
    description: "An ADTOI, IATTE & Gujarat Tourism-recognised agency.",
  },
];

/** Brand values — shown on the About page. */
export const values: Feature[] = [
  {
    icon: "compass",
    title: "Flexible & creative",
    description:
      "No two travellers are alike. We design around your pace, interests and budget, never off a shelf.",
  },
  {
    icon: "users",
    title: "People we trust",
    description:
      "Hand-picked transport teams, guides and on-ground partners at every destination.",
  },
  {
    icon: "search",
    title: "Attention to detail",
    description:
      "It's the little things that make a trip exceptional, and we happily obsess over them.",
  },
  {
    icon: "gem",
    title: "Honest value",
    description:
      "Transparent pricing and best-fit options that respect your time and money.",
  },
];

export type Stat = { value: number; suffix?: string; label: string };

// All values below are verified facts (see §1 of the content brief): 15+ years
// (est. 2011), 30+ countries and 55 nationalities served, 98% visa success ratio,
// 6 industry accreditations. No fabricated traveller counts.
export const homeStats: Stat[] = [
  { value: 15, suffix: "+", label: "Years guiding journeys" },
  { value: 30, suffix: "+", label: "Countries serviced" },
  { value: 55, label: "Nationalities served" },
  { value: 98, suffix: "%", label: "Visa success rate" },
];

export const aboutStats: Stat[] = [
  { value: 15, suffix: "+", label: "Years of experience" },
  { value: 30, suffix: "+", label: "Countries serviced" },
  { value: 55, label: "Nationalities served" },
  { value: 6, label: "Industry accreditations" },
];

/** Destinations for the home marquee — aligned with the real package catalogue. */
export const marqueeDestinations = [
  "Kerala",
  "Rajasthan",
  "Goa",
  "Andaman",
  "Golden Triangle",
  "Thailand",
  "Mauritius",
  "Dubai",
  "Hong Kong",
  "Singapore",
  "Bali",
];
