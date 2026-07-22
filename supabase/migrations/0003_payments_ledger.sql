-- Rise & Shine Travels — Razorpay reconciliation ledger
-- Run in the Supabase SQL Editor (or `supabase db push` with the CLI).
--
-- An independent money record, separate from the booking mirror in `bookings`. The
-- webhook (/api/payment/webhook) upserts every payment/refund event here so captured
-- money can be reconciled against issued tickets — e.g. a captured payment with no
-- ticketed booking is an orphan needing a manual refund. Written server-side with the
-- service-role key (bypasses RLS); customers never read it, so no client policy.

create table if not exists public.payments (
  razorpay_payment_id text primary key,
  razorpay_order_id   text,
  status              text not null,          -- captured | failed | refunded
  amount_inr          integer,
  method              text,                   -- upi | card | netbanking | …
  email               text,
  contact             text,
  trace_id            text,                   -- TBO TraceId, from order notes
  refunded_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists payments_order_idx  on public.payments (razorpay_order_id);
create index if not exists payments_status_idx on public.payments (status);

alter table public.payments enable row level security;
-- Service-role only (webhook writes, reconciliation reads). No client policy granted.
