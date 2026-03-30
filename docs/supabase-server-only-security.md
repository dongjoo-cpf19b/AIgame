# Supabase Server-Only Security

This project writes `public.game_submissions` from the server route only:

- `app/api/submit/route.ts`
- `SUPABASE_SERVICE_ROLE_KEY`

That means browser clients should not read or write `game_submissions` directly.

## Apply

1. Open the Supabase dashboard.
2. Go to `SQL Editor`.
3. Run [`supabase-server-only-security.sql`](C:/Users/Owner/AIgame-repo/docs/supabase-server-only-security.sql).

## Result

- RLS stays enabled.
- `anon` and `authenticated` cannot `select`, `insert`, `update`, or `delete`.
- The Next.js server can still write using the service role key.

## Important

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend.
- Do not rename it to a `NEXT_PUBLIC_*` variable.
- If the key was ever exposed, rotate it in Supabase immediately.
