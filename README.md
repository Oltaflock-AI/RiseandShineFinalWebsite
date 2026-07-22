# Rise & Shine Travels — Website

Website for **Rise & Shine Travels** (Ahmedabad, est. 2011): an on-brand,
SEO-optimized marketing site **plus** a working travel-booking layer — live
flight search and an end-to-end flight booking flow powered by the **TBO
(TekTravels)** Air API, a real tour-package catalogue, and an enquiry pipeline
that lands leads in the agency's Google Sheet.

## Status at a glance

| Area | State |
|------|-------|
| Marketing site (home, about, services, contact, packages) | ✅ Built |
| Package catalogue — 11 real tours, day-by-day itineraries, category pages | ✅ Built |
| **Flight search** — live TBO staging (Authenticate → Search), real fares | ✅ Live (staging) |
| **Flight booking** — FareRule → FareQuote → SSR → Book → Ticket → GetBookingDetails | ✅ Built, staging — **prod certification pending** |
| Checkout — FareQuote-driven dynamic passenger form (asks for exactly what TBO requires) | ✅ Built |
| Auth — login / signup / account | ⚠️ **Demo only** — client-side localStorage, **not secure** |
| Enquiry forms → agency Google Form / Sheet | ✅ Live |
| SEO — sitemap, robots, `TravelAgency` JSON-LD, legacy-URL 301s | ✅ Built |
| Legal — terms & conditions, refund policy (privacy policy referenced within terms) | ✅ Built |
| AI itinerary generator | 🔒 Reserved placeholder (`/itinerary`, noindex) |
| Hotels | 🚧 Data/UI groundwork; not wired to TBO booking |

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** — SSR/SSG, file-based routing, route handlers for the API layer
- **Tailwind CSS v4** — brand design tokens in `src/app/globals.css` (`@theme`)
- **next/font** — Roboto (UI/body) + Dancing Script (script accent)
- **lucide-react** — SVG icon set (no emoji)
- **TBO (TekTravels) Air API** — flight search + booking (server-only)
- Deploy target: **Vercel**

> **Next.js 16 note:** APIs and conventions differ from older majors. See
> `AGENTS.md` — read `node_modules/next/dist/docs/` before writing framework code.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (type-check + static generation)
npm start        # serve the production build
npm run lint     # eslint (next core-web-vitals + typescript)
```

### Environment (`.env.local`, git-ignored — never commit)

Flight search/booking need TBO staging credentials. Without them the site still
builds and renders; flight pages just report fares as unavailable.

```bash
TBO_CLIENT_ID=...        # TBO client id
TBO_USERNAME=...         # TBO API username
TBO_PASSWORD=...         # TBO API password
TBO_END_USER_IP=...      # IP whitelisted with TBO (defaults to a staging IP)
# Optional: override the Book/Ticket service URL if TBO provisions AirBook.
# TBO_BOOK_URL=http://api.tektravels.com/BookingEngineService_AirBook/AirService.svc/rest
```

Reference credentials + endpoint notes live in `reference/api-setup/` — **git-ignored**.

## Routes

**Pages**
`/` · `/about` · `/services` · `/contact` · `/plan-my-trip` ·
`/packages` (+ `/packages/[category]` and `/packages/[category]/[slug]`) ·
`/flights` (live search results) · `/checkout` (booking) ·
`/login` · `/signup` · `/account` (demo auth) ·
`/terms` · `/refund-policy` · `/itinerary` (reserved) ·
plus `sitemap.xml`, `robots.txt`, `not-found`.

**API route handlers** (`src/app/api/`, all server-only, `runtime = "nodejs"`)
- `GET /api/flights` — live TBO search; accepts IATA codes **or** city/airport names
- `POST /api/quote` — FareRule + FareQuote; tells checkout which fields TBO demands
- `POST /api/book` — full booking flow (Book/Ticket up to 300s; `maxDuration = 300`)

## Project structure

```
src/
  app/                 routes (folder-per-page) + layout, sitemap, robots, not-found
    api/               flights (search), quote (FareQuote), book (booking) — server only
  components/
    layout/            Header, HeaderAuth, Footer, WhatsAppFloat
    sections/          Hero, SearchBar, Marquee, PageHero, CTABand, Testimonials, …
    ui/                Button, Icon, PackageCard, FlightCard, LiveFare, Reveal, Counter, …
    forms/             ContactForm, PlanTripForm, shared controls
    auth/              AuthScreen, AccountView  (demo auth UI)
    checkout/          CheckoutView, BookingForm (TBO passenger form)
  lib/
    tbo.ts             TBO client — auth + Search, normalized fares (server only)
    tbo-book.ts        TBO booking flow: FareRule→FareQuote→SSR→Book→Ticket→GetBookingDetails
    tbo-validate.ts    every TBO certification-checklist validation + normalizers
    auth.tsx           ⚠️ demo localStorage auth provider (useAuth)
    actions.ts         "use server" enquiry handler → Google Form
    googleForm.ts      Lead → Google Form field mapping
    cn.ts              className helper
  data/                ← EDIT CONTENT HERE
    site.ts            business info / NAP / nav (single source of truth)
    catalog/           11 real tour packages (domestic / international / cruise)
    itineraries/       lighter itinerary content
    packages.ts services.ts testimonials.ts accreditations.ts content.ts
    airports.ts airlineLogos.ts
