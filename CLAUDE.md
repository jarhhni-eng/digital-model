# CogniTest (digital-model) — AI / developer context

## Stack

- **Next.js 16** App Router, **React 19**, **TypeScript**, **Tailwind CSS 4** (`app/globals.css`).
- **UI:** shadcn-style components in `components/ui/` (Radix, `cn()` from `lib/utils.ts`).
- **Charts:** Recharts where results/dashboards need graphs.
- **No backend** in repo: data is **mock** (`lib/mock-data.ts`); auth demo uses **localStorage** (`cogniTestRole`, `cogniTestEmail`). Dedicated assessments use **sessionStorage** (see `lib/beery-vmi.ts`, `lib/visuo-constructive.ts`, `lib/tvps.ts`).

## App routes (student-facing)

| Path | Purpose |
|------|---------|
| `/` | Landing / login → `/dashboard` or `/teacher/dashboard` |
| `/dashboard` | Student dashboard |
| `/domains`, `/domains/[domainId]` | Domain → subdomain → capacity; capacities link to `/tests/[testId]` |
| `/tests`, `/tests/[testId]` | Test list and runner |
| `/results` | Generic results; dedicated: `/results/beery-vmi`, `/results/visuo-constructive`, `/results/visuo-perceptive` |

## Critical: `app/tests/[testId]/page.tsx`

The test page **early-returns** dedicated UIs by `testId` (constants from `lib/*`):

- `test-visuo-motor` → Beery VMI (`components/beery-vmi/`)
- `test-visuo-constructive` → WAIS-style puzzles (`components/visuo-constructive/`)
- `test-visuo-perceptive` → TVPS-3 (`components/tvps/`)

Otherwise it uses **`mockTestQuestions`** (generic MCQ / text / drawing / audio placeholder).

**Adding a new “real” test:** (1) `lib/<name>.ts` — types, `TEST_ID`, storage keys, scoring helpers; (2) `components/<name>/` — client UI; (3) branch in `page.tsx`; (4) optional `app/results/<slug>/page.tsx`; (5) register in `mockTests` + `mainDomains` in `mock-data.ts`.

## UI shell

Most app pages: **`Sidebar`** (fixed `w-64`) + main **`ml-64`** + **`Header`**. Fullscreen assessments (Beery, etc.) often omit sidebar on the test view.

## Commands

```bash
npm run dev    # dev server
npm run build  # production build
npm run lint   # eslint
```

## Conventions

- Prefer **focused diffs**; match existing patterns (imports, Card/Button usage).
- New assessment flows: **`'use client'`** where needed; persist session/results consistently with existing `sessionStorage` helpers.
- Images: **`public/`** → served from `/` (e.g. `public/images/foo.jpg` → `/images/foo.jpg`).
