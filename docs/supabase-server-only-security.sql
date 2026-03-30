alter table public.game_submissions enable row level security;

revoke all on table public.game_submissions from anon;
revoke all on table public.game_submissions from authenticated;

drop policy if exists "deny anon/authenticated select on game_submissions" on public.game_submissions;
create policy "deny anon/authenticated select on game_submissions"
on public.game_submissions
for select
to anon, authenticated
using (false);

drop policy if exists "deny anon/authenticated insert on game_submissions" on public.game_submissions;
create policy "deny anon/authenticated insert on game_submissions"
on public.game_submissions
for insert
to anon, authenticated
with check (false);

drop policy if exists "deny anon/authenticated update on game_submissions" on public.game_submissions;
create policy "deny anon/authenticated update on game_submissions"
on public.game_submissions
for update
to anon, authenticated
using (false)
with check (false);

drop policy if exists "deny anon/authenticated delete on game_submissions" on public.game_submissions;
create policy "deny anon/authenticated delete on game_submissions"
on public.game_submissions
for delete
to anon, authenticated
using (false);
