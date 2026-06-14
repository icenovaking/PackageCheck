## Context

PackCheck is currently a client-side SPA with hash routing, localStorage persistence, and HTML assembled directly inside `app.js`. The trip list page renders summary-only trip cards, while the settings page renders fully expanded trip-type cards containing preset-item forms and tables. On narrow mobile screens, fully expanded cards quickly consume the entire viewport, and there is no direct way to jump to a specific existing trip or trip type from long lists.

This change affects two separate surfaces that already share the same visual language but use different interaction patterns:

- The trip list page must gain inline expansion behavior without removing the existing `#trip/<id>` route.
- The trip-type settings page must keep its existing management controls but hide them behind a compact collapsed header by default.

Because rendering is string-based and rerender-driven, the change must define how ephemeral UI state survives rerenders without polluting persisted storage.

## Goals / Non-Goals

**Goals:**

- Reduce vertical scrolling on phones by making trip cards and trip-type cards collapsed by default.
- Let users jump directly to an existing trip or trip type by selecting it from a dropdown and pressing a query action.
- Keep the new controls visually consistent with the existing `surface-panel`, `trip-tag`, `header-chip`, `btn-primary`, and `select-input` vocabulary.
- Preserve the existing localStorage data model and the dedicated trip-detail route.
- Keep item-management and preset-management behavior consistent between inline expanded views and existing dedicated flows.

**Non-Goals:**

- Introducing backend search, fuzzy matching, or free-text filtering.
- Changing the underlying trip, trip type, or item storage schema.
- Removing the dedicated `#trip/<id>` page.
- Redesigning the app's color system, typography, or page structure.

## Decisions

### 1. Use transient UI state for expansion and jump targeting

Expansion state and pending jump targets will live in an in-memory UI state object rather than inside persisted trip or trip-type records. This keeps localStorage payloads stable and avoids migration work for purely presentational state.

Chosen approach:

- Track one expanded trip card ID and one expanded trip-type card ID.
- Track one pending scroll target after a jump-search action or post-mutation rerender.
- Reset this UI state on full page refresh, which is acceptable because collapse state is convenience state rather than durable user data.

Alternative considered:

- Persisting collapse state in localStorage.
  Rejected because it adds schema complexity without user value proportional to the added maintenance cost.

### 2. Default to a single expanded card per page

Only one trip card and one trip-type card may be expanded at a time within their respective pages. This maximizes the space-saving benefit on mobile and simplifies scrolling, search targeting, and rerender behavior.

Chosen approach:

- Expanding a card collapses any previously expanded sibling card on the same page.
- Searching for a card expands the selected card and collapses any previously expanded one.

Alternative considered:

- Allowing multiple cards to remain open simultaneously.
  Rejected because it recreates the long-scroll problem the change is intended to solve.

### 3. Keep jump search explicit and dropdown-based

Both pages will add a compact jump-search form above the card list. Each form will use a dropdown of existing entities plus a dedicated query button rather than auto-jumping on selection.

Chosen approach:

- `我的旅程` page: dropdown of existing trip names in creation order.
- `旅程類型設定` page: dropdown of existing type names in creation order.
- Query action expands the target card, rerenders if needed, scrolls it into view, and applies a temporary highlight/focus cue.

Alternative considered:

- Free-text search with live filtering.
  Rejected because the user explicitly requested dropdown selection and direct jump behavior, not filtering.

### 4. Inline expanded trip cards will expose a quick-manage view while preserving the full-detail route

The trip list page will gain an expanded card body that reveals the trip's actionable content inline. The existing `#trip/<id>` route remains the canonical full-detail page and is still reachable through a dedicated control inside the card.

Chosen approach:

- Expanded trip cards reuse the same item-management structure and logic as the current detail view as much as possible.
- The inline version exposes the add-item form, item error area, and item list/table.
- A dedicated control remains available to open the full route-based detail page.

Alternative considered:

- Leaving expanded trip cards as summary-only and using them only as navigation launchers.
  Rejected because it would not satisfy the user's stated goal of opening the card content directly from the trip list.

### 5. Trip-type cards will collapse only their body, not their header actions

Trip-type cards already place rename/delete actions in the header. The collapse mechanism should hide the preset form and preset list while preserving the identifying header and management actions.

Chosen approach:

- Collapsed state shows `Trip Type` tag, type name, and action/toggle controls.
- Expanded state reveals the existing preset add form, validation area, and preset table/empty state.

Alternative considered:

- Moving edit/delete controls into the expanded body.
  Rejected because it increases friction for frequent type-management actions and deviates from the current header-first pattern.

## Risks / Trade-offs

- [Inline trip management duplicates detail-view complexity] -> Mitigation: reuse existing item row builders and handlers wherever possible instead of creating a second independent item-management flow.
- [Rerender timing can break smooth scroll-to-card behavior] -> Mitigation: set a pending target ID before rerender and perform scroll/highlight after the target node exists in the DOM.
- [Single-open accordion behavior may surprise users expecting multiple open cards] -> Mitigation: keep the expand/collapse affordance obvious and make search actions consistently collapse sibling cards.
- [Long item tables can still create a tall expanded card] -> Mitigation: collapsed-by-default behavior limits this to only the active card, which is the main usability improvement requested.

## Migration Plan

No persisted-data migration is required because the change does not alter trip, trip-type, or item storage shape.

Rollout steps:

1. Add transient UI state and rendering branches for collapsed/expanded cards.
2. Add jump-search controls and scroll/highlight behavior on both pages.
3. Reuse or extract shared item/preset rendering helpers to support inline expanded cards.
4. Verify routing, add/edit/delete flows, and mobile layout after rerenders.

Rollback strategy:

- Remove the transient UI state and new search controls.
- Restore list rendering to the current always-summary trip cards and always-expanded type cards.

## Open Questions

None at proposal time. The current change assumes the query button labels and dedicated full-detail control labels can be finalized during implementation without changing behavior.
