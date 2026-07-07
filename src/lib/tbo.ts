/**
 * TBO (TekTravels) Flight API client — SERVER ONLY.
 *
 * Talks to the TBO staging Air API (Authenticate → Search) to return real-time
 * flight fares. Never import this from a client component: it reads credentials
 * from env and calls TBO's HTTP endpoints server-side (no CORS, IP-scoped).
 *
 * Creds live in .env (gitignored): TBO_CLIENT_ID / TBO_USERNAME / TBO_PASSWORD /
 * TBO_END_USER_IP. See reference/api-setup/apiSetup.md. Booking is not wired
 * (certification pending) — we surface live search fares with an enquiry CTA.
 */
const AUTH_URL =
  "http://Sharedapi.tektravels.com/SharedData.svc/rest/Authenticate";
const SEARCH_URL =
  "http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/Search";

function cfg() {
  return {
    clientId: process.env.TBO_CLIENT_ID ?? "",
    username: process.env.TBO_USERNAME ?? "",
    password: process.env.TBO_PASSWORD ?? "",
    ip: process.env.TBO_END_USER_IP || "115.112.175.13",
  };
}

export function tboConfigured(): boolean {
  const c = cfg();
  return Boolean(c.clientId && c.username && c.password);
}

// ── normalized shapes returned to the app ──
export type FlightSegment = {
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  from: string;
  fromCity: string;
  fromTerminal: string;
  to: string;
  toCity: string;
  toTerminal: string;
  depTime: string;
  arrTime: string;
  durationMin: number;
};

export type FlightOffer = {
  id: string;
  airlineCode: string;
  airlineName: string;
  isLCC: boolean;
  isRefundable: boolean;
  stops: number;
  durationMin: number;
  fareINR: number;
  baseINR: number;
  taxINR: number;
  segments: FlightSegment[];
};

export type FlightSearch = {
  ok: boolean;
  source: "live" | "unavailable";
  from: string;
  to: string;
  departISO: string;
  returnISO?: string;
  adults: number;
  /** Outbound offers, sorted cheapest first. */
  outbound: FlightOffer[];
  /** Return offers (only for round-trip searches). */
  inbound?: FlightOffer[];
  /** Cheapest total per adult (round-trip = out + in). */
  cheapestINR?: number;
  error?: string;
};

// ── auth token cache (session-scoped; refresh well within TBO's window) ──
let tokenCache: { token: string; exp: number } | null = null;

async function authenticate(force = false): Promise<string | null> {
  if (!force && tokenCache && tokenCache.exp > Date.now()) return tokenCache.token;
  if (!tboConfigured()) return null;
  const c = cfg();
  try {
    const r = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ClientId: c.clientId,
        UserName: c.username,
        Password: c.password,
        EndUserIp: c.ip,
      }),
      cache: "no-store",
    });
    const j = await r.json();
    if (j?.Status !== 1 || !j?.TokenId) return null;
    tokenCache = { token: j.TokenId, exp: Date.now() + 20 * 60 * 1000 };
    return j.TokenId;
  } catch {
    return null;
  }
}

type RawSeg = {
  Airline?: { AirlineCode?: string; AirlineName?: string; FlightNumber?: string };
  Origin?: { Airport?: { AirportCode?: string; CityName?: string; Terminal?: string }; DepTime?: string };
  Destination?: { Airport?: { AirportCode?: string; CityName?: string; Terminal?: string }; ArrTime?: string };
  Duration?: number;
};
type RawFareBreakdown = {
  PassengerType?: number; // 1 = Adult, 2 = Child, 3 = Infant
  PassengerCount?: number;
  BaseFare?: number;
  Tax?: number;
};
type RawResult = {
  ResultIndex: string;
  IsLCC?: boolean;
  IsRefundable?: boolean;
  AirlineCode?: string;
  Fare?: { PublishedFare?: number; OfferedFare?: number; BaseFare?: number; Tax?: number };
  FareBreakdown?: RawFareBreakdown[];
  Segments?: RawSeg[][];
};

