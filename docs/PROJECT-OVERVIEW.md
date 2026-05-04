# CogniTest (digital-model) — project overview for agents

**Last reviewed:** 2026-05-04  
**Purpose:** Single reference for codebase state, architecture, feature inventory, and production-readiness gaps. Update this file when major behavior, data sources, or routes change.

---

## 1. Product summary

**CogniTest** is a cognitive and mathematical assessment web app (ENS Fès–oriented positioning in UI copy). It combines:

- A **student** journey: domains → capacities → timed assessments, dashboards, results, profile.
- A **teacher** journey: class overview, per-student views (mock-scoped data in places).
- An **admin / research** area: psychometrics, SEM-style analytics, manual correction flows, indicators — partly backed by deterministic **mock** data (`lib/admin-mock.ts`) and partly by real **Supabase** session storage.

The repo is a **Next.js 16 App Router** application with **React 19**, **TypeScript**, **Tailwind CSS 4**, and **shadcn-style** Radix components (`components/ui/`, `cn()` from `lib/utils.ts`).

---

## 2. Technology stack

| Layer | Choice |
|--------|--------|
| Framework | Next.js 16.1 (Turbopack in dev/build) |
| UI | React 19, Tailwind 4, Radix primitives, Recharts, KaTeX (geometry), `next-themes` |
| Auth & DB | Supabase Auth + Postgres (RLS). Clients: `@supabase/ssr`, `@supabase/supabase-js` |
| Forms / validation | `react-hook-form`, `zod`, `@hookform/resolvers` |
| Analytics | `@vercel/analytics` (root layout) |
| PWA hints | `public/manifest.json`, metadata in `app/layout.tsx` |

**Environment variables (typical):**

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — browser + server user-scoped client.
- `SUPABASE_SERVICE_ROLE_KEY` — **server only** (`getSupabaseAdmin()`); used e.g. for `POST /api/auth/register`.
- Optional: `.env` present when building locally.

**Package metadata:** `package.json` still names the package `my-project` — consider renaming for production clarity.

---

## 3. High-level architecture

```mermaid
flowchart TB
  subgraph client [Browser]
    Pages[App Router pages]
    Ctx[AuthProvider + I18nProvider]
    Dedicated[Dedicated test UIs]
    Generic[GenericTestRunner]
    LStore[localStorage / sessionStorage]
  end

  subgraph edge [Next.js]
    MW[Proxy (proxy.ts): session refresh + route guard]
    RSC[Server Components]
    API[Route Handlers /api/*]
  end

  subgraph data [Persistence]
    SB[(Supabase: profiles, student_profiles, test_sessions, trial_results)]
    Mock[lib/mock-data.ts, lib/admin-mock.ts, JSON tools]
    FS[data/*.json via lib/server/json-store.ts - legacy / tooling]
  end

  Pages --> Ctx
  Pages --> Dedicated
  Pages --> Generic
  Dedicated --> LStore
  Generic --> API
  API --> SB
  Ctx --> SB
  MW --> SB
```

**Request flow (simplified):**

1. **Root `proxy.ts`** (Next.js proxy convention) delegates to `lib/supabase/middleware.ts` (`updateSupabaseSession`): refreshes the Supabase session cookie and enforces auth on configured path prefixes.
2. **Authenticated API routes** use `getSupabaseServer()` (cookie-aware). **Privileged** operations use `getSupabaseAdmin()` only in trusted server code.
3. **Many assessments** still persist progress or results in **`sessionStorage` / `localStorage`** (see per-test `lib/*.ts`). Newer quiz-style flows increasingly use **`lib/results/results-service.ts`** (`test_sessions` + `trial_results` in Supabase).

---

## 4. Directory map (agent-oriented)

| Path | Role |
|------|------|
| `app/` | Routes: landing, dashboards, domains, tests, results, teacher, admin, analytics, profile, register |
| `app/api/` | `auth/login`, `auth/logout`, `auth/register`, `submissions`, `student-profile`, `lesson-results` |
| `components/` | Feature UIs (`beery-vmi`, `tvps`, `visuo-constructive`, attentional, memory, geometry, admin, …) + `components/ui/` |
| `lib/` | Domain logic, test IDs, scoring, Supabase helpers, mock data, i18n, recommendations, psychometrics |
| `hooks/` | Toasts, mobile breakpoint, etc. |
| `public/` | Static assets, PWA manifest, icons |
| `supabase/` | SQL schema / seeds (if present) — align DB with `lib/types/database.ts` |
| `tools/` | Offline datasets / scripts (not runtime-critical) |
| `.cursor/rules/` | Workspace rules for CogniTest (short-circuit pattern for `/tests/[testId]`) |

---

## 5. Routing reference

