## 1. Shared UI state and jump-search plumbing

- [x] 1.1 Add transient UI state for expanded trip card, expanded trip-type card, and pending scroll/highlight target without changing persisted localStorage data.
- [x] 1.2 Implement shared helpers for dropdown query submission, card-target lookup, post-render scroll-into-view, and temporary highlight/focus behavior.
- [x] 1.3 Add reusable collapse/expand icon affordances and any shared rendering helpers needed by both trip and trip-type cards.

## 2. Trip list collapsible cards and trip query

- [x] 2.1 Add the trip query dropdown and query button to the `#trips` page using existing form/select styling and disable or empty-state behavior when no trips exist.
- [x] 2.2 Refactor trip-card rendering so cards default to collapsed summary state and expose an explicit toggle control with single-card expansion behavior.
- [x] 2.3 Render inline trip management content inside the expanded trip card by reusing existing add-item, validation, item-list, and item-action behavior from the dedicated trip-detail flow.
- [x] 2.4 Preserve a dedicated control that still navigates to `#trip/<id>` and verify the route-based detail page remains functional after the list-page expansion work.

## 3. Trip-type settings collapsible cards and type query

- [x] 3.1 Add the trip-type query dropdown and query button to the settings page using the existing visual vocabulary and disabled or empty-state behavior when no types exist.
- [x] 3.2 Refactor trip-type card rendering so cards default to collapsed summary state and expose an explicit toggle control with single-card expansion behavior.
- [x] 3.3 Ensure expanded trip-type cards continue to support rename, delete, add preset item, edit preset item, and delete preset item flows with the same validation and persistence outcomes as before.

## 4. Responsive polish and verification

- [x] 4.1 Update `style.css` so jump-search controls wrap cleanly on 320 px mobile widths and collapse controls remain touch-friendly.
- [ ] 4.2 Verify expanded trip cards and expanded trip-type cards do not introduce horizontal scrolling on narrow screens.
- [ ] 4.3 Manually test jump-to-card, collapse/expand, inline editing, delete confirmations, and route navigation across both pages.
