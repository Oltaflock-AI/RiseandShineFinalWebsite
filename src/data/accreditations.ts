/**
 * Industry memberships & accreditations — verified against the BNI Nov 2022
 * deck (slide 3). Logos live in /public/brand/accreditations.
 *
 * Note: the old site's "IATA" claim was incorrect (IATA is a specific bonded
 * status Rise & Shine does not hold) — the real body is IATTE. Removed here.
 */
export type Accreditation = {
  /** Short mark shown as a tooltip / alt fallback. */
  name: string;
  /** Full body name — used for the image alt text. */
  full: string;
  logo: string;
};

export const accreditations: Accreditation[] = [
  {
    name: "ADTOI",
    full: "Association of Domestic Tour Operators of India",
    logo: "/brand/accreditations/adtoi-logo.jpg",
  },
  {
    name: "IATTE",
    full: "Indian Association of Travel & Tourism Experts",
    logo: "/brand/accreditations/iatte-logo.jpg",
  },
  {
    name: "TAG",
    full: "Tour Operators & Travel Agents Association of Gujarat",
    logo: "/brand/accreditations/tag-gujarat-logo.jpg",
  },
  {
    name: "Gujarat Tourism",
    full: "Gujarat Tourism",
    logo: "/brand/accreditations/gujarat-tourism-logo.png",
  },
  // TODO(khush): confirm whether the 6th mark is TAFI (per the BNI deck) or the
  // live site's "TLC / 100% Tourism" logo, then swap the asset if needed.
  {
    name: "TAFI",
    full: "Travel Agents Federation of India",
    logo: "/brand/accreditations/tafi-logo.png",
  },
  {
    name: "BNI",
    full: "Proud BNI Member",
    logo: "/brand/accreditations/bni-logo.jpg",
  },
];
