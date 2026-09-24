# Presets Server Filters & Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move preset list filters and pagination into Supabase queries with `page` + `asOf`, and share grid/pagination UI via `PresetsList`.

**Architecture:** Extend `PresetService.getPresets` to accept filters/`page`/`pageSize`/`asOf` and return `{ presets, totalCount }`. Add `getPresetAuthors` for the user dropdown. Pages own filters + `nuqs`; `PresetsList` owns grid + prev/next.

**Tech Stack:** Next.js pages router, Supabase JS client, TanStack Query v4, nuqs, existing shadcn UI.

## Global Constraints

- Default `pageSize` is `48`; home uses `3`.
- Pagination uses offset/`page`, not keyset cursors.
- Snapshot via `asOf`: `created_at <= asOf`; delete drift accepted.
- `PresetsList` must not render filters.
- Spec: `docs/superpowers/specs/2026-09-24-presets-server-pagination-design.md`

---

### Task 1: Extend PresetService

**Files:**
- Modify: `src/services/presetService.ts`

**Interfaces:**
- Produces:
  - `GetPresetsOptions` with `search?`, `modelId?`, `userId?`, `page?`, `pageSize?`, `asOf?`
  - `GetPresetsResult = { presets: Preset[]; totalCount: number }`
  - `getPresets(options?): Promise<GetPresetsResult>`
  - `getPresetAuthors(): Promise<{ id: string; username: string }[]>`
  - `PresetService` exports both

- [ ] **Step 1: Update types and `getPresets`**

Replace `GetPresetsOptions` / `getPresets` with:

```ts
export interface GetPresetsOptions {
  userId?: string;
  modelId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  asOf?: string;
}

export interface GetPresetsResult {
  presets: Preset[];
  totalCount: number;
}

const DEFAULT_PAGE_SIZE = 48;

const getPresets = async ({
  userId,
  modelId,
  search,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  asOf,
}: GetPresetsOptions = {}): Promise<GetPresetsResult> => {
  const from = (Math.max(page, 1) - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = getSupabase()
    .from("presets")
    .select(PRESET_SELECT, { count: "exact" });

  if (userId) query = query.eq("user_id", userId);
  if (modelId) query = query.eq("model_id", modelId);
  if (asOf) query = query.lte("created_at", asOf);
  if (search?.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(`name.ilike.${term},description.ilike.${term}`);
  }

  const { error, data: presets, count } = await query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  if (presets) {
    return {
      presets: presets as unknown as Preset[],
      totalCount: count ?? presets.length,
    };
  }

  throw error ?? new Error("Failed to load presets");
};
```

Note: if `ilike` values with commas/special chars break `.or()`, escape or use quoted filter syntax per PostgREST (`name.ilike."%…%"`). Prefer wrapping the pattern in double quotes if needed.

- [ ] **Step 2: Add `getPresetAuthors`**

```ts
const getPresetAuthors = async (): Promise<
  { id: string; username: string }[]
> => {
  const { error, data } = await getSupabase()
    .from("presets")
    .select("user_id, user: user_id ( id, username )");

  if (!data) throw error ?? new Error("Failed to load preset authors");

  const byId = new Map<string, { id: string; username: string }>();
  for (const row of data) {
    if (!row.user_id || byId.has(row.user_id)) continue;
    const profile = Array.isArray(row.user) ? row.user[0] : row.user;
    byId.set(row.user_id, {
      id: row.user_id,
      username: profile?.username?.trim() || row.user_id,
    });
  }
  return [...byId.values()];
};
```

Export on `PresetService`.

- [ ] **Step 3: Typecheck service**

Run: `npm run typecheck`  
Expected: errors only in callers still expecting `Preset[]` from `getPresets` (fixed in Task 2).

- [ ] **Step 4: Commit**

```bash
git add src/services/presetService.ts
git commit -m "feat: add server filters, page, and asOf to getPresets"
```

---

### Task 2: Update hooks

**Files:**
- Modify: `src/hooks/usePresets.ts`
- Create: `src/hooks/usePresetAuthors.ts`

**Interfaces:**
- Consumes: `GetPresetsOptions`, `GetPresetsResult`, `PresetService.getPresetAuthors`
- Produces: `usePresets(options?)` returning react-query result of `GetPresetsResult`; `usePresetAuthors()`

- [ ] **Step 1: Update `usePresets`**

