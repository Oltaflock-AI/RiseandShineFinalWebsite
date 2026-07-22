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
| `razorpay.ts` | Payments (server only): create order, verify checkout + webhook signatures (HMAC), fetch/confirm capture, refund. Raw REST + `node:crypto` — no SDK. |
| `booking-request.ts` | Parse/normalize an incoming booking body → `BookingRequest` (title normalization, casing). Shared by `/api/payment/order` and `/api/book`. |
| `payments-ledger.ts` | Reconciliation ledger writer — upserts the `payments` table from the webhook (service-role). |

API handlers are thin: `GET /api/flights` (search), `POST /api/quote` (FareQuote →
which fields the form needs), `POST /api/payment/order` (**validate** + Razorpay order
for the FareQuote total), `POST /api/book` (verify payment → booking),
`POST /api/payment/webhook` (Razorpay events → ledger). All are `runtime = "nodejs"`,
`dynamic = "force-dynamic"`; book is `maxDuration = 300`, order is `120`.

### Payments (`src/lib/razorpay.ts` + `/api/payment/*`)

**Razorpay**, capture-then-fulfill. On "Pay": `/api/payment/order` runs the FULL
pre-ticket flow (`validateBooking` in tbo-book: FareRule → FareQuote → all checklist
validations → SSR → duplicate guard) **before** opening an order, so a booking TBO
would reject fails **before the card is charged**. The order amount is TBO's re-priced
FareQuote total (**never a client number**). The browser opens Razorpay Checkout
(`checkout.js`); on success `/api/book` verifies the signature + re-fetches the payment
to confirm it's **captured** before any TBO call, then tickets. **If ticketing fails
after capture, the payment is auto-refunded** in `/api/book`. `bookFlight` and
`validateBooking` share `prepareBooking`, so pre-charge and ticketing run identical
checks. Payment is enforced only when `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` are set;
without them, booking degrades to the legacy direct-ticket path (dev/staging).

`/api/payment/webhook` (verified against `RAZORPAY_WEBHOOK_SECRET` over the **raw**
body) records payment.captured/failed + refund.processed into the `payments` ledger
(migration `0003`) for reconciliation — independent of the browser callback. `bookings`
also mirrors `razorpay_order_id`/`razorpay_payment_id`/`amount_paid_inr` (migration `0002`).

### Auth (`src/lib/supabase/` + `src/lib/auth.tsx`)

**Supabase Auth** (email + password). `lib/supabase/client.ts` = browser client
(singleton, anon key), `server.ts` = server client (async `cookies()`, has
`getUser()`). `lib/auth.tsx` wraps the browser client behind the stable
`useAuth()` API (`user`/`ready`/`login`/`signup`/`logout`) so Header/AuthScreen/
AccountView are untouched. `src/proxy.ts` (Next 16's renamed middleware) refreshes
the session and gates `/account`. `app/auth/callback/route.ts` exchanges the
email-confirm/OAuth code. Schema + RLS: `supabase/migrations/0001_init.sql`.

## Rules that will bite you if ignored

- **Never import `tbo*.ts` from a client component.** They read credentials from
  `process.env` and call TBO server-side. Reach them only through `/api/*`.
- **TraceId expires 15 min after Search.** The search cache TTL (10 min) is
  deliberately under that. Don't lengthen it — a stale TraceId fails at Book.
- **Match TBO errors by `ErrorCode`, not message text** (esp. code 6 = invalid
  token → refresh + retry once). This is the checklist's explicit rule.
- **Book/Ticket are NEVER auto-retried.** On timeout, recover via
  `GetBookingDetails` (`recoverFromTimeout`), never re-book — a retry double-charges.
- **Auth is Supabase, but keep `useAuth()`'s shape stable** — consumers depend on
  `{ user:{name,email}, ready, login, signup, logout }`. On the **server**, verify
  with `supabase.auth.getUser()`, never `getSession()`. Client writes must respect
  RLS; only server code with the service-role key may write `bookings`.
- **Next 16 renamed `middleware` → `proxy`.** The file is `src/proxy.ts`, exports
  `proxy()`, runs on the **Node.js** runtime (edge unsupported). Don't recreate a
  `middleware.ts`. Confirm framework conventions in `node_modules/next/dist/docs/`.
- **Enquiry forms** post server-side to the agency's Google Form (`lib/actions.ts`
  + `lib/googleForm.ts`) — that's the lead pipeline; no CRM/email yet (marked TODO).

## Conventions

- **TypeScript strict.** Icons via `lucide-react` (no emoji). Classes via `cn()` (`lib/cn.ts`).
- **Business info is single-source in `src/data/site.ts`** (NAP, phones, socials, nav,
  reviews) — consumed by header, footer, contact, and layout JSON-LD.
- **Tour packages** live in `src/data/catalog/` (per-category files → `catalog/index.ts`);
  add/edit tours there. Legacy `.html` tour URLs 301 to catalogue pages via
  `LEGACY_TOUR_REDIRECTS` in `next.config.ts` — keep those in sync when slugs change.
- **Env** (`.env.local`, git-ignored; template in `.env.local.example`):
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (+ server-only
  `SUPABASE_SERVICE_ROLE_KEY`), `TBO_CLIENT_ID`, `TBO_USERNAME`,
  `TBO_PASSWORD`, `TBO_END_USER_IP`, optional `TBO_BOOK_URL`, and server-only
  `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`. Everything reads
  without them (features degrade); no creds in code or commits.
- **`reference/` is git-ignored** and holds live TBO creds/notes — never surface or commit it.

## Verify changes

`npm run lint` and `npm run build` (build type-checks + static-generates). No test
suite yet. The site builds without TBO creds — flight features degrade gracefully.
