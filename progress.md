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
- Updated SDLC artifacts:
  - Expanded `prd.json` into a comprehensive backlog with normalized story contract fields (`epic`, `persona`, `user_story`, `out_of_scope`, `definition_of_done`)
  - Updated `sdlc-state.md` to reflect current stage progress and next task

- Fixed Tailwind utility overrides caused by an unlayered global `* { padding: 0; }` reset by moving base resets into `@layer base` in `src/app/globals.css`.
- Refined login/signup UI spacing and readability now that Tailwind utilities apply correctly.
- Improved better-auth + Drizzle DX for Neon:
  - `drizzle.config.ts` now loads `DATABASE_URL` from `.env.local` for CLI runs and fails fast if missing (prevents accidental localhost migrations).
  - Added the missing better-auth session `token` field to `sessions` schema and generated/applied a migration.
- Updated Next middleware route protection to avoid DB-backed session lookups in Edge runtime; middleware now uses auth-cookie presence checks for redirects.
- Restored visible cursor on authenticated pages by rendering custom cursor DOM nodes in `src/app/layout.tsx`.
- Converted French error copy in `src/copy/errors.ts` (and dashboard welcome text) back to English.

### Decisions

Decision: Use `src/app/tokens.css` as the canonical design token source and bridge existing Tailwind `@theme` variables to these tokens.
Alternatives considered: Keep the existing ad-hoc `@theme` tokens in `globals.css`, or fully migrate all existing CSS to the new token names immediately.
Reason: Keeps a single token source of truth while minimizing churn in the current marketing-page CSS.
Consequences: Future UI components should use the canonical token names directly; legacy `--color-*` aliases may be removed later once the old styles are migrated.

Decision: Avoid database-backed session validation inside Next.js `middleware` (Edge runtime).
Alternatives considered: Continue calling `auth.api.getSession` in middleware; implement JWT decoding in middleware.
Reason: Edge runtime + Postgres client usage caused intermittent INTERNAL_SERVER_ERROR and session lookup failures; cookie presence checks are sufficient for redirect gating.
Consequences: Protected server routes/pages must validate the session in the Node runtime (API routes / server actions) for authoritative access control.

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

### quota-01 — Implementation

**Status:** Complete
**Time:** ~1h

**What was built:**
Usage quota system with per-period tracking, plan limit enforcement, and usage increment helpers. The existing `/api/leads` route is now fully gated by auth + quotas.

**Artifacts produced:**
- `src/lib/quota.ts` — `PLAN_LIMITS` constants, `assertWithinPlanLimits`, `incrementUsage`, `getQuotaStatus`, `QuotaExceededError`, `getOrCreateQuota`
- `src/app/api/quota/route.ts` — GET endpoint returning current usage + limits for authenticated user
- `src/app/api/leads/route.ts` — updated to require auth, check `lead_search` quota before Apify call, increment `lead_search` + `leads_returned` after successful scrape

**Design decisions:**
- `PLAN_LIMITS` is a single mapping indexed by `SubscriptionTier × QuotaAction` — one place to update quotas for all plans
- `getOrCreateQuota` uses the subscription's `currentPeriodStart/End` as the quota window, falling back to the calendar month for starter plan users with no subscription row
- `assertWithinPlanLimits` and `incrementUsage` are separate operations — assert before calling Apify (fast, cheap), increment after success (atomic update)
- `QuotaExceededError` is a typed error class — allows API routes to differentiate quota failures from generic errors cleanly
- Quota column mapping uses `satisfies` constraint to catch drift between `QuotaAction` keys and schema column names at compile time
- French error messages for quota exceeded responses — matches primary UI language

**Assumptions made:**
- Usage increments are fire-and-forget after a successful API response — occasional increment failures (e.g., DB blip) will result in undercounting, not overcounting; acceptable for this use case
- Per-period reset is automatic by virtue of `getOrCreateQuota` creating a new row when no row covers the current date

**UI QA:** N/A (non-UI task)

---

### payment-01 — Implementation

**Status:** Complete
**Time:** ~1.5h

**What was built:**
Full Stripe subscription integration with checkout session creation, billing portal access, and webhook handler for the full subscription lifecycle.