| Route | Notes |
|-------|------|
| `/` | Landing + **sign-in** (not a separate `/login` page) |
| `/register` | Registration |
| `/dashboard` | Student dashboard |
| `/domains`, `/domains/[domainId]` | Domain → subdomain → capacity; links to `/tests/[testId]` |
| `/tests`, `/tests/[testId]` | Test list + runner (**critical branching** — see §6) |
| `/results`, `/results/beery-vmi`, `/results/visuo-constructive`, `/results/visuo-perceptive` | Results views |
| `/profile`, `/profile-setup` | Profile |
| `/teacher/dashboard`, `/teacher/students/[studentId]` | Teacher views |
| `/admin/*` | Admin / research / manual correction / SEM / indicators |
| `/analytics` | Student-facing analytics (Recharts + mock institution filter) |

**Proxy:** `PROTECTED_PREFIXES` in `lib/supabase/middleware.ts` includes `/dashboard`, `/profile`, `/profile-setup`, `/tests`, `/results`, `/teacher`, `/admin`, `/analytics`. Unauthenticated users are redirected to `/` with a `redirect` query param.

---

## 6. Tests page contract (`app/tests/[testId]/page.tsx`)

**Rule:** For any new “real” assessment, **early-return** a dedicated component **before** falling through to `GenericTestRunner` (which uses `mockTests` + optional inline questions).

**Dedicated runners (non-exhaustive — verify file for full list):**

- Visuo-motor: `test-visuo-motor` → Beery-style (`lib/beery-vmi.ts` / `components/beery-motrice/`)
- Visuo-constructive: `test-visuo-constructive` → WAIS-style blocks
- Visuo-perceptive hub + TVPS subtests: `lib/visuo-perceptive/*`, `components/visuo-perceptive/*`
- Reasoning: syllogism, Ravens matrices (`lib/syllogism-test.ts`, `lib/ravens-test.ts`)
- Spatial: mental rotation 3D/2D, mental cutting, spatial orientation
- Memory: Corsi (`test-visuo-spatial-memory`), RAVLT, digit span
- Attention: divided / selective / sustained / **trail making** (mapped to `test-visuo-spatial-attention`), shifting, inhibition, processing speed, cognitive flexibility
- Geometry: vectors, symétries, droite au plan, trig circle, espace, produit scalaire (see imports in `page.tsx`)

**Generic path:** Unknown `testId` still renders `GenericTestRunner` with `test` possibly `undefined` — edge case to harden for production (404 or redirect).

**Registration in data:** New tests must appear in `mockTests` and in `mainDomains` / `DomainCapacity.testId` in `lib/mock-data.ts` (and `lib/platform-domains.ts` if they should appear in admin’s platform catalog).

---

## 7. Two “domain catalog” sources

Agents should know both exist:

1. **`mainDomains` in `lib/mock-data.ts`** — Used by student-facing **Domains** UI (`/domains`).
2. **`platformDomains` in `lib/platform-domains.ts`** — Seven top-level Moroccan platform domains; feeds **`lib/admin-mock.ts`** and related admin/analytics scaffolding.

They overlap conceptually but are **not guaranteed identical**. Consolidating or syncing them is an open product/engineering decision.

---

## 8. Data & persistence model

| Mechanism | Used for |
|-----------|----------|
| **Supabase** `profiles` | Role + identity; read in `AuthProvider` via `getSupabaseBrowser()` |
| **Supabase** `student_profiles` | `/api/student-profile` |
| **Supabase** `test_sessions`, `trial_results` | `results-service`, `/api/submissions`, many quizzes |
| **`lib/mock-data.ts`** | Static catalogs, generic MCQ bank (`mockTestQuestions`), teacher student list helpers |
| **`sessionStorage` / `localStorage`** | Legacy or hybrid flows for specific batteries (Beery, TVPS, visuo-constructive, trail making, etc.) — check each `lib/<test>.ts` |
| **`lib/server/json-store.ts`** | Files under `data/` — **server filesystem**; inappropriate for serverless-only deploy unless replaced by DB/blob storage |

**Scoring:** `/api/submissions` scores generic attempts against **`mockTestQuestions`** only — dedicated tests must persist via their own pipelines.

---

## 9. Authentication

- **Client:** `lib/auth-context.tsx` — `signInWithPassword`, `signUp`, `signOut`, profile role fetch from `profiles`.
- **Server registration:** `POST /api/auth/register` uses **admin** client to create users; comments note `email_confirm: true` is convenient for dev — **tighten for production** (email verification, rate limits, admin-only registration if needed).
- **Types:** `lib/auth-types.ts`, DB types in `lib/types/database.ts` (comments suggest regenerating via Supabase CLI).

---

## 10. Internationalization

- **`lib/i18n-context.tsx`** — `en` | `fr` | `ar` with a small key set (nav, auth labels). Not full app coverage.

---

## 11. Admin & research features