function mapSegment(s: RawSeg): FlightSegment {
  const a = s.Airline ?? {};
  return {
    airlineCode: a.AirlineCode ?? "",
    airlineName: a.AirlineName ?? a.AirlineCode ?? "",
    flightNumber: `${a.AirlineCode ?? ""} ${a.FlightNumber ?? ""}`.trim(),
    from: s.Origin?.Airport?.AirportCode ?? "",
    fromCity: s.Origin?.Airport?.CityName ?? "",
    fromTerminal: s.Origin?.Airport?.Terminal ?? "",
    to: s.Destination?.Airport?.AirportCode ?? "",
    toCity: s.Destination?.Airport?.CityName ?? "",
    toTerminal: s.Destination?.Airport?.Terminal ?? "",
    depTime: s.Origin?.DepTime ?? "",
    arrTime: s.Destination?.ArrTime ?? "",
    durationMin: s.Duration ?? 0,
  };
}

/** Total journey time incl. layovers: first departure → last arrival. */
function totalDuration(legs: RawSeg[]): number {
  const dep = legs[0]?.Origin?.DepTime;
  const arr = legs[legs.length - 1]?.Destination?.ArrTime;
  if (dep && arr) {
    const mins = (new Date(arr).getTime() - new Date(dep).getTime()) / 60000;
    if (mins > 0 && mins < 48 * 60) return Math.round(mins);
  }
  return legs.reduce((a, s) => a + (s.Duration ?? 0), 0);
}

/**
 * Fare PER ADULT. TBO's `Fare.PublishedFare` is the TOTAL across all
 * passengers, so for a 2-adult search it is double the single-seat price.
 * The adult `FareBreakdown` entry (PassengerType 1) carries that pax type's
 * total, which we divide by its count to get one adult's fare. Falls back to
 * PublishedFare / adults when no breakdown is present.
 */
function perAdultFare(
  r: RawResult,
  adults: number,
): { fareINR: number; baseINR: number; taxINR: number } {
  const fb = r.FareBreakdown?.find(
    (b) => (b.PassengerType ?? 0) === 1 && (b.PassengerCount ?? 0) > 0,
  );
  if (fb) {
    const n = fb.PassengerCount as number;
    const base = (fb.BaseFare ?? 0) / n;
    const tax = (fb.Tax ?? 0) / n;
    return {
      fareINR: Math.round(base + tax),
      baseINR: Math.round(base),
      taxINR: Math.round(tax),
    };
  }
  const total = r.Fare?.PublishedFare ?? r.Fare?.OfferedFare ?? 0;
  const per = adults > 0 ? total / adults : total;
  return {
    fareINR: Math.round(per),
    baseINR: Math.round((r.Fare?.BaseFare ?? 0) / Math.max(1, adults)),
    taxINR: Math.round((r.Fare?.Tax ?? 0) / Math.max(1, adults)),
  };
}

function mapResult(r: RawResult, adults: number): FlightOffer {
  const legs = r.Segments?.[0] ?? [];
  const fare = perAdultFare(r, adults);
  return {
    id: r.ResultIndex,
    airlineCode: r.AirlineCode ?? legs[0]?.Airline?.AirlineCode ?? "",
    airlineName: legs[0]?.Airline?.AirlineName ?? r.AirlineCode ?? "",
    isLCC: Boolean(r.IsLCC),
    isRefundable: Boolean(r.IsRefundable),
    stops: Math.max(0, legs.length - 1),
    durationMin: totalDuration(legs),
    fareINR: fare.fareINR,
    baseINR: fare.baseINR,
    taxINR: fare.taxINR,
    segments: legs.map(mapSegment),
  };
}

