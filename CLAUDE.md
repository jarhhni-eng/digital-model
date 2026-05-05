# CogniTest (digital-model) — AI / developer context

**Full architecture (team reference):** [`docs/PROJECT-OVERVIEW.md`](docs/PROJECT-OVERVIEW.md) — read §3–§8 before large changes (auth, catalogue, sessions, submissions).

## Stack

- **Next.js 16** App Router, **React 19**, **TypeScript**, **Tailwind CSS 4** (`app/globals.css`).
- **UI:** shadcn-style components in `components/ui/` (Radix, `cn()` from `lib/utils.ts`).
- **Charts:** Recharts where results/dashboards need graphs.
- **Backend:** **Supabase** (Auth + Postgres + RLS). Browser: `getSupabaseBrowser()`; Route Handlers: `getSupabaseServer()`; privileged server only: `getSupabaseAdmin()`.
- **Catalogue:** `public.tests` merged onto in-repo `mockTests` via `lib/tests-catalog.ts` + `hooks/use-tests-catalog.ts` (see overview).
- **Legacy / hybrid:** Some dedicated assessments still use **`sessionStorage`** / **`localStorage`** (`lib/beery-vmi.ts`, `lib/visuo-constructive.ts`, `lib/tvps.ts`, attention/memory helpers, etc.).

## App routes (student-facing)

| Path | Purpose |
|------|---------|
| `/` | Landing / sign-in → `/dashboard` or `/teacher/dashboard` |
| `/dashboard` | Student dashboard |
| `/domains`, `/domains/[domainId]` | Domain tree from `platformDomains`; capacities → `/tests/[testId]` |
| `/tests`, `/tests/[testId]` | Test list and runner |
| `/results` | Aggregated results (Supabase + some local-storage cards) |

## Critical: `app/tests/[testId]/page.tsx`

The test page **early-returns** dedicated UIs by `testId` (constants from `lib/*`). Otherwise **`getTestForRunner(testId, catalog)`** + **`GenericTestRunner`** (generic MCQ / text / drawing / audio; submit via **`POST /api/submissions`**).

**Adding a new “real” test:** See checklist in **`docs/PROJECT-OVERVIEW.md` §6** (dedicated component, `mockTests`, `public.tests` row for FK, `platformDomains` if listed under `/domains`, optional results route).

## UI shell

Most pages: **`Sidebar`** (`w-64`) + main **`ml-64`** + **`Header`**. Fullscreen assessments often omit the sidebar.

## Commands

```bash
npm run dev    # dev server
npm run build  # production build
npm run lint   # eslint (ensure eslint is installed in devDependencies)
```

## Conventions

- Prefer **focused diffs**; match existing patterns (imports, Card/Button usage).
- New flows: **`'use client'`** where needed; persist consistently with existing helpers (Supabase `finishSession` vs `/api/submissions` vs `sessionStorage`).
- Images: **`public/`** → `/images/...` from the site root.
