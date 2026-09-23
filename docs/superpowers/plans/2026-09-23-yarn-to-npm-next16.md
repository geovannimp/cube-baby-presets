# Yarn → npm + Next.js 16 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline) or superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch the project from Yarn to npm and upgrade Next.js 12 → 16 (React 19) while keeping the Pages Router and working Supabase auth.

**Architecture:** Direct jump: reinstall with npm, bump core framework packages, replace `@supabase/supabase-auth-helpers` with `@supabase/ssr` + local browser/server clients and a thin `useUser` context, update service call sites to Supabase JS v2, then verify with typecheck/lint/build.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, npm, `@supabase/ssr`, `@supabase/supabase-js`, `next-i18next`, Tailwind 3, ESLint CLI

## Global Constraints

- Keep Pages Router (`src/pages`); do not add `app/`
- Package manager is npm only (`package-lock.json`; no `yarn.lock`)
- Next latest 16.x; React 19.x; TypeScript ≥ 5.1; Node ≥ 20.9
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- No new test framework (repo has none); gates are `typecheck`, `lint`, `build`
- Work on a feature branch, not `main`
- Commit after each completed task

---

## File map

| Path | Responsibility |
|---|---|
| `package.json` / `package-lock.json` | npm scripts + dependency versions |
| `yarn.lock` | DELETE |
| `next.config.js` | Drop `swcMinify`; keep `i18n` |
| `README.md` | npm-only getting started |
| `src/utils/supabase/client.ts` | Browser Supabase client |
| `src/utils/supabase/pages.ts` | Pages/API `createServerClient` with cookie adapters |
| `src/hooks/useUser.tsx` | Auth context + `useUser` replacing helpers |
| `src/pages/_app.tsx` | Wire new providers; drop old helpers; nprogress |
| `src/pages/api/auth/callback.ts` | OAuth/email code exchange |
| `src/pages/api/auth/logout.ts` | Sign out + redirect `/signin` |
| `src/pages/api/auth/[...supabase].ts` | DELETE (replaced) |
| `src/pages/account.tsx` | Manual session gate in GSSP |
| `src/services/*.ts` | Supabase JS v2 APIs |
| Consumers of `useUser` | Import from local hook |

---

### Task 1: Feature branch + npm switch + core upgrades

**Files:**
- Delete: `yarn.lock`
- Modify: `package.json`
- Create: `package-lock.json`
- Modify: `README.md`, `next.config.js`, `tsconfig.json` (as needed)

**Interfaces:**
- Produces: installable npm project with Next 16 / React 19 declared in `package.json`

- [ ] **Step 1: Create feature branch**

```bash
git checkout -b chore/npm-next16-upgrade
```

- [ ] **Step 2: Remove Yarn lock and node_modules**

```bash
rm -f yarn.lock
rm -rf node_modules
```

- [ ] **Step 3: Update `package.json` dependencies and scripts**

Set dependencies (use latest at install time via `npm install <pkg>@latest`):

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc -b ./",
    "i18n": "i18next 'src/**/*.{ts,tsx}' [-oc]"
  },
  "engines": {
    "node": ">=20.9.0",
    "npm": ">=10"
  }
}
```

Install core:

```bash
npm install next@latest react@latest react-dom@latest \
  @supabase/ssr@latest @supabase/supabase-js@latest \
  next-i18next@latest i18next@latest react-i18next@latest \
  nprogress@latest

npm install -D typescript@latest eslint@latest eslint-config-next@latest \
  @types/node@latest @types/react@latest @types/react-dom@latest \
  @types/nprogress@latest

npm uninstall @supabase/supabase-auth-helpers nextjs-progressbar
```

Bump remaining deps as needed so `npm install` completes without hard errors. Prefer latest majors that still support Pages Router.

- [ ] **Step 4: Update `next.config.js`**

```js
/** @type {import('next').NextConfig} */
const { i18n } = require("./next-i18next.config");

const nextConfig = {
  reactStrictMode: true,
  i18n,
};

module.exports = nextConfig;
```

- [ ] **Step 5: Update README Getting Started to npm-only**

Replace the yarn alternative with npm-only instructions.

- [ ] **Step 6: Verify lockfile exists and Next is 16.x**

```bash
test -f package-lock.json && ! test -f yarn.lock
node -p "require('./package.json').dependencies.next"
```

Expected: Next version string starts with `16.`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: switch to npm and upgrade Next to 16

EOF
)"
```

---

### Task 2: Supabase clients + `useUser` context

**Files:**
- Create: `src/utils/supabase/client.ts`
- Create: `src/utils/supabase/pages.ts`
- Create: `src/hooks/useUser.tsx`

**Interfaces:**
- Produces:
  - `createBrowserClient(): SupabaseClient`
  - `createPagesServerClient(context: { req: NextApiRequest | IncomingMessage; res: NextApiResponse | ServerResponse }): SupabaseClient`
  - `AuthProvider({ children })`
  - `useUser(): { user: User | null; isLoading: boolean; supabaseClient: SupabaseClient }`

- [ ] **Step 1: Create browser client**

```ts
// src/utils/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Create Pages/API server client**

```ts
// src/utils/supabase/pages.ts
import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";
import type { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";

type CookieContext = {
  req: { headers: { cookie?: string } };
  res: { appendHeader: (name: string, value: string) => void; setHeader: (name: string, value: string | number | string[]) => void };
};

export function createPagesServerClient(context: CookieContext) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(context.req.headers.cookie ?? "");
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) =>
            context.res.appendHeader(
              "Set-Cookie",
              serializeCookieHeader(name, value, options)
            )
          );
          Object.entries(headers).forEach(([key, value]) =>
            context.res.setHeader(key, value)
          );
        },
      },
    }
  );
}

