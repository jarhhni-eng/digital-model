# CogniTest — Improvement Plan (More Complete & Clean)

Use this as a checklist to make the app more complete and cleaner. Items are ordered by impact and dependency where it matters.

---

## 1. Fix routing and navigation (high impact)

### 1.1 Align sidebar with real routes

- **Teacher “Students”**: Change sidebar href from `/students` to `/teacher/students` and add a **list page** at `app/teacher/students/page.tsx` (e.g. table/cards of all students, linking to `/teacher/students/[studentId]`). Optionally keep `/students` as a redirect to `/teacher/students`.
- **Student “Tests”**: Done — `app/tests/page.tsx` lists all tests with progress stats, type/duration/due info, and links to `/tests/[testId]` or `/results`.
- **Profile**: Add `app/profile/page.tsx` for both roles (student: show/edit profile from `mockStudentProfile`; teacher: minimal profile or placeholder).
- **Teacher Analytics / Reports**: Either add placeholder pages at `app/teacher/analytics/page.tsx` and `app/teacher/reports/page.tsx` or remove these items from the sidebar until features exist.

### 1.2 Add missing domain detail page

- **`app/domains/[domainId]/page.tsx`**: Show one domain’s capacities, progress, and a list or button to “Start assessment” for that domain (e.g. link to a relevant test in `/tests` or a dedicated flow). Use `mockDomains` and 404 if `domainId` not found.

### 1.3 Connect dashboard to tests

- On **student dashboard**, “Recent Assessments” cards (or “View All”) "View All" and test cards now link to `/tests` or `/tests/[testId]` / `/results`. Done.

---

## 2. Lightweight “session” and consistency (medium impact)

### 2.1 Role and user in one place

- Introduce a **small context** (e.g. `AuthContext` or `AppContext`) that holds:
  - `userRole: 'student' | 'teacher'`
  - `userName: string`
  - Optional: `userId` or profile id for future API use.
- On “login” (current submit on `/`), set this context (e.g. in memory or sessionStorage) and redirect. Each dashboard/sidebar page reads from context instead of hardcoding `mockStudentProfile.name` or `"Dr. Richard Smith"`.
- **Logout**: Sidebar “Logout” clears context and redirects to `/`.

### 2.2 Optional route protection

- Add a simple **middleware or layout check**: if no “session” (e.g. no role in context or sessionStorage), redirect to `/`. Protects `/dashboard`, `/teacher/dashboard`, etc. from direct URL access. Not required for a demo but makes the app feel more complete.

---

## 3. Data layer and cleanliness (medium impact)

### 3.1 Centralize mock data access

- Keep `lib/mock-data.ts` as the source of truth, but add a **thin data layer** (e.g. `lib/data.ts` or `lib/api.ts`) with functions like:
  - `getDomains()`, `getDomain(id)`, `getTests()`, `getTest(id)`, `getStudentProfile()`, `getTeacherStudents()`, `getStudentResults()`, etc.
- Pages call these instead of importing raw `mockDomains`, `mockTests`, etc. Later you can replace implementations with real API calls without touching pages much.

### 3.2 Use test and domain ids consistently

- Ensure **tests** reference domains by id (e.g. `domainId: 'num-reasoning'`) and **domain detail** page uses the same id. Link “Start assessment” from a domain to the right test(s) in the tests list or test page.

---

## 4. UX and copy (quick wins)

- **Profile setup**: After “login” as student, optionally redirect to `/profile-setup` if profile is “incomplete” (e.g. no name), then to `/dashboard`; or add a link to “Complete your profile” on dashboard.
- **Results page**: “Return to Dashboard” button should use `<Link href="/dashboard">` (or router) so it’s a real navigation.
- **Test page**: After submit, consider showing a short “Submitting…” or “Done” state before redirect to `/results`.
- **Empty states**: On tests list, results, or teacher roster, show a clear empty state (e.g. “No tests assigned yet”) instead of an empty list.

---

## 5. Code hygiene

- **Types**: Keep re-exporting shared types from `lib/mock-data.ts` (or a dedicated `lib/types.ts`) and use them in components (e.g. `Test`, `Domain`, `StudentProfile`) to avoid duplication and drift.
- **Duplicate chart config**: Consider a small `lib/chart-styles.ts` (or similar) for Recharts colors and tooltip/label styles used across dashboard, results, and teacher pages.
- **Theme**: If you use `next-themes`, wrap the app in `ThemeProvider` in `app/layout.tsx` and add a theme toggle (e.g. in header) so dark mode in `globals.css` is actually switchable.
- **Build**: Remove or narrow `typescript.ignoreBuildErrors: true` in `next.config.mjs` and fix type errors so the project stays type-safe.

---

## 6. Optional: backend and auth (later)

- Add **API routes** (Next.js route handlers) or an external backend to persist users, tests, results, and domains.
- Add **real auth** (e.g. NextAuth, Clerk, or custom JWT) and replace mock “login” with real sign-in; keep the same role-based redirect and context.
- **Database**: Use Prisma/Drizzle + SQLite or Postgres for users, tests, questions, results, and domains; seed from current mock data for dev.

---

## Suggested order of work

1. Add missing **routes**: `/tests` (list), `/domains/[domainId]`, `/profile`, `/teacher/students` (list).  
2. **Fix sidebar** links to point to these routes.  
3. **Wire dashboard** “View All” / test cards to tests list or test page.  
4. Introduce **context + simple “session”** and **logout** behavior.  
5. Add **data layer** and optional **route protection**.  
6. **UX polish**: profile-setup redirect/link, button links, empty states.  
7. **Cleanup**: shared types, chart styles, theme provider, TypeScript strict.

This order gives you a complete, navigable app first, then a cleaner and more maintainable codebase, with room to add real backend and auth when needed.