**Artifacts produced:**
- `src/lib/stripe.ts` — Stripe client singleton, `createCheckoutSession`, `createBillingPortalSession`, plan→priceId mapping
- `src/app/api/stripe/checkout/route.ts` — POST endpoint to create Stripe Checkout sessions for pro/agency plans
- `src/app/api/stripe/portal/route.ts` — POST endpoint to create Stripe Billing Portal sessions
- `src/app/api/stripe/webhook/route.ts` — Webhook handler for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

**Design decisions:**
- Stripe v20 (`stripe@20.x`) uses `2026-01-28.clover` API version — `current_period_start/end` moved to `SubscriptionItem`, `Invoice.subscription` removed in favor of `invoice.parent.subscription_details.subscription`
- `upsertSubscription` helper handles both first-time insert and subsequent updates from webhooks — single code path for all subscription state changes
- Subscription metadata includes `userId` on checkout session and subscription object — enables webhook to map Stripe events back to app users without database lookup by email
- `mapStripePlanToTier` uses env var comparison — price IDs never hardcoded in logic
- Webhook raw body parsing: Next.js App Router returns `request.text()` which preserves raw body for Stripe signature verification

**Assumptions made:**
- Stripe subscription `metadata.userId` is set at checkout and propagated to subsequent subscription events — must be verified with Stripe CLI testing
- `invoice.parent.subscription_details.subscription` is the correct v20 path for subscription ID on failed invoices (verified against Stripe v20 type definitions)

**UI QA:** N/A (non-UI task)

---

### auth-01 — Implementation

**Status:** Complete
**Time:** ~1.5h

**What was built:**
Full better-auth integration with email/password login, session management, Next.js middleware route protection, and login/signup pages.

**Artifacts produced:**
- `src/lib/auth.ts` — better-auth server instance with drizzle adapter, email/password, 30-day sessions
- `src/lib/auth-client.ts` — browser-side auth client with signIn/signUp/signOut/useSession exports
- `src/lib/auth-middleware.ts` — `getSessionFromRequest` and `requireSession` helpers for API routes
- `src/app/api/auth/[...all]/route.ts` — catch-all better-auth Next.js handler
- `src/middleware.ts` — route protection: `/leads`, `/dashboard`, `/settings` require auth; `/login`, `/signup` redirect if already authenticated
- `src/app/login/page.tsx` — login form with error state, loading state, callbackUrl redirect
- `src/app/signup/page.tsx` — signup form with validation, error state, loading state
- `src/app/dashboard/page.tsx` — stub dashboard (redirected to after login/signup)

**Design decisions:**
- `drizzleAdapter` wired directly to existing schema — no migration needed, tables already match better-auth column expectations
- `toNextJsHandler` from `better-auth/next-js` for zero-boilerplate route handler
- Middleware uses `auth.api.getSession` server-side (not JWT decode) — single source of truth, no stale session risk
- Login/signup pages use token CSS variables directly — consistent with design system, no Tailwind aliases needed
- `callbackUrl` query param preserved through login redirect so users land back where they started

**Assumptions made:**
- better-auth v1 column names match our schema (verified against docs: id, email, name, emailVerified, image for users table)
- Session cookie is httpOnly and set automatically by better-auth — no manual cookie handling needed

**UI QA:** N/A (minimal stub UI; full auth UI polish is deferred to dashboard-01)

---

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

---

### auth-02 — Implementation

**Status:** Complete
**Time:** ~1h

**What was built:**
Email verification, password reset, and logout UX flows. Users can now verify their email after signup, reset forgotten passwords, and log out from authenticated pages.

**Artifacts produced:**
- `src/lib/auth.ts` — updated with `requireEmailVerification: true`, `sendResetPasswordEmail: true`, `emailVerification` config, `resetPasswordTokenExpiresIn: 3600`
- `src/app/forgot-password/page.tsx` — form to request password reset email; calls `/api/auth/forgot-password` endpoint; shows success state with email confirmation message
- `src/app/reset-password/page.tsx` — form to set new password with token validation; calls `/api/auth/reset-password` endpoint; includes password confirmation and minimum length validation (8 chars)
- `src/app/login/page.tsx` — updated with "Mot de passe oublié ?" link to forgot-password page
- `src/app/dashboard/page.tsx` — updated with logout button that calls `signOut()` and redirects to login
- `src/middleware.ts` — added `/forgot-password` and `/reset-password` to `AUTH_PATHS` so they're accessible without authentication
- `src/copy/labels.ts` — added `auth` section with login, logout, signup, forgotPassword, resetPassword, sendResetLink, email, password, confirmPassword labels

