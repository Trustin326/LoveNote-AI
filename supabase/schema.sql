-- LoveNote V2 tables
create table if not exists public.lovenote_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default false,
  plan text not null default 'starter',
  expires_at timestamptz null,
  source text null,
  updated_at timestamptz not null default now()
);

create table if not exists public.lovenote_events (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.lovenote_entitlements enable row level security;
alter table public.lovenote_events enable row level security;

-- Entitlements: users can read their own; only service role writes.
create policy "entitlements_read_own" on public.lovenote_entitlements
for select
to authenticated
using (auth.uid() = user_id);

-- Events: users write + read their own
create policy "events_write_own" on public.lovenote_events
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "events_read_own" on public.lovenote_events
for select
to authenticated
using (auth.uid() = user_id);
