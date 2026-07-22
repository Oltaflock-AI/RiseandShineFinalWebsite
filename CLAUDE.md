@AGENTS.md

# Rise & Shine Travels — agent guide

Marketing site + a real **TBO (TekTravels) flight booking** layer for an
Ahmedabad travel agency. **Next.js 16 App Router, React 19, TypeScript, Tailwind
v4.** Deploy target: Vercel. `@/*` → `src/*`.

`AGENTS.md` (imported above) is binding: **Next.js 16 has breaking changes vs.
older majors — check `node_modules/next/dist/docs/` before writing framework code.**

## Architecture

- **`src/app/`** — routes (folder-per-page) + `layout.tsx` (fonts, metadata, JSON-LD,
  `AuthProvider`, Header/Footer/WhatsApp). `api/` holds server-only route handlers.
- **`src/components/`** — `layout/` · `sections/` · `ui/` · `forms/` · `auth/` · `checkout/`.
- **`src/lib/`** — the TBO integration + auth + form actions (see below).
- **`src/data/`** — **all copy/content lives here.** Change content by editing data,
  not components.

### The TBO booking layer (`src/lib/`) — server only

| File | Responsibility |
|------|----------------|
| `tbo.ts` | Auth token cache + **Search**; normalizes raw TBO results → `FlightOffer` (per-adult fares, de-dupe, cheapest-first). 10-min result cache. |
| `tbo-book.ts` | Booking flow: FareRule → FareQuote → SSR → **Book/Ticket** → GetBookingDetails. LCC = Ticket-only; non-LCC = Book→Ticket. |
| `tbo-validate.ts` | The whole TBO certification checklist: PAN/passport/GST, title normalization, special-fare seat+meal, duplicate guard, per-pax fare split. |

API handlers are thin: `GET /api/flights` (search), `POST /api/quote` (FareQuote →
which fields the form needs), `POST /api/book` (booking). All are
`runtime = "nodejs"`, `dynamic = "force-dynamic"`; book is `maxDuration = 300`.

## Rules that will bite you if ignored

- **Never import `tbo*.ts` from a client component.** They read credentials from
  `process.env` and call TBO server-side. Reach them only through `/api/*`.
- **TraceId expires 15 min after Search.** The search cache TTL (10 min) is
  deliberately under that. Don't lengthen it — a stale TraceId fails at Book.
- **Match TBO errors by `ErrorCode`, not message text** (esp. code 6 = invalid
  token → refresh + retry once). This is the checklist's explicit rule.
- **Book/Ticket are NEVER auto-retried.** On timeout, recover via
  `GetBookingDetails` (`recoverFromTimeout`), never re-book — a retry double-charges.
- **`lib/auth.tsx` is a DEMO** — client-side localStorage, SHA-256, not secure. Fine
  for the login/booking-gate UX; swap its internals for real server auth before
  payments. Keep the `useAuth()` API stable.
- **Enquiry forms** post server-side to the agency's Google Form (`lib/actions.ts`
  + `lib/googleForm.ts`) — that's the lead pipeline; no CRM/email yet (marked TODO).

## Conventions

- **TypeScript strict.** Icons via `lucide-react` (no emoji). Classes via `cn()` (`lib/cn.ts`).
- **Business info is single-source in `src/data/site.ts`** (NAP, phones, socials, nav,
  reviews) — consumed by header, footer, contact, and layout JSON-LD.
- **Tour packages** live in `src/data/catalog/` (per-category files → `catalog/index.ts`);
  add/edit tours there. Legacy `.html` tour URLs 301 to catalogue pages via
  `LEGACY_TOUR_REDIRECTS` in `next.config.ts` — keep those in sync when slugs change.
- **Env** (`.env.local`, git-ignored): `TBO_CLIENT_ID`, `TBO_USERNAME`,
  `TBO_PASSWORD`, `TBO_END_USER_IP`, optional `TBO_BOOK_URL`. No creds in code or commits.
- **`reference/` is git-ignored** and holds live TBO creds/notes — never surface or commit it.

## Verify changes

`npm run lint` and `npm run build` (build type-checks + static-generates). No test
suite yet. The site builds without TBO creds — flight features degrade gracefully.
