# CogniTest — Project Overview (A–Z)

## What This App Is

**CogniTest** is an **academic research platform** for evaluating **mathematical cognitive capacities**. It supports two roles:

- **Students**: Take assessments by domain/capacity, view progress and results.
- **Teachers**: View class roster, student profiles, performance trends, and weak areas.

The app is a **Next.js 16** front-end with **mock data** only (no real backend or auth). It’s suitable for PhD research demos and UX flows.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, Radix UI (shadcn-style components) |
| Charts | Recharts |
| Forms | React Hook Form, Zod, @hookform/resolvers |
| Fonts | Inter (sans), Poppins (display) |
| Analytics | @vercel/analytics |

---

## Project Structure

```
digital-model/
├── app/                    # App Router pages
│   ├── layout.tsx          # Root layout (fonts, metadata, Analytics)
│   ├── page.tsx            # Landing = Login (Student/Teacher)
│   ├── globals.css         # Tailwind + CSS variables (light/dark)
│   ├── dashboard/         # Student dashboard
│   ├── domains/            # Student: list cognitive domains
│   ├── profile-setup/      # Student onboarding profile form
│   ├── results/            # Student: assessment results & charts
│   ├── tests/              # Student: list all tests, progress, start/continue
│   ├── tests/[testId]/     # Single assessment (MCQ, text, drawing, audio)
│   └── teacher/
│       ├── dashboard/      # Teacher dashboard + class roster
│       └── students/[studentId]/  # Teacher: one student detail
├── components/
│   ├── sidebar.tsx         # Role-based nav (student vs teacher)
│   ├── header.tsx          # Top bar (title, search, bell, settings)
│   ├── dashboard-cards.tsx # StatCard, ProgressCard, TestCard, DomainCard
│   ├── timer.tsx           # Test countdown
│   └── ui/                 # shadcn-style primitives (Button, Card, etc.)
├── lib/
│   ├── mock-data.ts        # All domain/test/result/profile/student data
│   └── utils.ts            # cn() etc.
└── hooks/                  # use-toast, use-mobile
```

---

## Data Model (from `lib/mock-data.ts`)

- **Domain** — Cognitive area (e.g. Numerical Reasoning, Spatial Visualization). Has `progress`, `isLocked`, and list of **Capacity**.
- **Capacity** — Skill within a domain (e.g. Counting, Mental Rotation). Has `score`, `attempts`.
- **Test** — Assessment: `title`, `domain`, `status` (upcoming | in-progress | completed), `type` (mcq | drawing | text | audio), `duration`.
- **Question** — Belongs to a test; types: mcq (with options), text, drawing, audio.
- **StudentResult** — Per-domain result with `score` and per-capacity scores.
- **StudentProfile** — Name, email, age, scholar level, math scores, teacher.
- **TeacherStudent** — Teacher view: name, email, join date, averageScore, completedTests, weakAreas.

All of this is in-memory; no API or database.

---

## Infrastructure

### Routing

- **Next.js App Router**: one `page.tsx` per route; dynamic segments e.g. `[testId]`, `[studentId]`.
- **No route guards**: any URL can be opened; “auth” is simulated on login (redirect by role only).
- **No layout groups**: student and teacher pages both use the same root layout; each page renders `<Sidebar userRole="…" />` and `<Header />` manually.

### “Auth” and session

- **No real auth**: login form only sets a redirect (student → `/dashboard`, teacher → `/teacher/dashboard`). No token, no session, no protected routes.
- **User identity**: passed as props (e.g. `mockStudentProfile.name`, `"Dr. Richard Smith"`) into Sidebar/Header. No context or global state.

### Data

- **Single source**: `lib/mock-data.ts` exports arrays/objects. Pages import and use them directly.
- **No API layer**: no `fetch`, no server actions used for data (only client components and mock data).

### Theming

- **CSS variables** in `app/globals.css`: light/dark themes, sidebar, chart colors. No ThemeProvider in layout (optional next-themes is in package.json but not wired in layout).

---

## User Flows

### 1. Student flow

