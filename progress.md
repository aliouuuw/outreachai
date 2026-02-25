# Progress

## 2026-02-25

- Implemented `foundation-01` design system foundations.
- Added design token CSS variables in `src/app/tokens.css` (spacing, typography, color, shadow, radius, breakpoints).
- Wired tokens into global styles by importing `tokens.css` from `src/app/globals.css`.
- Created copy constants stubs in `src/copy/`:
  - `errors.ts`
  - `labels.ts`
  - `empty-states.ts`
  - `notifications.ts`

### Decisions

Decision: Use `src/app/tokens.css` as the canonical design token source and bridge existing Tailwind `@theme` variables to these tokens.
Alternatives considered: Keep the existing ad-hoc `@theme` tokens in `globals.css`, or fully migrate all existing CSS to the new token names immediately.
Reason: Keeps a single token source of truth while minimizing churn in the current marketing-page CSS.
Consequences: Future UI components should use the canonical token names directly; legacy `--color-*` aliases may be removed later once the old styles are migrated.

### foundation-02 — Design Gate

**User mental model:** Users expect consistent, reusable UI primitives that clearly communicate state: “there’s nothing yet,” “it’s loading,” “something went wrong,” “please confirm,” and “here’s a toast message.” These patterns should feel cohesive with the brand and be accessible everywhere they appear.

**New components:** EmptyState, ErrorState, LoadingState, ConfirmDialog, Toast

**Existing components extended:** Button, Modal (used within ConfirmDialog), Card/typography utilities for layout

**States documented:** Yes — per component below

**Hierarchy decision:** Each component has a single primary element: message stack (Empty/Error), skeleton block (Loading), dialog content (ConfirmDialog), toast body (Toast). Secondary elements: actions (buttons, retry, CTA). Supporting: icons/status visuals.

**Design system gaps flagged:** None; all spacing, typography, color, motion can use existing tokens.

**Assumptions flagged:**
- Toast delivery can be local (no global queue yet); acceptable for foundation.
- ConfirmDialog can reuse existing Modal without additional animation tokens.
- Empty/Error CTAs can use existing Button variants without new sizes.

**State inventory (components):**
- EmptyState: displays title, description; optional icon; optional primary CTA; layout uses token spacing; focusable CTA.
- ErrorState: title + description; retry action (required); optional errorCode; optional secondary action; keyboard-focusable buttons.
- LoadingState: skeleton shapes via `shape` prop (e.g., card, list, table-row); match loaded layout; animated with opacity/transform only.
- ConfirmDialog: states — default, hover, active, focus, disabled for buttons; confirm in-flight (loading) state; clear primary vs secondary emphasis; escape/overlay close optional but clear.
- Toast: variants success/error/warning/info; optional action button; auto-dismiss duration; focus/hover pause optional later; respects reduced motion (opacity/transform only).

**Gate status:** Ready to implement.

### infra-01 — Implementation

**Status:** Complete
**Time:** ~1h

**What was built:**
Docker Compose config for local PostgreSQL, Drizzle ORM schema for all four core tables (`users`/`sessions`/`accounts`/`verifications`, `subscriptions`, `usage_quotas`, `saved_leads`), initial SQL migration generated, and all db scripts wired into `package.json`.

**Artifacts produced:**
- `docker-compose.yml` — PostgreSQL 16 service with health check and named volume
- `.env.example` — all required env vars documented with instructions
- `src/db/schema/users.ts` — users + sessions + accounts + verifications (better-auth compatible)
- `src/db/schema/subscriptions.ts` — subscription tier/status enums + subscriptions table
- `src/db/schema/usage_quotas.ts` — per-period usage counters (leadSearches, leadsReturned, aiMessages)
- `src/db/schema/saved_leads.ts` — saved lead records with full Google Places field set
- `src/db/schema/index.ts` — barrel export
- `src/db/index.ts` — drizzle client singleton
- `drizzle.config.ts` — drizzle-kit config pointing at schema
- `drizzle/0000_quiet_kingpin.sql` — initial migration (7 tables)

**Dependencies installed:** `drizzle-orm@0.45.1`, `postgres@3.4.8`, `drizzle-kit@0.31.9`

**Scripts added to package.json:**
- `db:generate` — generate new migration from schema diff
- `db:migrate` — apply migrations to database
- `db:push` — push schema directly (dev only)
- `db:studio` — open Drizzle Studio
- `db:setup` — start Docker + run migrations

**Design decisions:**
- Used `postgres` (postgres.js) driver over `pg` — better performance, native async/await, no callback hell
- `users` table schema matches better-auth expectations exactly so auth-01 can drop in without migration changes
- `subscriptions` uses DB-level enums for `tier` and `status` — enforces valid values at the database layer
- `usage_quotas` tracks per-period (not cumulative) usage — period boundaries come from Stripe's billing cycle
- `drizzle.config.ts` uses `?? fallback` URL so `drizzle-kit generate` works without env vars; migrate/push still require DATABASE_URL at runtime

**Assumptions made:**
- better-auth v1 expects the exact column names used in `users`/`sessions`/`accounts`/`verifications` tables
- UUID generation for IDs will be handled at the application layer (not DB default) to keep it consistent with better-auth

**UI QA:** N/A (non-UI task)

---

### foundation-02 — Implementation

- Added shared pattern components in `src/components/ui/`:
  - `EmptyState` (title, description, optional icon, optional primary/secondary action via Button)
  - `ErrorState` (retry required, optional errorCode, optional secondary action, token-based error color)
  - `LoadingState` (shape prop: card/list/table-row/text, supports multiple lines, pulse animation, aria-label for accessibility)
  - `ConfirmDialog` (Modal-based, confirm/cancel labels, danger variant styling via tokens, focus management)
  - `Toast` (variants success/error/warning/info, optional action, auto-dismiss with close control)
- Re-exported these from `src/components/ui/index.ts` for unified imports.
- Populated copy constants with French messages (primary language):
  - `errors.ts`: common error messages
  - `labels.ts`: UI action labels
  - `empty-states.ts`: empty state messages
  - `notifications.ts`: success/error notifications
- Adjusted neutral color scale in tokens to match existing dark theme palette.
- Verified with `bun run type-check` (passes).