```ts
export const usePresets = (options?: GetPresetsOptions) => {
  return useQuery(
    [
      "presets",
      options?.userId,
      options?.modelId,
      options?.search,
      options?.page,
      options?.pageSize,
      options?.asOf,
    ],
    async () => PresetService.getPresets(options)
  );
};
```

- [ ] **Step 2: Add `usePresetAuthors`**

```ts
export const usePresetAuthors = () => {
  return useQuery(["preset-authors"], () => PresetService.getPresetAuthors());
};
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/usePresets.ts src/hooks/usePresetAuthors.ts
git commit -m "feat: wire usePresets options and usePresetAuthors"
```

---

### Task 3: Create `PresetsList`

**Files:**
- Create: `src/components/PresetsList.tsx`

**Interfaces:**
- Consumes: `Preset`, `PresetCard`, pagination i18n keys under namespace passed via props or `useTranslation("presets")`
- Produces: `PresetsList` component

- [ ] **Step 1: Implement component**

Props:

```ts
type PresetsListProps = {
  presets: Preset[];
  models?: { id: string; name: string }[];
  isLoading: boolean;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  emptyTitle: string;
};
```

Behavior mirrored from current `/presets` list+pagination block: spinner, empty, grid, status + prev/next when `totalPages > 1`. Use `useTranslation("presets")` for pagination strings (add same keys to `account`/`profile` locales OR pass `t` — prefer duplicating pagination keys into `account.json`/`profile.json`/`common` only if needed; simplest: always use `presets` namespace in `PresetsList` and ensure account/profile `get*Props` load `"presets"` translations).

Account/profile currently load `account` / `profile` only — **add `"presets"` to their `serverSideTranslations` namespaces** when wiring pages.

- [ ] **Step 2: Commit**

```bash
git add src/components/PresetsList.tsx
git commit -m "feat: add shared PresetsList grid and pagination"
```

---

### Task 4: Wire `/presets`

**Files:**
- Modify: `src/pages/presets/index.tsx`

- [ ] **Step 1: Replace FE filter/slice with server query + `PresetsList`**

- Keep filter UI and `nuqs` (`search`, `modelId`, `userId`, `page`).
- Add `asOf: parseAsString` (ISO), default unset; on mount if null, `setQuery({ asOf: new Date().toISOString() })`.
- Filter changes: `{ …filters, page: null, asOf: new Date().toISOString() }`.
- `usePresets({ search, modelId: modelId === "all" ? undefined : modelId, userId: userId === "all" ? undefined : userId, page, pageSize: 48, asOf: asOf ?? undefined })`.
- `usePresetAuthors()` for user select; remove users-from-presets `useMemo`.
- Remove `filterWith*` helpers and client slice.
- Render `<PresetsList … />`.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`

- [ ] **Step 3: Commit**

```bash
git add src/pages/presets/index.tsx
git commit -m "feat: drive presets page filters and pagination from Supabase"
```

---

### Task 5: Wire account, profile, home

**Files:**
- Modify: `src/pages/account.tsx`
- Modify: `src/pages/profile/[userId].tsx`
- Modify: `src/pages/index.tsx`

- [ ] **Step 1: Account + profile**

- Add `nuqs` for `page` + `asOf` (same rules as presets, without search/model/user).
- `usePresets({ userId, page, pageSize: 48, asOf })`.
- Replace inline grid/empty/spinner with `PresetsList`.
- Load `"presets"` in `serverSideTranslations`.

- [ ] **Step 2: Home**

- Mount-time `asOf` via `useState(() => new Date().toISOString())`.
- `usePresets({ page: 1, pageSize: 3, asOf })`.
- Use `data?.presets` instead of sorting/slicing client-side.
- Keep existing hero layout (no `PresetsList`).

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`  
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/pages/account.tsx src/pages/profile/[userId].tsx src/pages/index.tsx
git commit -m "feat: use server-paginated presets on account, profile, and home"
```

---

## Spec coverage

| Spec item | Task |
| --- | --- |
| getPresets filters/page/asOf/count | 1 |
| getPresetAuthors | 1–2 |
| usePresets / usePresetAuthors | 2 |
| PresetsList grid+pagination | 3 |
| /presets nuqs + filters | 4 |
| account/profile pagination | 5 |
| home pageSize 3 | 5 |