1. **Landing** (`/`) — Choose “Student”, enter any email/password, submit → redirect to `/dashboard`.
2. **Dashboard** (`/dashboard`) — Overall score, completed/in-progress/upcoming tests, domain progress, charts (bar, line, pie). “View All” for tests links to `/tests`. Test cards link to `/tests/[testId]` or `/results` when completed.
3. **Domains** (`/domains`) — List of cognitive domains with progress and capacities. “View Details” → navigates to `/domains/{domainId}` (this route does **not** exist yet).
4. **Tests** (`/tests`) — List of all assessments: summary stats, progress bar, info callout, and per-test cards (title, domain, status, type, duration, due date). "Start test" / "Continue" → `/tests/[testId]`, "View results" → `/results`.
5. **Take test** (`/tests/[testId]`) — Question types: MCQ, text, drawing (canvas), audio (UI only). Timer, prev/next, submit → redirect to `/results`.
6. **Results** (`/results`) — Overall score, capacity profile (radar), strengths/weaknesses (bar), domain breakdown, trend line, recommendations, “Download Report” / “Return to Dashboard”.
7. **Profile** — Sidebar “Profile” → `/profile` (this page does **not** exist).
8. **Profile setup** (`/profile-setup`) — Onboarding form (name, age, scholar level, math scores, teacher). Not linked from login; submit → `/dashboard`.

### 2. Teacher flow

1. **Landing** (`/`) — Choose “Teacher”, login → redirect to `/teacher/dashboard`.
2. **Dashboard** (`/teacher/dashboard`) — Total students, class average, “Need Support” count, charts (domain performance, student scatter, completion trend), weak areas, quick actions (Generate Report, Assign Assessment, etc. — no behavior yet), **class roster table** with “View” → `/teacher/students/[studentId]`.
3. **Student detail** (`/teacher/students/[studentId]`) — Profile card, metrics, capacity radar, domain progress bars, performance trend (area chart), assessment history, weak areas, teacher actions (Send Assignment, etc. — no behavior).
4. **Students list** — Sidebar “Students” links to `/students` but the app uses `/teacher/students/[studentId]`; there is **no** `/students` or `/teacher/students` list page.
5. **Analytics / Reports / Profile** — Sidebar links to `/analytics`, `/reports`, `/profile`; **none of these routes exist**.

---

## Route Map (Existing vs Missing)

| Route | Exists | Notes |
|-------|--------|--------|
| `/` | ✅ | Login (student/teacher) |
| `/dashboard` | ✅ | Student dashboard |
| `/domains` | ✅ | Domain list |
| `/domains/[domainId]` | ❌ | Linked from domains page |
| `/profile-setup` | ✅ | Student onboarding (not linked from login) |
| `/results` | ✅ | Student results |
| `/tests` | ✅ | Tests list: all assessments, progress, start/continue/results |
| `/tests/[testId]` | ✅ | Single test taking |
| `/profile` | ❌ | Sidebar “Profile” (both roles) |
| `/teacher/dashboard` | ✅ | Teacher dashboard |
| `/teacher/students` | ❌ | Teacher students list (roster only on dashboard) |
| `/teacher/students/[studentId]` | ✅ | Student detail |
| `/students` | ❌ | Sidebar “Students” (teacher) — should align with teacher routes |
| `/analytics` | ❌ | Sidebar (teacher) |
| `/reports` | ❌ | Sidebar (teacher) |

---

## Summary

- **Front-end only**: Next.js + React + Tailwind + mock data; no backend or persistence.
- **Two roles**: Student (assessments, domains, results) and Teacher (class, student detail).
- **Broken or missing navigation**: `/domains/[domainId]`, `/profile`, `/students` (or `/teacher/students`), `/analytics`, `/reports`; sidebar and dashboard links don’t all match. **Tests list** (`/tests`) is implemented.
- **No auth/session**: login is a one-time redirect; no protection or user state.
- **Good foundations**: Clear data model, reusable UI components, dashboards and charts in place. Making the app “more complete and clean” mainly means adding missing pages, fixing nav, and optionally adding a thin data/auth layer.

See **IMPROVEMENT_PLAN.md** for concrete next steps to develop the app further.
