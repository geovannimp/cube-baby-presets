# shadcn UI Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline) or superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply shadcn preset `b1dTCbyqnY` and replace app chrome/forms with shadcn components while keeping Knob/Pedal domain widgets.

**Architecture:** Init preset first (tokens, Tailwind, `components.json`), add ui primitives via CLI, migrate pages/components to Field + ui patterns, remove legacy Headless UI primitives.

**Tech Stack:** Next.js 16 Pages Router, shadcn nova (preset b1dTCbyqnY), Lucide, Sonner, next-themes, react-hook-form + zod

## Global Constraints

- Preset code: `b1dTCbyqnY` (nova, zinc+blue, small radius, Geist+Roboto, Lucide)
- Scope B: chrome/forms/dialogs/cards/loading/empty; keep Knob, KnobsForm, Pedal
- Semantic tokens only on migrated UI; no raw `bg-blue-600` / `dark:bg-gray-900` on new chrome
- Forms use FieldGroup + Field; toasts via Sonner; icons Lucide
- Gates: `typecheck`, `lint`, `build`
- Work on current feature branch; commit per task
- Use Node 22 via mise when running npm/npx (`PATH` include mise node 22.23.1)
- Always: `npx shadcn@latest` for CLI (run from empty cwd if project npx fails, or with Node 22 PATH)

---

## File map

| Path | Role |
|---|---|
| `components.json`, `src/styles/globals.css`, Tailwind config | Preset foundation |
| `src/components/ui/*` | Generated shadcn components |
| `src/components/Header.tsx` | DropdownMenu rewrite |
| `src/components/PresetCard.tsx`, `DeletePresetDialog.tsx` | Card / AlertDialog |
| `src/components/KnobsForm.tsx` | ui Card only |
| `src/pages/*`, `_app.tsx` | Consume ui + Field + Sonner |
| Delete legacy Button/Input/Textarea/Select/Card/LoadingDots | Cleanup |

---

### Task 1: Init preset + add ui components

**Files:** Created/updated by CLI (`components.json`, CSS, Tailwind, `src/components/ui/*`, deps)

- [ ] **Step 1:** From project root with Node 22:  
  `npx --yes shadcn@latest init --preset b1dTCbyqnY --yes --force`  
  (If npx fails with EJSONPARSE in-project, run via `npm exec` after `npm i -D shadcn` or invoke from `/tmp` with `--cwd` pointing at project.)

- [ ] **Step 2:** Add components:  
  `npx shadcn@latest add button input textarea select card label field alert-dialog dropdown-menu separator skeleton spinner empty sonner --yes`

- [ ] **Step 3:** Confirm `npx shadcn@latest preset decode b1dTCbyqnY` values match project theme (blue/zinc/nova).

- [ ] **Step 4:** `npm run typecheck` (fix any init breakage).

- [ ] **Step 5:** Commit: `chore: init shadcn with preset b1dTCbyqnY`

---

### Task 2: Wire Sonner + theme tokens in `_app`

**Files:** Modify `src/pages/_app.tsx`, globals if needed

- [ ] Replace `react-hot-toast` `<Toaster />` with Sonner `<Toaster />` from ui/sonner (or `sonner` per CLI).
- [ ] Ensure `ThemeProvider` attribute stays `class` and body uses `bg-background text-foreground`.
- [ ] Commit: `feat: wire sonner toaster into app shell`

---

### Task 3: Migrate Header

**Files:** Rewrite `src/components/Header.tsx`

- [ ] Replace Headless Popover/Disclosure + floating-ui with DropdownMenu.
- [ ] Use ui Button; Lucide icons; Next `Link` without nested `<a>`.
- [ ] Theme items: light / dark / system via `setTheme`.
- [ ] Commit: `feat: rebuild header with shadcn dropdown menu`

---

### Task 4: Migrate shared cards/dialogs/loading

**Files:** `PresetCard.tsx`, `DeletePresetDialog.tsx`, `KnobsForm.tsx`; delete LoadingDots usage → Skeleton/Spinner helpers or inline

- [ ] PresetCard → ui Card + Button
- [ ] DeletePresetDialog → AlertDialog
- [ ] KnobsForm Card → ui Card
- [ ] Commit: `feat: migrate cards dialog and loading to shadcn`

---

### Task 5: Migrate auth + form pages

**Files:** `signin.tsx`, `signup.tsx`, `presets/index.tsx`, `presets/[presetId].tsx`, `account.tsx`, `profile/[userId].tsx`, `index.tsx`

- [ ] Forms: FieldGroup + Field + FieldLabel + Input/Textarea/Select; validation `data-invalid` / `aria-invalid`.
- [ ] Replace toast imports with `toast` from `sonner`.
- [ ] Buttons/Cards/loading/empty as mapped.
- [ ] Commit: `feat: migrate pages to shadcn form and chrome components`

---

### Task 6: Cleanup + verify

- [ ] Delete unused: `Button.tsx`, `Input.tsx`, `Textarea.tsx`, `Select.tsx`, `Card.tsx`, `LoadingDots/`, old dialog if fully replaced.
- [ ] Uninstall unused deps; drop `legacy-peer-deps` from `.npmrc` if Headless UI gone and `npm ci` succeeds.
- [ ] `npm run typecheck && npm run lint && npm run build`
- [ ] Commit: `chore: remove legacy ui primitives after shadcn migration`

---

## Plan self-review

1. Spec coverage: preset init, mapping, pages, cleanup, verification ✓  
2. No placeholders ✓  
3. Knob/Pedal kept ✓
