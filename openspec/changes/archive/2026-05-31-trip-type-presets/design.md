## Context

PackCheck today is a single-page vanilla JS app with two views: a trip list (`#trips`) and a trip detail (`#trip/<id>`). All state lives in a single `state = { trips: [...] }` object persisted to `localStorage` under `packcheck_data`. Trips are created with an empty `items: []` array, so users must re-enter the same packing items for every new trip of a recurring activity (travel, diving, hiking, etc.).

This change introduces user-defined **trip types** that hold reusable item presets, plus UI surfaces to manage them and to select one when creating a trip.

## Goals / Non-Goals

**Goals:**

- Let users define and edit named trip types, each with an item template (name + qty).
- Let users select a trip type when creating a new trip; selected presets are copied into the new trip's items.
- Provide a discoverable entry point to the settings page from the trip-list header.
- Preserve all existing behavior when no trip type is selected (current empty-trip flow).
- Forward- and backward-compatible storage: existing saved data must continue to load.

**Non-Goals:**

- No retroactive sync: editing a trip type does NOT update items inside trips already created from it.
- No built-in default catalog of trip types (start empty; the user authors their own).
- No import/export, sharing, or cloud sync of types.
- No per-item categories, ordering, or tags within a type.
- No reordering of trip types via drag-and-drop (creation order is sufficient).

## Decisions

### Decision 1: Storage shape — one root object with a new `tripTypes` array

Extend the existing payload from `{ trips: [...] }` to `{ trips: [...], tripTypes: [...] }`. Each trip type:

```js
{
  id: string,          // genId()
  name: string,        // e.g. "潛水"
  createdAt: string,   // ISO timestamp
  presetItems: [
    { id: string, name: string, qty: number }
  ]
}
```

Each trip gains an optional `typeId: string | null` field recording which type seeded it (informational; null when "（無）" was chosen or when loading legacy data).

**Why:** Keeps a single `localStorage` key and one atomic write. `loadState` already tolerates missing/invalid data; we add a defensive `Array.isArray(parsed.tripTypes)` check and default to `[]`, so older saves continue to load without migration.

**Alternative considered:** A second `localStorage` key (`packcheck_trip_types`). Rejected — two-key writes risk partial saves and complicate the existing single-write `saveState()`.

### Decision 2: Preset application is a one-time deep copy at trip creation

When the user submits the add-trip form with a non-null type selected, we deep-copy each `presetItem` into a new item: `{ id: genId(), name, qty, departureChecked: false, returnChecked: false }`. The new IDs decouple trip items from preset items entirely.

**Why:** Matches the user's mental model ("preset filled my new trip") and avoids cascading edits or referential bookkeeping. Simpler code, no migration story when a type is later edited or deleted.

**Alternative considered:** Live reference by `presetItemId`. Rejected — surprising behavior when a preset is later renamed/deleted, and the checkbox state would need a parallel store per trip anyway.

### Decision 3: Settings as a new hash route `#settings`

Add `#settings` to the router alongside `#trips` and `#trip/<id>`. The settings page is rendered by a new `renderSettings(app)` function and reuses existing styles (`.page-shell`, `.content-panel`, `.add-form`, `.btn-primary`, etc.). A "返回旅程" back link mirrors the trip detail view.

**Why:** Consistent with the app's existing hash-based SPA pattern; browser back/forward keep working for free.

**Alternative considered:** Modal dialog. Rejected — managing N types with nested N preset items is too dense for a modal on mobile.

### Decision 4: Settings page structure — two-level form

The settings view shows a list of trip types. Each type card has:

- Inline-editable name, delete button.
- An "add preset item" sub-form (name + qty, same UX as the trip-detail add form).
- A list/table of preset items with inline edit + delete (mirrors the existing item-row pattern).

