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