**Design decisions:**
- better-auth's built-in email verification and password reset flows are used via `/api/auth/forgot-password` and `/api/auth/reset-password` endpoints (no custom implementation needed)
- Forgot-password page shows success state with email confirmation message to prevent email enumeration attacks
- Reset-password page validates token presence and password requirements client-side before submission
- Logout button placed in dashboard (stub page) — will be moved to persistent app shell (auth-02 dependency for app-shell-01)
- All auth pages use token CSS variables for consistent styling with design system

**Assumptions made:**
- better-auth's email sending is configured via environment variables (SMTP or third-party service) — not implemented here, assumed to be set up separately
- Token validation happens server-side in better-auth's `/api/auth/reset-password` endpoint
- Email verification link is sent automatically on signup per `emailVerification.sendOnSignUp: true` config

**UI QA:** Pass — all states implemented (form, loading, error, success); responsive design; accessible form inputs and buttons

**Type-check:** Pass (`tsc --noEmit` returns exit code 0)

---

### app-shell-01 — Design Gate

**User mental model:** The user thinks they're working inside a business tool and need to move between lead finding, their saved leads, settings, and billing. They expect a navigation that stays visible while they work, clearly shows which section they're in, and gives them quick access to their account info and subscription details. On mobile, they expect the same navigation to be accessible via a menu button without losing their place.

**New components:** AppShell, Sidebar, NavLink, UserMenu, PlanBadge, MobileNav

**Existing components extended:** None (using Button, Modal as-is)

**States documented:** Yes — all states for loading, error, success, and interactive states documented

**Hierarchy decision:** Sidebar is primary (persistent), navigation links are primary within sidebar, user identity is primary in user menu

**Design system gaps flagged:** None

**Assumptions flagged:**
1. Session data available from auth context (validated — auth-client exists)
2. 5 nav links fit in sidebar (acceptable for MVP)
3. Plan badge placement in sidebar (accepted)

**Gate status:** ✅ Ready to implement

### app-shell-01 — Implementation

**Status:** Complete
**Time:** ~2h

**What was built:**
Full authenticated app shell with persistent sidebar navigation, user menu with session data, plan badge, and responsive mobile navigation. All authenticated routes now share a consistent layout with clear navigation and user context.

**Components created:**
- `AppShell` — Main layout wrapper that combines sidebar and content area
- `Sidebar` — Persistent navigation with desktop/mobile variants
- `NavLink` — Route link component with active state detection via usePathname
- `UserMenu` — User identity display with avatar/initials, name, email, plan badge, and logout
- `PlanBadge` — Subscription tier indicator with color-coded variants (starter/pro/agency)

**States implemented:** loading | error | success

**Design decisions:**
- NavLink uses `usePathname` for active route detection — matches exact path or path prefix
- Active state indicated via left border + primary color background + bold text
- Mobile nav uses fixed overlay with slide-in animation (200ms ease-out) and backdrop blur
- Hamburger menu button positioned fixed top-left on mobile, hidden on desktop (md breakpoint)
- User menu shows loading skeleton while session loads, error state with logout-only option if session fails
- Plan badge uses semantic colors: neutral for starter, primary for pro, warning for agency
- AppShell layouts created for all authenticated routes: /dashboard, /leads, /saved-leads, /settings, /billing
- Middleware updated to protect /saved-leads and /billing routes

**Assumptions made:**
- Session data from `useSession()` hook provides user.name, user.email reliably
- Subscription tier defaults to "starter" if not provided (acceptable for MVP before payment-ui-01)
- Mobile nav body scroll lock via `document.body.style.overflow = "hidden"` is sufficient (no need for scroll-lock library yet)

**Design Gate:** Completed — all components, states, and hierarchy decisions documented before implementation

**UI QA:** Pass
- ✅ All interactive states implemented (default, hover, active, focus, disabled)
- ✅ All data states implemented (loading, error, success)
- ✅ Keyboard navigation works (Tab, Enter, Escape)
- ✅ Focus states visible on all interactive elements
- ✅ Mobile responsive (hamburger menu, overlay, slide animation)
- ✅ Active route highlighting works correctly
- ✅ Logout action present and functional
- ✅ All spacing uses design system tokens
- ✅ All colors use design system tokens
- ✅ All typography uses design system scale

**Type-check:** Pass (`tsc --noEmit` returns exit code 0)
