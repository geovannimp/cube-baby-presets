# Yarn → npm + Next.js 16 Upgrade Design

**Date:** 2026-09-23  
**Status:** Approved (Approach 1 — direct jump; option B — Pages Router kept)  
**User review:** Waived unless blockers

## Goals

1. Replace Yarn with npm (`yarn.lock` → `package-lock.json`; docs/scripts npm-only).
2. Upgrade to latest Next.js (**16.x**) while keeping the **Pages Router** (`src/pages`).
3. App must install, typecheck, lint, and production-build on Node **≥ 20.9** (local: Node 22).

## Non-goals

- App Router migration
- Visual redesign / Tailwind v4 redesign unless required for the build
- Rewriting product features beyond what the upgrade forces
- Database schema / RLS policy changes

## Package manager

- Remove `yarn.lock`; reinstall with `npm install` to produce `package-lock.json`.
- No Yarn config files present to remove.
- Update README Getting Started to npm-only (drop `yarn dev`).
- Optional: `engines` in `package.json` (`node >= 20.9`, `npm >= 10`).

## Framework & dependency stack

### Core

| Package | Target |
|---|---|
| `next` | latest 16.x |
| `eslint-config-next` | match `next` |
| `react` / `react-dom` | 19.x |
| `typescript` | 5.x (≥ 5.1) |
| `@types/react`, `@types/react-dom`, `@types/node` | match React/Node |

### Config / tooling for Next 16

- Remove obsolete `swcMinify` from `next.config.js` (default).
- Keep Pages Router `i18n` via `next-i18next` + existing `next-i18next.config.js`.
- Replace `next lint` with ESLint CLI (`eslint .` or project-equivalent); keep `eslint-config-next`.
- Use `@next/codemod` where helpful; finish remaining breaks by hand.

### Related libraries

- Bump for compatibility: `next-i18next` (+ `i18next` / `react-i18next` peers), `@tanstack/react-query`, form/UI stack, Tailwind/PostCSS as needed so install/build succeed.
- Replace unmaintained `nextjs-progressbar` with a Pages-compatible progress bar (e.g. `nprogress` wired in `_app`) if it breaks on React 19.

## Auth / Supabase migration

Deprecated `@supabase/supabase-auth-helpers` must be removed. Replace with `@supabase/ssr` + `@supabase/supabase-js`.

### New helpers

Create thin local clients under `src/utils/supabase/` (or `src/lib/supabase/`):

- **Browser client** — `createBrowserClient` for client components / services
- **Pages/API server client** — `createServerClient` with req/res cookie adapters for `getServerSideProps` and API routes

Env vars: use standard `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same names the old helpers expected).

### Behavior mapping

| Today | After |
|---|---|
| `UserProvider` + `useUser()` | Browser client + small React hook/context via `onAuthStateChange` |
| `withPageAuth` on `/account` | `getServerSideProps` that checks session and redirects to `/signin` |
| `pages/api/auth/[...supabase]` `handleAuth` | Explicit auth API routes (callback / logout) using the server client; preserve `returnTo: /signin` and long-lived cookies where the new cookie model allows |
| Service `supabaseClient` imports | Browser client for client-side calls; server client on the server |

### Call-site API updates expected

- `auth.signIn` → `auth.signInWithPassword`
- `.from<T>()` generics / `.body` responses → current Supabase JS v2 `data` shape
- Auth callback / logout routes rewritten to `@supabase/ssr` cookie clients

Product flows (email/password sign-in/up, account gate, sign-out) stay the same.

## Architecture (Pages Router unchanged)

```
src/pages/          # routes, GSSP/GSP, API routes
src/components/     # UI
src/hooks/          # React Query + auth consumer hooks
src/services/       # Supabase data/auth service functions
src/utils/supabase/ # NEW: browser + server client factories
```

No `app/` directory. Providers remain in `_app.tsx` (QueryClient, theme, toaster, auth context, progress bar, i18n HOC).

## Verification

1. Fresh install: remove `node_modules` + `yarn.lock`, `npm install` → lockfile only
2. `npm run typecheck`
3. `npm run lint` (ESLint CLI)
4. `npm run build`
5. Smoke if env available: home, presets list/detail, sign-in/up, account gate, theme, i18n

## Success criteria

- No Yarn artifacts in the repo
- Next 16 + React 19 resolved via npm lockfile
- Pages Router structure preserved
- Auth still protects `/account` and supports sign-in/up/out
- Typecheck, lint, and production build pass

## Risks & acceptances

- Supabase client API shape differences require call-site updates
- Peer dependency warnings acceptable if install/build succeed
- No in-repo CI; local scripts are the gate
