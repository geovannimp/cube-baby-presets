# Home latest presets

**Date:** 2026-09-23  
**Status:** Approved (Approach A); user waived post-spec review

## Goal

Homepage hero keeps brand + description. Replace the primary “Browse presets” CTA with the **latest 3 presets** (as `PresetCard`) plus a **See more** button to `/presets`.

## Behavior

| State | UI |
|-------|-----|
| Loading | Centered `Spinner` |
| ≥1 presets | Up to 3 cards (`created_at` desc), then outline/secondary **See more** → `/presets` |
| Empty | Short empty copy + **See more** / browse link so the page isn’t dead |

## Data

- Client: `usePresets()` + `useModels()` (same as `/presets`)
- Sort by `created_at` descending; `.slice(0, 3)`
- No API / `PresetService` changes

## Copy (i18n)

- `common`: `home-see-more-button`, `home-presets-empty` (EN + PT)
- Remove hero dependence on `go-to-presets-button` (key may remain for other use)

## Out of scope

- New card variants, SSR/ISR for presets, changes to `/presets` or `PresetCard` API

## Files

- `src/pages/index.tsx` — hero composition + data
- `public/locales/en/common.json`, `public/locales/pt/common.json` — strings
