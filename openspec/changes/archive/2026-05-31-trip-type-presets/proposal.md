## Why

Users repeatedly travel for the same purposes (e.g. general tourism, diving, hiking) and end up re-typing the same packing items into every new trip. There is no way to define a reusable "trip type" with default items, so creating a trip from scratch is slow and error-prone — frequently-needed gear gets forgotten.

## What Changes

- Add a new **Settings** page (route: `#settings`) where users can manage **trip types** (e.g. `旅遊`, `潛水`), each with its own list of preset items (name + quantity).
- Add a **settings button** to the trip-list view header (top-right of the "我的旅程" panel) that navigates to the settings page.
- Add a **trip-type dropdown** to the "新增旅程" form. The dropdown lists all user-defined trip types plus a "（無）/ None" option.
- When a user creates a trip with a selected type, the trip's items list SHALL be pre-populated with a deep copy of that type's preset items (all checkboxes unchecked). Selecting "（無）" creates an empty trip as today.
- Persist trip types alongside trips in `localStorage` under the existing `packcheck_data` key (add a new `tripTypes` array; older data without the field loads gracefully as an empty list).
- The trip object SHALL record the `typeId` it was created from (informational; future enhancement). Editing a type later does NOT retroactively change existing trips.
- **UI fidelity constraint**: All new UI (settings button, dropdown, settings page) MUST be implemented strictly with the existing CSS classes, tokens, icon style, form structure (`.page-shell`, `.content-panel`, `.view-header`, `.add-form`, `.input-group`, `.btn-primary`, `.btn-icon`, `.item-table`, `.field-error`, `.empty-state`, etc.) and existing markup patterns in `app.js` / `style.css`. No new visual language, no new colour tokens, no new typography. Where a new control is needed (settings/gear icon), follow the existing inline-SVG style in `ICONS`.
- **Non-regression constraint**: All existing UI and logic — trip-list cards, trip-detail item table, validation errors, checkbox toggles, inline edit, delete-with-confirm flows, persistence behaviour, hash routing of `#trips` and `#trip/<id>`, and existing storage payload semantics — MUST remain byte-for-byte equivalent when the user has not defined any trip types and no type is selected on the add-trip form.

## Capabilities

### New Capabilities

- `trip-type-presets`: User-defined trip types each holding a reusable list of preset items, plus a settings UI to manage them.

### Modified Capabilities

- `trip-management`: Trip creation gains an optional type selector that seeds the new trip's items from the chosen type's presets.
- `local-persistence`: Storage schema extended with a `tripTypes` array and tolerates older payloads missing that field.
- `responsive-layout`: Trip-list header gains a settings button; the add-trip form gains a type dropdown — both must remain usable on mobile.

## Impact

- Affected code: `app.js` (state shape, `loadState`, router, `renderTripList`, new `renderSettings` view, add-trip submit handler), `style.css` (settings button, dropdown, settings page layout), `index.html` (no structural change required).
- Storage: extends the JSON payload at `localStorage` key `packcheck_data` with a new `tripTypes: []` field; backward-compatible read path required.
- No new dependencies. No build step changes — remains pure vanilla JS.
