/**
 * Rise & Shine "Inquiry Form" (Google Forms) integration.
 *
 * Enquiries submitted through the on-brand site forms are delivered here via a
 * server-side POST to the form's `formResponse` endpoint (no CORS, reliable),
 * so leads land in the agency's own Google Sheet while keeping our UI.
 *
 * Entry IDs were read from the live form's published field metadata.
 */
const FORM_ID = "1FAIpQLSeoQwHsQxXr5mYt6bZR_iu9baWKuTMFi7b-Xc8tIP2qoExyBw";

export const GOOGLE_FORM = {
  viewUrl: `https://docs.google.com/forms/d/e/${FORM_ID}/viewform`,
  responseUrl: `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`,
  entry: {
    name: "entry.2005620554",
    email: "entry.1045781291",
    address: "entry.1065046570",
    phone: "entry.1166974658",
    travellers: "entry.1546378365",
    services: "entry.1700027588", // checkbox
    destination: "entry.959642982",
    date: "entry.264627819", // date → _year/_month/_day
    days: "entry.994750642", // dropdown
    hotel: "entry.1485623645",
    meal: "entry.2075201056",
    budget: "entry.1307584559",
    message: "entry.2102122462", // "Additional Requirements"
  },
} as const;

/** Valid options for the "Services" checkbox — values must match exactly. */
export const SERVICE_OPTIONS = [
  "Domestic",
  "International",
  "Flight",
  "Travel Insurance",
  "Passport",
  "Visa",
  "forex",
] as const;

/** Valid options for the "Number of days" dropdown. */
const DAY_OPTIONS = [
  "0",
  "1N2D",
  "2N3D",
  "3N4D",
  "4N5D",
  "5N6D",
  "6N7D",
  "7N8D",
  "More than 8Night",
] as const;

/** Map a nights count to the form's closest "Number of days" option. */
export function nightsToDayOption(nights: number): string {
  if (!nights || nights < 1) return "0";
  if (nights >= 8) return "More than 8Night";
  return `${nights}N${nights + 1}D`;
}

export type Lead = {
  name: string;
  phone: string;
  email?: string;
  destination?: string;
  travellers?: string;
  budget?: string;
  message?: string;
  /** Subset of SERVICE_OPTIONS. */
  services?: string[];
  /** ISO date YYYY-MM-DD. */
  departure?: string;
  /** One of DAY_OPTIONS. */
  days?: string;
};

/** Build the x-www-form-urlencoded body for the Google Form response endpoint. */
export function buildFormBody(lead: Lead): URLSearchParams {
  const E = GOOGLE_FORM.entry;
  const p = new URLSearchParams();
  const set = (k: string, v?: string) => {
    if (v && v.trim()) p.append(k, v.trim());
  };

  set(E.name, lead.name);
  set(E.phone, lead.phone);
  set(E.email, lead.email);
  set(E.destination, lead.destination);
  set(E.travellers, lead.travellers);
  set(E.budget, lead.budget);
  set(E.message, lead.message);

  for (const s of lead.services ?? []) {
    if ((SERVICE_OPTIONS as readonly string[]).includes(s)) p.append(E.services, s);
  }

  if (lead.days && (DAY_OPTIONS as readonly string[]).includes(lead.days)) {
    p.append(E.days, lead.days);
  }

  if (lead.departure) {
    const [y, m, d] = lead.departure.split("-");
    if (y && m && d) {
      p.append(`${E.date}_year`, y);
      p.append(`${E.date}_month`, String(Number(m)));
      p.append(`${E.date}_day`, String(Number(d)));
    }
  }

  // Harmless flags that improve single-page form acceptance.
  p.append("fvv", "1");
  p.append("pageHistory", "0");

  return p;
}