A top-level form creates a new trip type by name. Empty preset list is allowed (the type just doesn't seed anything).

**Why:** Reuses the existing add-form and item-row UI vocabulary so users immediately know how it works and CSS work is minimal.

### Decision 5: Trip-type dropdown placement

The dropdown sits inside the existing `#form-add-trip` `<form>`, before the submit button, as a third `.input-group`. The label is `旅程類型` and the first `<option value="">` is `（無）`. The dropdown is always present; when no types exist it still shows `（無）` and is effectively a no-op.

**Why:** Keeps the create flow in one form (single submit), no separate "advanced" toggle, and avoids hiding the feature behind a disclosure.

### Decision 6: Settings button placement

Add a button to `.view-header` of the trip-list view (top-right of the "我的旅程" panel — matches area 1 in the user's mockup). Style as a small ghost/secondary button with a gear icon (new entry in `ICONS`). Reuses the panel's flex header.

### Decision 7: Deleting a trip type

Deleting a trip type prompts for confirmation, then removes only the type. Existing trips are untouched (their `typeId` becomes a dangling reference, which is harmless because we never resolve it after creation). No cascading delete.

### Decision 8: UI fidelity — reuse, do not invent

All new UI MUST be built from the existing class/token vocabulary already used in `app.js` and `style.css`. Concretely:

- **Page shell**: settings view uses the same `<div class="page-shell"><header class="app-header">…</header><main class="page-main"><section class="content-panel">…` structure as `renderTripList` / `renderTripDetail`, including the brand lockup and `.header-chip`.
- **Headers**: use `.view-header` with `.section-kicker` + `<h2>`, identical typography to existing views. Back link uses the existing `.btn-back` + `icon("back")` pattern from the trip detail view.
- **Forms**: the new add-trip-type form and add-preset-item sub-forms reuse `.add-form.surface-panel`, `.input-group` (with the existing `<label>` above the `<input>` pattern), and `.btn-primary` with `icon("plus")`. Error messages reuse `.field-error.hidden` toggling, identical to the existing `#trip-error` and `#item-error` pattern.
- **Lists**: preset items in a type reuse `.item-table` markup (omitting the checkbox columns and their `<th>`s) and the same `.item-row`, `.col-name`, `.col-qty`, `.col-actions`, `.btn-icon`, `.btn-icon-edit`, `.btn-icon-danger` classes. Empty state uses `.empty-state` with an existing icon.
- **Settings button (area 1)**: reuses `.btn-icon` (icon-only) or a small ghost variant of `.btn-primary`-shaped button — whichever already exists. Lives inside the existing `.view-header` of the trip-list view, aligned trailing. A single new entry is added to `ICONS` (`settings` gear) following the same inline-SVG stroke style as `brand`, `route`, `back`, etc. (24×24, `stroke-width: 1.8`, `stroke-linecap: round`).
- **Trip-type dropdown (area 2)**: rendered as a third `.input-group` inside the existing `#form-add-trip`, using a native `<select>` styled to match existing `<input>` fields (same border, radius, padding, font-size). No custom dropdown component.

New CSS is permitted ONLY for the gear-button positioning, the `<select>` field styling (to match existing inputs), and minor layout tweaks for the settings page; no existing rules may be modified.

### Decision 9: Strict non-regression of existing UI and logic

When no trip types exist and the dropdown is left at `（無）`, the application's runtime behaviour MUST be indistinguishable from the pre-change version. Specifically:

- `renderTripList` markup for trip cards, empty state, and the `.add-form` (apart from the appended dropdown `.input-group`) is unchanged.
- `renderTripDetail` is unchanged.
- `loadState` / `saveState` continue to read and write the same `packcheck_data` key; legacy payloads load without warning.
- All existing event bindings (`js-delete-trip`, `js-cb-dep`, `js-cb-ret`, `js-edit-item`, `js-delete-item`, `js-save-edit`, `js-cancel-edit`) keep their handlers and selectors.
- `router()`'s existing branches for `#trips`, `#trip/<id>`, and unknown-hash redirect are unchanged; the `#settings` branch is added alongside them.
- `genId`, `esc`, `icon`, `showStorageWarning` are unchanged.

This is enforced manually via the verification tasks in `tasks.md` (visual diff at empty state, and a regression pass through every existing flow).

## Risks / Trade-offs

- **Risk:** Users expect editing a preset to update existing trips → Mitigation: copy-on-create is documented in the settings page help text ("套用為預設項目，不會回頭修改既有旅程"). Future enhancement could add an opt-in "sync" action.
- **Risk:** Older clients without this change loading the new payload would ignore `tripTypes` (harmless), but if they re-save they would drop it → Mitigation: this app is local-only, so a single user runs one version; acceptable risk.
- **Risk:** Storage quota — preset items duplicate item data → Mitigation: payload is tiny (text only); within `localStorage` budget for realistic use.
- **Trade-off:** No retroactive editing keeps the model simple at the cost of repeat edits when a user changes their canonical list. Acceptable for v1.
- **Risk:** Adding a third `.input-group` to `#form-add-trip` could subtly reflow the existing layout → Mitigation: append the dropdown after the existing name `.input-group` (not before/between), keep the existing flex/grid rules untouched, and verify at the four reference viewports that the trip-name input and submit button render identically when the dropdown is collapsed to its default `（無）` state.

## Migration Plan

No data migration needed. On load:

1. Parse `packcheck_data` as today.
2. If `parsed.tripTypes` is not an array, set `state.tripTypes = []`.
3. For each trip, if `trip.typeId` is missing, leave it `undefined` (treated as null).

Rollback: removing this change leaves any `tripTypes` and `typeId` fields in storage; they are simply ignored by older code.
