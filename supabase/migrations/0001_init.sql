-- Rise & Shine Travels — customer accounts schema
-- Run in the Supabase SQL Editor (or `supabase db push` with the CLI).
--
-- Model: auth.users (Supabase-managed) is the identity. Everything else hangs
-- off it and is protected by Row Level Security so a customer can only ever
-- see or change their OWN rows. The mirrors of TBO's booking result live in
-- `bookings` / `passengers` for a booking history once we persist tickets.

-- ─────────────────────────────────────────────────────────────────────────────
-- profiles — 1:1 with auth.users, auto-created on signup
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  phone      text,
  gstin      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: owner can read"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles: owner can insert"
  on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: owner can update"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-provision a profile whenever a new auth user is created. `full_name`
-- comes from the signup metadata set by lib/auth.tsx (options.data.full_name).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- travellers — saved passenger profiles, for one-tap checkout prefills
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.travellers (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  title           text,
  first_name      text not null,
  last_name       text not null,
  pax_type        smallint not null default 1, -- 1 Adult, 2 Child, 3 Infant (TBO)
  gender          smallint,                    -- 1 Male, 2 Female (TBO)
  dob             date,
  pan             text,
  passport_no     text,
  passport_expiry date,
  created_at      timestamptz not null default now()
);

create index if not exists travellers_user_id_idx on public.travellers (user_id);
alter table public.travellers enable row level security;

create policy "travellers: owner all"
  on public.travellers for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- bookings — mirror of a confirmed TBO booking (see lib/tbo-book BookingResult)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  pnr              text,
  booking_id       bigint,          -- TBO BookingId
  trace_id         text,
  origin           text not null,
  destination      text not null,
  depart_date      date,
  return_date      date,
  airline_code     text,
  flight_number    text,
  is_lcc           boolean,
  is_international  boolean,
  status           smallint,        -- TBO itinerary Status (5 = ticketed)
  fare_inr         integer,
  invoice_no       text,
  ticket_numbers   text[],
  created_at       timestamptz not null default now()
);

create index if not exists bookings_user_id_idx on public.bookings (user_id);
alter table public.bookings enable row level security;

-- Customers read their own bookings. Inserts are done server-side with the
-- service-role key (which bypasses RLS) from the booking flow — so no client
-- insert/update policy is granted here on purpose.
create policy "bookings: owner can read"
  on public.bookings for select using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- passengers — the travellers on a specific booking
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.passengers (
  id              uuid primary key default gen_random_uuid(),
  booking_id      uuid not null references public.bookings (id) on delete cascade,
  title           text,
  first_name      text,
  last_name       text,
  pax_type        smallint,
  gender          smallint,
  dob             date,
  pan             text,
  passport_no     text,
  passport_expiry date,
  ticket_number   text,
  is_lead         boolean default false
);

create index if not exists passengers_booking_id_idx on public.passengers (booking_id);
alter table public.passengers enable row level security;

-- A passenger row is visible only if its parent booking belongs to the caller.
create policy "passengers: via owned booking"
  on public.passengers for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = passengers.booking_id and b.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- enquiries — optional record of a logged-in customer's website enquiries
-- (leads still flow to the agency Google Form; this is for the account view)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete set null,
  package_key text,
  destination text,
  message     text,
  created_at  timestamptz not null default now()
);

create index if not exists enquiries_user_id_idx on public.enquiries (user_id);
alter table public.enquiries enable row level security;

create policy "enquiries: owner can read"
  on public.enquiries for select using (auth.uid() = user_id);
create policy "enquiries: owner can insert"
  on public.enquiries for insert with check (auth.uid() = user_id);
