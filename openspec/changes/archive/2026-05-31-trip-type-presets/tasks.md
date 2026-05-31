## 1. State & persistence

- [x] 1.1 Extend `state` initial value in `app.js` to `{ trips: [], tripTypes: [] }`.
- [x] 1.2 Update `loadState()` to accept payloads where `tripTypes` is missing/invalid by defaulting to `[]` without showing the corrupt-data warning.
- [x] 1.3 Confirm `saveState()` already serialises the full `state` object (no code change expected, just verify).
- [x] 1.4 Smoke-test load with three saved payloads: (a) legacy `{trips:[...]}`, (b) new shape, (c) malformed JSON — each should behave per spec.

## 2. Router & navigation

- [x] 2.1 Add `#settings` route handling in `router()` that calls a new `renderSettings(app)` function.
- [x] 2.2 Ensure unknown hashes still redirect to `#trips`.
- [x] 2.3 Verify browser back/forward still works across `#trips ↔ #settings ↔ #trip/<id>`.

## 3. Settings entry-point button (area 1 in mockup)

- [x] 3.1 Add a `settings` (gear) entry to the `ICONS` object in `app.js`.
- [x] 3.2 In `renderTripList()`, add a settings button to `.view-header` linking to `#settings` with an `aria-label`.
- [x] 3.3 Add CSS in `style.css` to position the button at the trailing edge of `.view-header`, ensure ≥ 44 px tap target, and prevent overflow at 320 px.

## 4. Trip-type dropdown on add-trip form (area 2 in mockup)

- [x] 4.1 In `renderTripList()`, add a `<select id="input-trip-type">` inside `#form-add-trip` with a default `<option value="">（無）</option>` followed by one option per `state.tripTypes` (escape names).
- [x] 4.2 Style the dropdown so it stacks under the name input on narrow viewports and may share a row on ≥ 600 px without breaking the submit button.
- [x] 4.3 Update the add-trip submit handler: read the selected `typeId`; if non-empty, look up the type and deep-copy each preset item into the new trip's `items` (each item gets `genId()`, `departureChecked:false`, `returnChecked:false`); set `trip.typeId` accordingly (or `null`).
- [x] 4.4 Reset the dropdown to `（無）` after a successful add.

## 5. Settings page — trip-type CRUD

- [x] 5.1 Implement `renderSettings(app)` using `.page-shell` / `.content-panel`, a `返回旅程` back link to `#trips`, kicker `Settings`, and heading `旅程類型設定`.
- [x] 5.2 Add a top-level `#form-add-trip-type` form (name input + submit) reusing `.add-form` styles; show inline error for blank name.
- [x] 5.3 Submit handler: push `{ id, name, createdAt, presetItems: [] }` to `state.tripTypes`, `saveState()`, re-render.
- [x] 5.4 Render an empty-state card when `state.tripTypes.length === 0`.
- [x] 5.5 Render each trip type as a card with: editable name (inline edit pattern from item rows), delete button (confirm before delete, then re-render), and its preset-item section (task group 6).

## 6. Settings page — preset-item CRUD per type

- [x] 6.1 Inside each trip-type card, render an "add preset item" sub-form (name + qty, mirrors `#form-add-item`) with its own error region.
- [x] 6.2 Submit handler validates non-empty name and positive integer qty, appends `{id, name, qty}` to the type's `presetItems`, `saveState()`, re-renders.
- [x] 6.3 Render preset items as a table/list (reuse `.item-table` styling but without checkbox columns) showing name, qty, edit, delete.
- [x] 6.4 Wire inline edit (save/cancel) and delete (with `confirm()`), persisting via `saveState()` and re-rendering after each action.

## 7. Styling

- [x] 7.1 Add CSS for the new settings-page layout reusing existing tokens (panel padding, kicker, action-group, btn-icon). Do NOT modify any existing rule; only add new selectors scoped to the new elements.
- [x] 7.2 Add CSS for the trip-list settings button (icon-only on mobile, icon + label on ≥ 600 px optional), reusing `.btn-icon` styles where possible.
- [x] 7.3 Style the new `<select id="input-trip-type">` to visually match existing `<input>` fields (same border, radius, padding, font-size, focus state) by adding a single new selector — do not alter `.input-group input`.
- [x] 7.4 Verify at 320 px, 375 px, 600 px, and 1024 px there is no horizontal scroll on either view.

## 8. UI fidelity & non-regression

- [x] 8.1 Confirm new markup uses only existing classes (`.page-shell`, `.content-panel`, `.view-header`, `.section-kicker`, `.add-form`, `.surface-panel`, `.input-group`, `.btn-primary`, `.btn-icon`, `.btn-icon-edit`, `.btn-icon-danger`, `.item-table`, `.item-row`, `.field-error`, `.empty-state`, `.btn-back`) plus at most the small set of new selectors listed in task 7.
- [x] 8.2 Confirm the new `settings` icon entry in `ICONS` follows the existing inline-SVG stroke style (24×24 viewBox, `stroke-width: 1.8`, `stroke-linecap="round"`, `stroke-linejoin="round"`).
- [x] 8.3 Visual diff at empty state: open the app with no trip types defined and the dropdown left at `（無）` — confirm the trip-list view (cards, empty state, add-form layout apart from the appended dropdown row) is visually equivalent to the pre-change build.
- [x] 8.4 Regression pass: walk through every existing flow (create trip, open trip, add item, toggle departure checkbox, toggle return checkbox, inline-edit item, delete item with confirm, delete trip with confirm, refresh page, unknown hash redirect) and confirm behaviour is unchanged.
- [x] 8.5 Diff `app.js`: the existing functions `loadState`, `saveState`, `showStorageWarning`, `genId`, `esc`, `icon`, `renderTripDetail`, `buildItemRow`, `bindItemActions`, `updateRowClass`, and the existing branches of `router()` must remain functionally identical (additive edits only where strictly required, e.g. extending `loadState` to default `tripTypes` to `[]`).
- [x] 8.6 Diff `style.css`: confirm no existing rule has been modified or removed; only new selectors were appended.

## 9. Verification

- [x] 9.1 Manual test: create a "潛水" type with 3 preset items, then create a new trip selecting "潛水"; confirm the trip's items list contains those 3 items, unchecked, with new IDs.
- [x] 9.2 Manual test: edit one preset on "潛水" after the trip is created; confirm the existing trip's items are unchanged.
- [x] 9.3 Manual test: delete the "潛水" type; existing trip remains intact; dropdown no longer offers "潛水".
- [x] 9.4 Manual test: reload after each of the above; data restored exactly.
- [x] 9.5 Manual test: open in a fresh browser with a legacy payload pre-seeded; app loads with trips intact and empty `tripTypes`, no warning shown.
- [x] 9.6 Run `openspec validate trip-type-presets --strict` and resolve any issues.
