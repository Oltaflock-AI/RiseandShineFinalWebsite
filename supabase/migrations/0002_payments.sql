-- Rise & Shine Travels — Razorpay payment mirror on bookings
-- Run in the Supabase SQL Editor (or `supabase db push` with the CLI).
--
-- TBO stays the source of truth for the ticket and Razorpay for the money; these
-- columns are a convenience mirror on the existing bookings row (see
-- lib/booking-history.ts). Written server-side with the service-role key, so no
-- extra RLS policy is needed — the SELECT policy from 0001 already covers reads.

alter table public.bookings
  add column if not exists razorpay_order_id   text,
  add column if not exists razorpay_payment_id text,
  add column if not exists amount_paid_inr      integer;

-- Look up a booking by its Razorpay payment (e.g. reconciling a webhook/refund).
create index if not exists bookings_rzp_payment_idx
  on public.bookings (razorpay_payment_id);
