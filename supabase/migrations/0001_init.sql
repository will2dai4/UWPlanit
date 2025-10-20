-- -----------------------------------------------------------------------------
-- 0001_init.sql — initial schema for UWGraph
-- -----------------------------------------------------------------------------

-- Courses table stores canonical course data imported nightly
create table if not exists public.courses (
  id text primary key,
  code text not null,
  name text not null,
  description text default '',
  units numeric default 0.5,
  prerequisites text[] default '{}',
  corequisites text[] default '{}',
  antirequisites text[] default '{}',
  terms text[] default '{}',
  department text not null,
  level integer not null,
  inserted_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- Users extras — marketing opt-in flag                          (auth schema)
-- -----------------------------------------------------------------------------
alter table if exists auth.users
  add column if not exists marketing_opt_in boolean default false;

-- -----------------------------------------------------------------------------
-- Parse failure log                                                         🐞
-- -----------------------------------------------------------------------------
create table if not exists public.parse_failures (
  id serial primary key,
  raw_text text,
  note text,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- Referral codes                                                            📣
-- -----------------------------------------------------------------------------
create table if not exists public.referrals (
  code text primary key,
  referrer_uuid uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- Row-Level Security policies                                               🔒
-- -----------------------------------------------------------------------------
-- Courses: world-readable (anon), no inserts/updates via public role
alter table public.courses enable row level security;
create policy "Public read courses" on public.courses
  for select using (true);

-- Referrals: owners manage their own codes (authenticated users)
alter table public.referrals enable row level security;
create policy "Authenticated manage referrals" on public.referrals
  for all to authenticated
  using (auth.uid() = referrer_uuid); 