export type { GetServerSidePropsContext, NextApiRequest, NextApiResponse };
```

- [ ] **Step 3: Create AuthProvider + useUser**

```tsx
// src/hooks/useUser.tsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "../utils/supabase/client";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  supabaseClient: SupabaseClient;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabaseClient = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabaseClient.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user);
      setIsLoading(false);
    });
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabaseClient]);

  const value = useMemo(
    () => ({ user, isLoading, supabaseClient }),
    [user, isLoading, supabaseClient]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useUser() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useUser must be used within AuthProvider");
  return ctx;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/utils/supabase src/hooks/useUser.tsx
git commit -m "$(cat <<'EOF'
feat: add supabase ssr clients and auth provider

EOF
)"
```

---

### Task 3: Wire `_app`, auth API routes, account gate

**Files:**
- Modify: `src/pages/_app.tsx`
- Create: `src/pages/api/auth/callback.ts`
- Create: `src/pages/api/auth/logout.ts`
- Delete: `src/pages/api/auth/[...supabase].ts`
- Modify: `src/pages/account.tsx`
- Modify: all files importing `@supabase/supabase-auth-helpers/react` `useUser`

**Interfaces:**
- Consumes: `AuthProvider`, `useUser`, `createPagesServerClient` from Task 2
- Produces: working auth wiring without the old helpers package

- [ ] **Step 1: Update `_app.tsx`**

Replace `UserProvider` / old `supabaseClient` with `AuthProvider`. Replace `nextjs-progressbar` with `nprogress` route events (or a tiny wrapper component). Keep QueryClient, ThemeProvider, Toaster, `appWithTranslation`.

- [ ] **Step 2: Auth callback route**

```ts
// src/pages/api/auth/callback.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "../../../utils/supabase/pages";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code;
  const next = typeof req.query.next === "string" ? req.query.next : "/";
  if (typeof code === "string") {
    const supabase = createPagesServerClient({ req, res });
    await supabase.auth.exchangeCodeForSession(code);
  }
  res.redirect(next);
}
```

- [ ] **Step 3: Auth logout route**

```ts
// src/pages/api/auth/logout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "../../../utils/supabase/pages";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createPagesServerClient({ req, res });
  await supabase.auth.signOut();
  res.redirect(302, "/signin");
}
```

- [ ] **Step 4: Delete `[...supabase].ts`**

- [ ] **Step 5: Replace `withPageAuth` on account page**

```ts
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createPagesServerClient(ctx);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { redirect: { destination: "/signin", permanent: false } };
  }
  const translations = await serverSideTranslations(
    ctx.locale!,
    ["common", "account"],
    nextI18nextConfig
  );
  return { props: translations };
};
```

- [ ] **Step 6: Retarget all `useUser` imports**

Change:

```ts
import { useUser } from "@supabase/supabase-auth-helpers/react";
```

to:

```ts
import { useUser } from "../hooks/useUser"; // adjust relative path per file
```

Files: `Header.tsx`, `signin.tsx`, `signup.tsx`, `account.tsx`, `presets/index.tsx`, `presets/[presetId].tsx`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat: wire auth provider and replace auth API routes

EOF
)"
```

---

### Task 4: Migrate services to Supabase JS v2

**Files:**
- Modify: `src/services/userService.ts`
- Modify: `src/services/presetService.ts`
- Modify: `src/services/modelService.ts` (if it uses supabase)

**Interfaces:**
- Consumes: `createClient()` browser client from Task 2
- Produces: services using v2 `data`/`error` shapes and current auth methods

- [ ] **Step 1: Update userService**

- Import `createClient` from `../utils/supabase/client` (module-level singleton or per-call).
- `signIn` → `signInWithPassword({ email, password })`; read `data.user`.
- `signUp` → `signUp({ email, password, options: { data: { username }, emailRedirectTo: getURL() } })`.
- Replace `.from<Profile>(...)` with `.from("profiles")` and type the `data`.
- Replace `.body` with `.data`.
- Fix `logout` to only throw on error (current code always throws).

- [ ] **Step 2: Update presetService**

Same `.from` / `.body` → `.data` pattern; use browser client.

- [ ] **Step 3: Update modelService if needed**

- [ ] **Step 4: Commit**

```bash
git add src/services
git commit -m "$(cat <<'EOF'
fix: migrate supabase services to js v2 client APIs

EOF
)"
```

---

### Task 5: Fix remaining breaks + verify green

**Files:**
- Modify: whatever `tsc` / `next build` / `eslint` report
- Possibly: `src/styles/globals.css` (nprogress CSS), ESLint flat/legacy config for ESLint 9+

**Interfaces:**
- Produces: passing `typecheck`, `lint`, `build`

- [ ] **Step 1: Run typecheck; fix all errors**

```bash
npm run typecheck
```

- [ ] **Step 2: Run lint; fix or adjust config**

```bash
npm run lint
```

If ESLint 9 requires flat config, add `eslint.config.mjs` extending `eslint-config-next` via the Next 16 lint migration pattern (`npx @next/codemod@canary next-lint-to-eslint-cli .` if helpful).

- [ ] **Step 3: Run production build**

```bash
npm run build
```

Expected: compile success (pages may warn without env at build time; must not hard-fail on compile errors).

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
fix: resolve next 16 upgrade typecheck lint and build errors

EOF
)"
```

---

## Plan self-review

1. **Spec coverage:** Package manager ✓, Next 16 + React 19 ✓, Pages Router ✓, supabase helpers replacement ✓, lint script ✓, swcMinify removal ✓, progress bar ✓, verification gates ✓
2. **Placeholders:** None intentional
3. **Type consistency:** `createPagesServerClient` / `useUser` / `AuthProvider` names match across tasks
