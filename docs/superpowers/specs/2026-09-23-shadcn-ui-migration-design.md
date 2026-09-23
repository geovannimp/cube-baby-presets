# shadcn UI migration design

**Date:** 2026-09-23  
**Status:** Approved (Approach 1 — init preset first; option B — full chrome/forms)  
**User review:** Waived unless blockers  
**Preset:** `b1dTCbyqnY`

## Preset (decoded)

| Field | Value |
|---|---|
| style | nova |
| baseColor | zinc |
| theme | blue |
| chartColor | blue |
| radius | small |
| font | geist |
| fontHeading | roboto |
| iconLibrary | lucide |
| menuColor | default |
| menuAccent | subtle |

## Goals

- Modernize app chrome and forms with shadcn/ui using the preset above.
- Rebuild Header, auth/forms, dialogs, cards, loading/empty states on shadcn patterns.
- Keep **Knob**, **KnobsForm**, **Pedal** as custom domain widgets (KnobsForm may use ui Card).

## Non-goals

- App Router migration
- Redesigning Knob/Pedal interaction
- Product/API behavior changes

## Foundation

1. Run `npx shadcn@latest init --preset b1dTCbyqnY` (accept Tailwind/CSS/`components.json` changes required by the preset).
2. Add components as needed via CLI: button, input, textarea, select, card, label, field, alert-dialog, dropdown-menu, separator, skeleton, spinner, empty, sonner.
3. Install under `src/components/ui/*` (or CLI default from init).
4. Icons: Lucide. Toasts: Sonner (replace `react-hot-toast`). Dark mode: keep `next-themes` + semantic tokens.

## Component mapping

| Today | After |
|---|---|
| `Button` | `ui/button` |
| `Input` / `Textarea` / `Select` | ui controls + Field / FieldGroup / FieldLabel on forms |
| `Card` | ui Card composition |
| `DeletePresetDialog` | AlertDialog |
| `Header` menu | DropdownMenu (+ theme items); Next Link without nested `<a>` |
| `LoadingDots` | Skeleton and/or Spinner |
| Empty presets UI | Empty where appropriate |
| `react-hot-toast` | Sonner in `_app` |
| `PresetCard` | ui Card + Button |
| `Container` | Keep; semantic tokens if needed |
| Knob / KnobsForm / Pedal | Keep custom; KnobsForm Card → ui Card |

## Pages

Update: home, presets list/detail, signin/signup, account, profile, `_app`.

## Cleanup

Remove unused custom primitives and deps: `@headlessui/react`, `@floating-ui/react-dom`, `@heroicons/react`, `react-hot-toast` (and `.npmrc` legacy-peer-deps if no longer required).

## Verification

- Preset applied; tokens/fonts match decode output
- `typecheck`, `lint`, `build` pass
- Smoke critical flows + dark mode

## Success

Migrated chrome/forms use shadcn; domain knobs/pedal remain; old primitives gone; preset `b1dTCbyqnY` is visual source of truth.
