# Presets server-side filters & pagination

## Goal

Move preset list filtering and pagination from the client into Supabase queries. Every page that lists presets uses the shared query API. `/presets`, account, and profile share a `PresetsList` (grid + pagination only). Filters stay page-owned.

## Decisions

| Topic | Choice |
| --- | --- |
| Scope | All preset list callers (`/presets`, home, account, profile) |
| Pagination | Offset/`page` (not keyset cursors) |
| Snapshot | `asOf` ISO timestamp; `created_at <= asOf` |
| Drift | Accept shift when rows are deleted after `asOf` |
| Shared UI | `PresetsList` = loading/empty/grid + prev/next only |
| Filters | Owned by each page; not inside `PresetsList` |
| User filter options | Separate `getPresetAuthors()` (distinct preset authors) |

## Query API

### `GetPresetsOptions`

- `search?: string` — case-insensitive match on `name` or `description` (`ilike`)
- `modelId?: string` — `.eq("model_id", …)` when set
- `userId?: string` — `.eq("user_id", …)` when set (already existed)
- `page?: number` — default `1`
- `pageSize?: number` — default `48` (home passes `3`)
- `asOf?: string` — ISO timestamp; when set, `.lte("created_at", asOf)`

### `getPresets` behavior

1. `select(PRESET_SELECT, { count: "exact" })`
2. Apply filters above
3. `order("created_at", { ascending: false }).order("id", { ascending: false })`
4. `.range((page - 1) * pageSize, page * pageSize - 1)`
5. Return `{ presets: Preset[]; totalCount: number }`

### `getPresetAuthors`

Returns `{ id: string; username: string }[]` built from presets’ `user_id` + joined profile username (unique by `user_id`). Used only by `/presets` for the user filter dropdown.

## Hooks

- `usePresets(options)` — query key includes all options; data shape `{ presets, totalCount }`
- `usePresetAuthors()` — wraps `getPresetAuthors`

## `PresetsList`

Props:

- `presets`, `models` (for card model names), `isLoading`
- `page`, `pageSize`, `totalCount`
- `onPageChange(page: number)`
- `emptyTitle` (i18n string from caller)

Renders: spinner | empty | grid of `PresetCard` + pagination chrome (prev/next + status) when `totalPages > 1`. Does not render filters.

## Page wiring

### `/presets`

- `nuqs`: `search`, `modelId`, `userId`, `page`
- On mount: `asOf = new Date().toISOString()` in component state (not URL)
- On filter change: reset `page` to default, set fresh `asOf` in state
- Pass query options into `usePresets`; render filters locally; pass results into `PresetsList`

### Account / profile

- `nuqs`: `page` only
- `asOf` in component state (same snapshot rules; refreshed only on remount)
- Lock `userId` from auth / route
- No search/model/user filters in v1
- Use `PresetsList`

### Home

- `usePresets({ page: 1, pageSize: 3, asOf })` with mount-time `asOf` in state (not in URL)
- Keep current hero card layout + “See more”; do not use `PresetsList` (no pagination UI)

## Out of scope

- Postgres RPC / views
- Keyset/`cursor` pagination
- Filters inside `PresetsList`
- Changing card design

## Success criteria

- Changing filters/page hits Supabase with matching filters + range
- Reload with `?page=` keeps pagination; `asOf` is session state only
- Home shows at most 3 presets from the server query
- Account/profile paginate at 48/page via `PresetsList`
- Typecheck passes
