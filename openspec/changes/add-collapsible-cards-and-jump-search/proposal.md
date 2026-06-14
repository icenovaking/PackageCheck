## Why

The current trip and trip-type screens work on desktop, but on phones each card expands into a long block that quickly turns the page into a tall scrolling surface. Users need a faster way to find an existing trip or type and reveal only the card they want to work with.

## What Changes

- Add a dropdown-based jump search to the trip list page so users can select an existing trip and scroll directly to its card.
- Add a dropdown-based jump search to the trip-type settings page so users can select an existing type and scroll directly to its card.
- Make trip cards collapsible on the trip list page, with collapsed headers preserving the current summary information and expanded state revealing actionable content.
- Make trip-type cards collapsible on the settings page, with collapsed headers preserving the current identity and expanded state revealing preset-item management controls.
- Keep the visual treatment aligned with the existing surface panels, pills, header chips, spacing, and button language so the new controls feel native to the current interface.
- Preserve the existing `#trip/<id>` detail route as the full-detail destination even after list-page expansion is introduced.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `trip-management`: change trip-list behavior to support trip search, jump-to-card, and collapsible trip cards while preserving the existing detail route.
- `trip-type-presets`: change the settings page to support type search, jump-to-card, and collapsible trip-type cards for preset management.
- `responsive-layout`: change mobile behavior so the new search controls and collapsible cards improve usability on narrow viewports without horizontal overflow.

## Impact

- Affected code: `app.js`, `style.css`, and any trip/type rendering and event-binding paths that currently assume cards are always fully expanded or summary-only.
- Affected specs: `openspec/specs/trip-management/spec.md`, `openspec/specs/trip-type-presets/spec.md`, `openspec/specs/responsive-layout/spec.md`.
- No backend or dependency changes; behavior remains fully client-side and persisted through the existing local storage model.
