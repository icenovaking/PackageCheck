## Why

Currently, the trip-type cards on the settings page show their edit and delete buttons in the header even when collapsed, which creates visual clutter. This is inconsistent with the trip cards in the main list, which hide these actions when collapsed. Furthermore, the trip-type cards can only be collapsed or expanded by clicking the small chevron button, whereas the main trip cards allow clicking anywhere on the header to toggle. 

This change aligns the trip-type settings cards with the trip list cards so that:
1. Edit and delete buttons are only revealed when the card is expanded.
2. Clicking anywhere on the card header triggers expansion or collapse.
3. The size, alignment, and spacing of buttons are identical to the trip list cards.

## What Changes

- Hide the edit (pencil) and delete (trash) buttons in the trip-type card header when the card is collapsed.
- Reveal the edit and delete buttons only when the trip-type card is expanded.
- Make the entire trip-type card header area (excluding the action buttons) clickable for expansion and collapse, wrapping it in the standard `card-toggle` styling.
- Align the chevron collapse button vertically to the top (flex-start) so that it is on the same line as the "TRIP TYPE" badge.
- Ensure the spacing between the chevron button, edit button, and delete button is exactly `0.45rem`, identical to the trip list cards.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `trip-type-presets`: Update the requirements for listing, toggling, and rendering trip types to support full-header click toggles, top-aligned chevron indicators, and hiding edit/delete controls when collapsed.

## Impact

- `app.js`: Refactor `buildTripTypeCard()` to use the new `card-toggle` header button structure and only render edit/delete actions when expanded.
- `style.css`: Update `.trip-type-header` and `.trip-type-header-actions` rules to match `.trip-card-header` and `.trip-card-header-actions` grid layout, gaps, and responsive stacking.