public/brand/          logo (red + white), favicons, OG image
reference/             source material + TBO live creds/notes — git-ignored, NOT deployed
```

## Editing content

Copy/data is centralized in `src/data/` — no component changes needed:

- **Business info / contact / nav** → `src/data/site.ts`
- **Tour packages** (real itineraries) → `src/data/catalog/` (per-category files, wired in `catalog/index.ts`)
- **Services, testimonials, stats, accreditations** → their files in `src/data/`

## How the booking layer works

1. **Search** (`lib/tbo.ts`): caches a TBO auth token, POSTs a Search, normalizes
   raw results into `FlightOffer`s (per-adult fares, de-duped fare classes,
   cheapest-first). Results cache for 10 min — under TBO's 15-min `TraceId` window.
2. **Quote** (`/api/quote` → `quoteFare`): runs FareRule + FareQuote so the
   checkout form can ask for **exactly** the fields TBO requires (PAN, passport,
   GST, mandatory seat/meal) instead of guessing, and surface price changes.
3. **Book** (`/api/book` → `bookFlight`): validates passengers, applies free
   SSR (baggage/meal/seat), guards against duplicate bookings, runs the LCC
   (Ticket-only) or non-LCC (Book→Ticket) path, and — critically — on a timeout
   **never re-books**; it recovers via GetBookingDetails to avoid double charges.

`tbo-validate.ts` encodes TBO's full certification checklist (ErrorCode-6 token
refresh matched by *code* not message, TraceId expiry, title normalization,
PAN/passport/GST rules, special-fare seat+meal, duplicate guard). Reference:
<https://apidoc.tektravels.com/flight/apivalidation.aspx>.

## Before production launch

- **TBO:** complete production certification and switch endpoints/creds from staging.
- **Auth:** `lib/auth.tsx` is a client-side demo (localStorage, SHA-256, no server).
  Replace its internals with real server-side auth before taking payments — the
  `useAuth()` API is designed to stay the same.
- **Payments:** not integrated. Booking currently ticket on TBO's staging credit.
- **Business data:** verify `TODO`s in `src/data/site.ts` (GSTIN, socials, reviews URL, domain `url`).
- **Images:** marketing photos load from Unsplash (allowed in `next.config.ts`).
  Localize into `public/` for full performance control.

## SEO

Per-page metadata, canonical URLs, `TravelAgency` JSON-LD (`app/layout.tsx`),
generated `sitemap.ts` / `robots.ts`, and permanent 301/308 redirects from the
old `riseandshinetravel.com` `.html` tour URLs to the new catalogue pages
(`next.config.ts`, `LEGACY_TOUR_REDIRECTS`).