- Deterministic cohort mock: `lib/admin-mock.ts` + `lib/platform-domains.ts`.
- UI: individual / aggregated / comparison / indicators / SEM / research / manual correction routes under `app/admin/`.
- Supporting libs: `lib/psychometrics.ts`, `lib/sem-model.ts`, `lib/pca.ts`, `lib/recommendations-engine.ts`, etc.

**Production note:** Clearly separate **demo/mock** admin charts from **live** Supabase aggregates to avoid misleading operators.

---

## 12. Feature inventory (checklist)

- [x] Landing + role-based redirect after login (student / teacher / admin)
- [x] Supabase session proxy (`proxy.ts`) + protected routes
- [x] Registration (page + API) and student profile API
- [x] Domain navigation + test catalog
- [x] Large battery of dedicated cognitive / geometry assessments
- [x] Generic MCQ / text / drawing / audio placeholders (generic runner)
- [x] Dedicated results pages for major visuo batteries
- [x] Teacher dashboard (mock student scoping via `getStudentsForTeacher`)
- [x] Admin research dashboard suite (mock + analytics components)
- [x] Student analytics page with recommendations helper
- [x] Dark/light theming (`theme-provider`)
- [x] Mobile nav patterns (`mobile-nav`, sidebar)
- [x] Vercel Analytics hook

---

## 13. Production-readiness — gaps and enhancements

Use this as a backlog; prioritize by deployment target (internal study vs public SaaS).

### Security & compliance

- [ ] **Service role:** Ensure `SUPABASE_SERVICE_ROLE_KEY` never ships to the client; audit all route handlers.
- [ ] **Registration policy:** Disable open `admin` self-signup unless intended; add server-side role allowlist or invite-only flow.
- [ ] **Email confirmation:** Turn on Supabase email confirmation and SMTP for real deployments.
- [ ] **Rate limiting** on `/api/auth/*` and submission endpoints (edge middleware or API gateway).
- [ ] **RLS review:** Confirm policies for `test_sessions`, `trial_results`, `student_profiles`, `profiles` match product rules (teacher sees only assigned students, etc.).

### Reliability & quality

- [ ] **Automated tests:** No Vitest/Jest/Playwright in `package.json` — add CI for critical flows (auth, one dedicated test, submissions API).
- [ ] **Typecheck in CI:** Build log shows **“Skipping validation of types”** — enable `typescript` check in `next build` or run `tsc --noEmit` in CI.
- [ ] **`npm run lint`:** Script runs `eslint .` but **eslint is not listed** in `devDependencies` — fix or remove script; add ESLint 9 flat config aligned with Next.js.
- [ ] **404 for unknown `testId`:** Harden `app/tests/[testId]/page.tsx`.
- [ ] **Console logging:** Remove or gate debug `console.log` in auth and hot paths.

### Operations

- [ ] **Observability:** Structured logging, error reporting (Sentry/OpenTelemetry), RUM beyond Vercel Analytics.
- [ ] **Health checks:** `/api/health` for orchestrators.
- [ ] **Database migrations:** Single source of truth (`supabase/migrations` or hosted migration pipeline); regenerate `lib/types/database.ts` from schema.
- [ ] **Multi lockfile / monorepo root:** Next may infer wrong workspace root if parent `package-lock.json` exists — set `turbopack.root` or isolate repo (build emitted a warning).
- [x] **Proxy convention:** Root `middleware.ts` migrated to **`proxy.ts`** (`export function proxy`) per Next.js 16.

### Product & UX

- [ ] **Unify catalogs:** `mainDomains` vs `platformDomains`.
- [ ] **Consolidate persistence:** Move remaining localStorage/sessionStorage batteries to Supabase sessions for longitudinal analysis.
- [ ] **i18n:** Expand keys or adopt a full i18n library if bilingual rollout is required.
- [ ] **Accessibility:** Audit keyboard traps in fullscreen tests, focus management, ARIA for custom canvases.
- [ ] **Offline / resume:** Define behavior for tab close mid-test.

### Legal / content

- [ ] **Licensing:** Confirm rights for any standardized test content (e.g. TVPS-style, Ravens-style) before public release.
- [ ] **Privacy:** DPIA, consent flows, data retention for student cognitive data.

---

## 14. Commands

```bash
npm run dev    # development server
npm run build  # production build
npm run lint   # verify ESLint is installed and configured
```

---

## 15. How agents should work in this repo

1. **Scope:** Touch only files needed for the task; follow existing Card/Button patterns (workspace rule).
2. **New dedicated test:** `lib/<name>.ts` (types, `TEST_ID`, storage), `components/<name>/`, early return in `app/tests/[testId]/page.tsx`, register in `mockTests` + `mainDomains` (+ `platformDomains` if admin should list it), optional `app/results/<slug>/page.tsx`.
3. **Do not** expose secrets; prefer `getSupabaseServer()` in Route Handlers for user-scoped DB access.
4. **After structural changes:** Update **this document** (§5–§8, §12–§13) so future agents see current state.

---

*End of overview.*
