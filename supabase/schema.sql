-- ============================================================
-- Bosstify — Supabase Schema
-- Run this in the Supabase SQL editor.
-- ============================================================

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  username text unique,
  balance numeric(10,4) not null default 0,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(split_part(new.email, '@', 1), ''),
      'user_' || substr(new.id::text, 1, 8)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- ORDERS ----------
create table if not exists public.orders (
  id bigserial primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  niva_order_id text,
  service_id integer not null,
  service_name text not null,
  link text not null,
  quantity integer not null check (quantity > 0),
  charge numeric(10,4) not null default 0 check (charge >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'cancelled', 'partial', 'refunded')),
  start_count integer not null default 0,
  remains integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can create own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create index if not exists orders_user_id_created_idx
  on public.orders (user_id, created_at desc);

create index if not exists orders_status_idx
  on public.orders (status);

-- ---------- TRANSACTIONS ----------
create table if not exists public.transactions (
  id bigserial primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('credit', 'debit')),
  amount numeric(10,4) not null check (amount >= 0),
  description text not null default '',
  created_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create index if not exists transactions_user_id_created_idx
  on public.transactions (user_id, created_at desc);

-- ---------- SERVICES CACHE ----------
create table if not exists public.services_cache (
  id integer primary key,
  name text not null,
  type text not null default '',
  category text not null default '',
  rate numeric(10,4) not null default 0,
  min integer not null default 0,
  max integer not null default 0,
  refill boolean not null default false,
  cancel boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.services_cache enable row level security;

-- Services list is public read-only for all visitors
create policy "Anyone can view services"
  on public.services_cache for select
  using (true);

-- ---------- FUND REQUESTS ----------
create table if not exists public.fund_requests (
  id bigserial primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric(10,4) not null check (amount > 0),
  method text not null check (method in ('upi', 'bank')),
  reference text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.fund_requests enable row level security;

create policy "Users can create fund requests"
  on public.fund_requests for insert
  with check (auth.uid() = user_id);

create policy "Users can view own fund requests"
  on public.fund_requests for select
  using (auth.uid() = user_id);

create index if not exists fund_requests_status_idx
  on public.fund_requests (status, created_at desc);
