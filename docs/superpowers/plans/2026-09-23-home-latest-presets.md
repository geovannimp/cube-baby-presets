# Home latest presets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Show latest 3 presets on the home hero (replacing Browse CTA) with See more → `/presets`.

**Architecture:** Client fetch via existing `usePresets` / `useModels`; reuse `PresetCard`; sort/slice in the page.

**Tech Stack:** Next.js pages, react-query, next-i18next, existing UI components.

**Spec:** `docs/superpowers/specs/2026-09-23-home-latest-presets-design.md`

---

### Task 1: i18n strings

**Files:**
- Modify: `public/locales/en/common.json`
- Modify: `public/locales/pt/common.json`

- [ ] Add `home-see-more-button` and `home-presets-empty` (EN + PT)

### Task 2: Home page presets strip

**Files:**
- Modify: `src/pages/index.tsx`

- [ ] Import `usePresets`, `useModels`, `PresetCard`, `Spinner`, `Empty` (+ title/description as needed), `useMemo`
- [ ] Remove primary Browse CTA
- [ ] Load presets/models; sort by `created_at` desc; take 3
- [ ] Render loading / cards grid / empty + See more button (`outline`, link `/presets`)
- [ ] Keep `getStaticProps` on `common` namespace only (new keys live there)

### Task 3: Verify

- [ ] `npm run typecheck`
- [ ] Manual: home shows ≤3 newest cards; See more → `/presets`; empty/loading OK
