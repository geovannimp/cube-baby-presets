# Cube Baby Presets

A Next.js app for sharing presets for the Cube Baby pedal.

## Requirements

- Node.js >= 20.9.0, npm >= 10 (see `engines` in `package.json`)
- Supabase CLI 2.118.0 — invoked through the `db:*` scripts, so no global install
- Docker — only needed for the local Supabase stack (`npm run db:start`)

## Setup

```bash
npm install
cp .env.example .env.local
npm run db:start          # boots Postgres, GoTrue, PostgREST + Studio via Docker
```

`db:start` applies every migration in `supabase/migrations/` and then
`supabase/seed.sql`. When it finishes, run:

```bash
npm run db:status
```

Copy the **API URL** and **anon key** it prints into `.env.local` (they default
to the placeholder values already in `.env.example`), then:

```bash
npm run dev
```

The app is at [http://localhost:3000](http://localhost:3000), Supabase Studio at
[http://127.0.0.1:54323](http://127.0.0.1:54323), and the local email catcher
(which intercepts confirmation emails instead of sending them) at
[http://127.0.0.1:54324](http://127.0.0.1:54324).

`supabase/config.toml` already sets `auth.site_url` and
`auth.additional_redirect_urls` to `http://localhost:3000` to match
`getURL()` in `src/utils/helpers.ts`. If you serve the app on a different port,
change both.

### Using a hosted Supabase project instead

If you don't have Docker, point the app at a real Supabase project instead:

```bash
npx supabase login                                   # once per machine
npx supabase link --project-ref <ref>                # prompts for the DB password
npx supabase db push                                 # applies supabase/migrations/*
```

Then set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in
`.env.local` from Project Settings → API. On a hosted project, also add your
deploy URL to Authentication → URL Configuration → Redirect URLs, otherwise the
PKCE callback in `src/pages/api/auth/callback.ts` is rejected.

## Database workflow

`supabase/migrations/*.sql` is the source of truth. The hosted project is a
deployment target, not the place to edit schema by hand.

| Command | What it does |
| --- | --- |
| `npm run db:start` | Start the local stack, applying all migrations + seed |
| `npm run db:stop` | Stop the local stack |
| `npm run db:status` | Print local credentials and service status |
| `npm run db:reset` | Drop and rebuild the local DB from migrations + seed |
| `npm run db:link` | Link this directory to a hosted project |
| `npm run db:diff -f <name>` | Generate a migration from the local DB vs. a shadow built from `supabase/migrations` |
| `npm run db:push` | Apply pending migrations to the linked project |
| `npm run db:pull` | Pull the linked project's current schema into a new migration |

### Changing the schema

`db:diff` compares your **running local database** against a **shadow database
rebuilt from `supabase/migrations`** — so make the change locally first, then
capture it as a migration:

```bash
npm run db:start
# apply the change by hand in Studio (http://127.0.0.1:54323) or over psql
npm run db:diff -f add_preset_favorites   # writes supabase/migrations/<ts>_add_preset_favorites.sql
# review the SQL, then:
npm run db:push                           # apply to the linked project
```

Commit the generated migration in the same PR as the code that needs it. This
step needs Docker, since the diff runs against the local stack.

If you changed the schema directly in the hosted dashboard instead, capture it
with `npm run db:diff -- --linked -f <name>`, which diffs against the linked
project and needs no Docker.

### Schema changes and RLS

All data access in this app goes through the browser with the anon key
(`src/utils/supabase/client.ts`), so **RLS is the only security boundary** — there
is no server-side layer filtering rows. Before tightening any policy, check
these call sites, which intentionally read across users:

- `getPresetAuthors` (`src/services/presetService.ts`) selects
  `user_id, user: user_id (id, username)` from `presets` with no filter, to
  populate the author filter on the presets page.
- `getPresets` with no `userId` returns every preset, newest first.
- `createPreset` / `updatePreset` / `deletePreset` do
  `.insert().select(...).single()`, so the returning clause re-reads `profiles`
  through the `presets.user_id` FK in the same request. If `profiles` isn't
  SELECT-able by the inserting role, writes fail even though the insert itself
  is permitted.

Signups pass `username` as signup metadata
(`options.data.username` in `src/services/userService.ts`), so a database
trigger must copy it from `raw_user_meta_data` into `profiles` on
`auth.users` insert. Without that trigger every new signup fails its profile
lookup. It is included in the migrations.

Preset votes are denormalised: `presets.vote_up_count`, `presets.vote_down_count`
and `presets.vote_score` (likes - dislikes) are maintained by the
`on_preset_vote_sync_tallies` trigger from
`supabase/migrations/20260926120000_preset_votes.sql`, so the presets list can
sort by them in a single request. `vote_score` is a materialised column because
PostgREST cannot `order` by an expression. That trigger is `SECURITY DEFINER` on
purpose — the tally write targets `presets`, whose RLS only lets the owner edit a
row, while the vote belongs to whoever cast it. Dropping the definer right makes
every vote on someone else's preset fail to save.

The `preset_votes` insert/update policies also reject votes on the voter's
own presets, so self-approval is impossible even with a hand-rolled REST
call — the browser talks to PostgREST with the anon key, so the policy is
the only place that rule can be enforced. Withdraw (`DELETE`) stays
unrestricted so nobody is stuck with a vote they cannot take back.

## Deploying to Vercel

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as project
environment variables, and add the Vercel domain to the Supabase redirect URL
allowlist. Then apply migrations from CI or a local machine with
`npm run db:push` — Vercel does not run them.
