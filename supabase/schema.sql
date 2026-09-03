create extension if not exists pgcrypto;

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  clues_collected integer not null default 0 check (clues_collected between 0 and 10),
  report_clues integer check (report_clues between 0 and 10),
  correct_answers integer check (correct_answers between 0 and 5),
  grade text,
  messenger_hints integer not null default 0 check (messenger_hints >= 0),
  phone_hints integer not null default 0 check (phone_hints >= 0)
);

create table if not exists public.raffle_entries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  participant_name text not null check (char_length(trim(participant_name)) between 1 and 50),
  affiliation text not null check (char_length(trim(affiliation)) between 1 and 100),
  phone_digits text not null unique check (phone_digits ~ '^010[0-9]{8}$'),
  consented_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  is_winner boolean not null default false
);

create index if not exists idx_game_sessions_completed_at on public.game_sessions(completed_at);
create index if not exists idx_raffle_entries_created_at on public.raffle_entries(created_at);

alter table public.game_sessions enable row level security;
alter table public.raffle_entries enable row level security;

revoke all on public.game_sessions from anon, authenticated;
revoke all on public.raffle_entries from anon, authenticated;

grant insert, update on public.game_sessions to anon, authenticated;
grant insert on public.raffle_entries to anon, authenticated;

create policy "public_can_start_game"
on public.game_sessions
for insert
to anon, authenticated
with check (true);

create policy "public_can_update_game"
on public.game_sessions
for update
to anon, authenticated
using (true)
with check (true);

create policy "public_can_enter_raffle"
on public.raffle_entries
for insert
to anon, authenticated
with check (true);
