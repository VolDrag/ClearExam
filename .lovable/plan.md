## Phase: Auth, Filters & Revision Bank

A large multi-system change. Plan before implementing.

### 1. Authentication
- Add Supabase Auth (email/password + Google) via `supabase--configure_social_auth`.
- New routes: `/auth` (login + register tabs), `/auth/reset` (forgot password), `/auth/update-password` (recovery landing).
- Use the integration-managed `_authenticated/route.tsx` layout (ssr:false, redirects to `/auth`).
- Move `dashboard.tsx`, `exam.tsx`, `chat.$threadId.tsx`, `chat.index.tsx`, `history.tsx`, and new `revision.tsx` under `src/routes/_authenticated/`.
- `/` (landing) stays public.
- On signup, capture `active_track` selection; `handle_new_user` trigger already creates a profile row — extend it to read `raw_user_meta_data->>'active_track'` and store in `user_sessions.active_track`.
- Navbar shows Sign In CTA when logged out, avatar + Sign Out when logged in.
- Wire `onAuthStateChange` once in `__root.tsx` for router invalidation.

### 2. Granular Filters (University + Year)
- Schema additions to `questions` table (migration): `university text`, `year int` columns (nullable, indexed). Backfill from existing `citations.label` text where possible; otherwise leave NULL and treat as "Mixed".
- New server fn `getExamFilters({ track })` returning available `{ universities: [], years: [] }`.
- Refactor `/exam` config screen: cascading selects — Track → University (or "All") → Year (or "All") → Subject → Start.
- Server fn `getExamQuestions({ track, university, year, subject, count })` filters dynamically via supabaseAdmin.
- Empty state component when 0 questions returned: "No questions available for this combination yet."

### 3. Revision Bank (Spaced Repetition lite)
- New table `revision_bookmarks` (user_id, question_id, reason: 'incorrect'|'flagged'|'manual', created_at, last_reviewed_at, review_count).
- Bookmark button on every wrong/flagged question in exam results screen.
- New route `/_authenticated/revision` listing bookmarked questions with subject/track filters, "Remove" and "Review with Tutor" actions.
- AI tutor: new "Rapid Fire" mode — button on chat composer pulls N bookmarks and seeds a quick-quiz prompt; chat endpoint detects rapid-fire payload and structures Socratic follow-ups.

### Files to create
- `supabase/migrations/<new>.sql` — auth metadata trigger update, `questions.university/year`, `revision_bookmarks` table + grants + RLS + trigger.
- `src/routes/auth.tsx`, `src/routes/auth.reset.tsx`, `src/routes/auth.update-password.tsx`.
- `src/routes/_authenticated/route.tsx` (managed shape).
- Move existing protected routes under `_authenticated/` (rename files).
- `src/routes/_authenticated/revision.tsx`.
- `src/lib/auth.functions.ts`, `src/lib/exam-filters.functions.ts`, `src/lib/revision.functions.ts`.
- `src/components/AuthForm.tsx`, `src/components/EmptyFilterState.tsx`, `src/components/BookmarkButton.tsx`.
- i18n updates (zero hyphens in all new copy).

### Open question for user
Phase 1 is large; before I execute, one decision is needed:

**Existing local data migration.** The current exam engine + chat thread store data in `localStorage` keyed anonymously. After auth lands, should I:
- **(a)** Wipe local anonymous data on first sign in (cleanest, simplest), or
- **(b)** One time import local exam history / chat threads into the authenticated user's account on first sign in?

Pick (a) or (b) and I will implement the full phase in one pass.