/** Collapse duplicate fare-classes of the same physical flight to the cheapest. */
function dedupe(offers: FlightOffer[]): FlightOffer[] {
  const seen = new Set<string>();
  return offers.filter((o) => {
    const key = o.segments.map((s) => `${s.flightNumber}@${s.depTime}`).join(">");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function rawSearch(
  token: string,
  from: string,
  to: string,
  departISO: string,
  returnISO: string | undefined,
  adults: number,
  children: number,
  infants: number,
) {
  const seg = (o: string, d: string, date: string) => ({
    Origin: o,
    Destination: d,
    FlightCabinClass: "1",
    PreferredDepartureTime: `${date}T00:00:00`,
    PreferredArrivalTime: `${date}T00:00:00`,
  });
  const segments = [seg(from, to, departISO)];
  if (returnISO) segments.push(seg(to, from, returnISO));
  const r = await fetch(SEARCH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      EndUserIp: cfg().ip,
      TokenId: token,
      AdultCount: String(Math.max(1, adults)),
      ChildCount: String(children),
      InfantCount: String(infants),
      DirectFlight: "false",
      OneStopFlight: "false",
      JourneyType: returnISO ? "2" : "1",
      PreferredAirlines: null,
      Segments: segments,
      Sources: null,
    }),
    cache: "no-store",
  });
  return r.json();
}

// ── result cache (in-memory, per route+date+pax) ──
const searchCache = new Map<string, { data: FlightSearch; exp: number }>();
const SEARCH_TTL = 30 * 60 * 1000;

export type SearchArgs = {
  from: string;
  to: string;
  departISO: string;
  returnISO?: string;
  adults?: number;
  children?: number;
  infants?: number;
};

export async function searchFlights(args: SearchArgs): Promise<FlightSearch> {
  const from = args.from.toUpperCase();
  const to = args.to.toUpperCase();
  const adults = Math.max(1, args.adults ?? 1);
  const base: Omit<FlightSearch, "ok" | "source" | "outbound"> = {
    from,
    to,
    departISO: args.departISO,
    returnISO: args.returnISO,
    adults,
  };
  const key = `${from}|${to}|${args.departISO}|${args.returnISO ?? ""}|${adults}`;
  const hit = searchCache.get(key);
  if (hit && hit.exp > Date.now()) return hit.data;

  const fail = (error: string): FlightSearch => ({
    ...base,
    ok: false,
    source: "unavailable",
    outbound: [],
    error,
  });

  let token = await authenticate();
  if (!token) return fail("auth");

  let j: { Response?: { ResponseStatus?: number; Results?: RawResult[][]; Error?: { ErrorMessage?: string } } };
  try {
    j = await rawSearch(token, from, to, args.departISO, args.returnISO, adults, args.children ?? 0, args.infants ?? 0);
  } catch {
    return fail("network");
  }

  // token may have expired → re-auth once and retry
  if (j?.Response?.ResponseStatus !== 1) {
    token = await authenticate(true);
    if (token) {
      try {
        j = await rawSearch(token, from, to, args.departISO, args.returnISO, adults, args.children ?? 0, args.infants ?? 0);
      } catch {
        return fail("network");
      }
    }
  }

  const R = j?.Response;
  if (!R || R.ResponseStatus !== 1 || !R.Results?.length) {
    return fail(R?.Error?.ErrorMessage || "no results");
  }

  const groups = R.Results;
  const outbound = dedupe(
    groups[0].map((r) => mapResult(r, adults)).sort((a, b) => a.fareINR - b.fareINR),
  );
  const inbound = groups[1]
    ? dedupe(groups[1].map((r) => mapResult(r, adults)).sort((a, b) => a.fareINR - b.fareINR))
    : undefined;
  const cheapestINR =
    args.returnISO && inbound?.length
      ? (outbound[0]?.fareINR ?? 0) + (inbound[0]?.fareINR ?? 0)
      : outbound[0]?.fareINR;

  const data: FlightSearch = {
    ...base,
    ok: true,
    source: "live",
    outbound,
    inbound,
    cheapestINR,
  };
  searchCache.set(key, { data, exp: Date.now() + SEARCH_TTL });
  return data;
}

/** Default outbound/return dates ~4–5 weeks out (for indicative package fares). */
export function defaultDates(nights = 7): { departISO: string; returnISO: string } {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  const dep = d.toISOString().slice(0, 10);
  d.setDate(d.getDate() + Math.max(2, nights));
  return { departISO: dep, returnISO: d.toISOString().slice(0, 10) };
}
