# trip-type-presets Specification

## Purpose
TBD - created by archiving change trip-type-presets. Update Purpose after archive.

## Requirements

### Requirement: Define a trip type

The system SHALL allow users to create a named trip type and choose whether its preset item list is initialized from the common item catalog. When at least one common item exists, the bulk-apply option SHALL be selected by default.

#### Scenario: Default bulk apply creates preset copies

- **GIVEN** the common item catalog contains "護照", "充電器", and "雨傘" in that order
- **WHEN** the user enters "日本旅遊" and submits the add-type form without clearing the default bulk-apply option
- **THEN** the system SHALL create and persist the trip type with three preset items in the same order, each with the source name, quantity 1, and a distinct preset item ID

##### Example: Default bulk copy result

| Common item order | New preset item name | New preset quantity |
| ----- | ----- | ----- |
| 1 | 護照 | 1 |
| 2 | 充電器 | 1 |
| 3 | 雨傘 | 1 |

#### Scenario: User opts out of bulk apply

- **GIVEN** the common item catalog contains one or more records
- **WHEN** the user clears the bulk-apply option and submits a non-empty type name
- **THEN** the system SHALL create and persist the trip type with an empty `presetItems` collection

#### Scenario: Empty common item catalog creates an empty type

- **GIVEN** the common item catalog is empty
- **WHEN** the user submits a non-empty type name
- **THEN** the system SHALL create and persist the trip type with an empty `presetItems` collection

#### Scenario: Empty name rejected

- **WHEN** the user submits an empty or whitespace-only type name
- **THEN** the system SHALL display a validation error and SHALL NOT create a trip type or preset item


<!-- @trace
source: apply-all-common-items-to-new-trip-type
updated: 2026-09-19
code:
  - .impeccable/config.json
  - app.js
  - style.css
  - PRODUCT.md
tests:
  - tests/trip-data-portability.test.js
-->

---
### Requirement: List trip types on the settings page

The system SHALL display all existing trip types on the settings page in creation order as individually collapsible cards.

#### Scenario: No trip types exist

- **WHEN** the user opens the settings page and no trip types have been created
- **THEN** the system SHALL show an empty-state message inviting the user to create a trip type

#### Scenario: Trip types present

- **WHEN** one or more trip types exist
- **THEN** the settings page SHALL list each trip type in creation order as a compact card whose collapsed header shows only the "Trip Type" label, the type's name, and the expand/collapse chevron control

#### Scenario: Type cards start collapsed

- **WHEN** the settings page is rendered with existing trip types
- **THEN** each trip-type card SHALL render in collapsed state until the user expands a card or completes a type jump-search action

---
### Requirement: Rename a trip type

The system SHALL allow users to rename an existing trip type.

#### Scenario: Successful rename

- **WHEN** user edits a trip type's name to a non-empty value and saves
- **THEN** the trip type's name SHALL be updated and persisted

#### Scenario: Empty rename rejected

- **WHEN** user attempts to save a blank trip-type name
- **THEN** the system SHALL display an error and NOT change the name

---
### Requirement: Delete a trip type

The system SHALL allow users to delete a trip type without affecting any existing trips.

#### Scenario: Confirm before delete

- **WHEN** user initiates trip-type deletion
- **THEN** the system SHALL prompt for confirmation before permanently removing the trip type

#### Scenario: Trip type removed, existing trips untouched

- **WHEN** user confirms deletion of a trip type
- **THEN** the trip type SHALL be removed from storage and the settings list, AND any existing trips previously created from that type SHALL remain unchanged

---
### Requirement: Add a preset item to a trip type

The system SHALL allow users to add a preset item to a trip type by providing either a manual non-empty name or one selected common item, together with a quantity selected from the integers 1 through 10. The two name sources SHALL be mutually exclusive, and the resulting preset item SHALL receive a unique ID and SHALL NOT contain a commonItemId relationship.

#### Scenario: Successful manual preset addition

- **WHEN** the user enters a non-empty item name manually, leaves the common item selector empty, selects a quantity from 1 through 10, and confirms
- **THEN** the system SHALL append a preset item with the entered name and selected quantity to that trip type's presetItems and SHALL persist the change

#### Scenario: Successful common item preset addition

- **GIVEN** commonItems contains a common item named "護照"
- **WHEN** the user selects "護照", selects a quantity from 1 through 10, and confirms
- **THEN** the system SHALL append a preset item named "護照" with the selected quantity to that trip type's presetItems and SHALL persist the change

#### Scenario: Preset quantity selection boundaries

- **WHEN** the add-preset-item form is rendered
- **THEN** its quantity control SHALL provide each integer from 1 through 10 exactly once and SHALL default to 1

##### Example: Standard preset quantity options

| Boundary | Expected selected or available value |
| ----- | ----- |
| Default | 1 selected |
| Minimum | 1 available |
| Maximum | 10 available |
| Above range | 11 not available for a new preset item |

#### Scenario: Manual and common sources are mutually exclusive

- **WHEN** the user enters a non-blank manual name
- **THEN** the common item selector SHALL be disabled until the manual name is cleared

#### Scenario: Common item selection disables manual entry

- **WHEN** the user selects a common item
- **THEN** the manual name input SHALL be disabled until the common item selection is cleared

#### Scenario: Blank or dual source rejected

- **WHEN** the user submits with both name sources empty or with both sources populated
- **THEN** the system SHALL display an error and SHALL NOT add a preset item

#### Scenario: Invalid or tampered preset quantity rejected

- **WHEN** the submitted quantity is zero, negative, non-numeric, or not one of the rendered add-preset-item options
- **THEN** the system SHALL display an error and SHALL NOT add a preset item

#### Scenario: Duplicate preset name rejected

- **GIVEN** the trip type already contains a preset item whose normalized name is "護照"
- **WHEN** the user attempts to add a manual or selected common item whose normalized name is "護照"
- **THEN** the system SHALL display a duplicate-name error and SHALL NOT add another preset item to that trip type


<!-- @trace
source: improve-item-table-controls
updated: 2026-09-18
code:
  - app.js
  - style.css
tests:
  - tests/trip-data-portability.test.js
-->

---
### Requirement: Edit a preset item

The system SHALL allow users to edit the name of an existing preset item and select a quantity from 1 through 10. When the existing quantity is a positive integer greater than 10, the system SHALL also expose that exact current value as a selected compatibility option for that edit session.

#### Scenario: Successful preset edit within the standard range

- **WHEN** the user edits a preset item's name or selects a quantity from 1 through 10 and saves
- **THEN** the preset item SHALL reflect the updated values and the change SHALL be persisted

#### Scenario: Existing preset quantity above 10 is preserved

- **GIVEN** an existing preset item has quantity 12
- **WHEN** the user enters edit mode, changes only its name, and saves
- **THEN** the quantity selector SHALL initially select 12 and the persisted preset item quantity SHALL remain 12

#### Scenario: Existing preset quantity above 10 can move into the standard range

- **GIVEN** an existing preset item has quantity 12
- **WHEN** the user selects 4 and saves
- **THEN** the persisted preset item quantity SHALL become 4 and the UI SHALL NOT offer arbitrary new values above 10

#### Scenario: Invalid or tampered preset edit quantity rejected

- **WHEN** a preset edit submission contains zero, a negative value, a non-numeric value, or a value absent from that edit session's rendered options
- **THEN** the system SHALL NOT modify or persist the preset item


<!-- @trace
source: improve-item-table-controls
updated: 2026-09-18
code:
  - app.js
  - style.css
tests:
  - tests/trip-data-portability.test.js
-->

---
### Requirement: Delete a preset item

The system SHALL allow users to remove a preset item from a trip type.

#### Scenario: Preset item removed

- **WHEN** user confirms deletion of a preset item
- **THEN** the preset item SHALL be removed from the trip type's `presetItems` and from storage

---
### Requirement: Navigate to the settings page

The system SHALL provide a visible control on the trip-list view that navigates to the settings page.

#### Scenario: Open settings from trip list

- **WHEN** user taps/clicks the settings button on the trip-list view
- **THEN** the system SHALL navigate to the settings page (route `#settings`)

#### Scenario: Return from settings

- **WHEN** user activates the back control on the settings page
- **THEN** the system SHALL navigate back to the trip-list view (`#trips`)

---
### Requirement: Edits to a trip type do not affect existing trips

The system SHALL treat preset application as a one-time copy at trip creation; modifying or deleting preset items afterwards SHALL NOT alter items already present in previously created trips.

#### Scenario: Preset edit isolated

- **WHEN** a user edits or deletes a preset item on a trip type that was previously used to create a trip
- **THEN** the items inside that existing trip SHALL remain unchanged

---
### Requirement: New UI reuses existing visual vocabulary

The system SHALL implement the settings page, settings entry-point button, trip-type dropdowns, jump-search controls, and collapsible trip-type cards using only the existing class/token vocabulary already defined in `app.js` and `style.css` (page shell, content panel, view header, add-form, input-group, btn-primary, btn-icon, item-table, field-error, empty-state, btn-back, section-kicker), and SHALL NOT introduce a new visual language, new colour tokens, or new typography.

#### Scenario: New icon follows existing style

- **WHEN** a collapse/expand icon or affordance is rendered for a trip-type card
- **THEN** it SHALL follow the same inline SVG and button conventions already used by the app's existing icon controls

#### Scenario: Settings page reuses existing layout primitives

- **WHEN** the settings page is rendered with jump-search controls and collapsible cards
- **THEN** it SHALL continue to use the same `page-shell` / `app-header` / `content-panel` / `view-header` / `add-form` / `input-group` / `btn-primary` / `btn-back` markup pattern used by the existing trip-list and trip-detail views

---
### Requirement: Toggle trip-type card expansion

The system SHALL let the user expand or collapse trip-type cards from the settings page by clicking anywhere on the card header.

#### Scenario: Expand a collapsed type card

- **WHEN** the user toggles a collapsed trip-type card open (by clicking the card header)
- **THEN** the system SHALL expand that card, reveal its preset-item form, preset-item list, edit control, and delete control, and collapse any other currently expanded trip-type card

#### Scenario: Collapse the expanded type card

- **WHEN** the user toggles the currently expanded trip-type card closed (by clicking the card header)
- **THEN** the system SHALL hide its preset-item form and preset-item list and return the card to compact summary state

#### Scenario: Toggle card via header click

- **WHEN** the user clicks anywhere on a collapsed or expanded trip-type card header (excluding active edit/delete/save/cancel controls)
- **THEN** the system SHALL toggle the card's expansion state

---
### Requirement: Jump to an existing trip type from settings

The system SHALL provide a dropdown-based type query control on the settings page that can jump directly to an existing trip-type card.

#### Scenario: Query controls with no trip types

- **WHEN** no trip types exist
- **THEN** the type query dropdown and query action SHALL remain visible in a non-interactive empty state or disabled state without causing layout issues

#### Scenario: Jump to a selected trip type

- **WHEN** the user selects an existing trip type from the dropdown and confirms the query
- **THEN** the system SHALL expand that trip-type card, collapse any other expanded trip-type card, scroll the selected card into view, and provide a visible focus or highlight cue on the target card

#### Scenario: Query without a selected trip type

- **WHEN** the user activates the query action without selecting a trip type
- **THEN** the system SHALL leave the current card expansion state unchanged

---
### Requirement: Merge preset items from multiple trip types

The system SHALL merge preset items from multiple selected trip types when creating a new trip, applying intelligent deduplication based on normalized item name.

#### Scenario: Merge items from two types with no overlap

- **WHEN** the user selects two trip types with completely different preset item names
- **THEN** the new trip's items SHALL contain all preset items from both types, each with qty equal to 1

#### Scenario: Merge items with duplicate normalized names

- **WHEN** the user selects two trip types where both have a preset item with the same normalized name, such as "護照" and "護照 "
- **THEN** the new trip's items SHALL contain only one copy of that item with qty equal to 1, preserving the first occurrence

#### Scenario: Chinese text comparison

- **WHEN** deduplicating preset items named "護照" and "護照 "
- **THEN** the system SHALL treat the names as duplicates after trimming outer whitespace and SHALL preserve the first occurrence's display name

#### Scenario: English text comparison

- **WHEN** deduplicating preset items named "Passport", "passport", and " PASSPORT "
- **THEN** the system SHALL treat the names as duplicates after trimming outer whitespace and applying locale-aware lowercase normalization

#### Scenario: Mixed text comparison

- **WHEN** deduplicating preset items containing both Chinese and English characters with equivalent outer whitespace and letter case
- **THEN** the system SHALL apply the same trimming and locale-aware lowercase normalization used for all item names

#### Scenario: Merged items preserve original name formatting

- **WHEN** duplicate items are detected and removed
- **THEN** the system SHALL preserve the exact name formatting of the first occurrence

#### Scenario: Merged items default to quantity 1

- **WHEN** multiple types have the same normalized item name with different quantities, such as "毛巾 × 2" and "毛巾 × 3"
- **THEN** the merged item SHALL have qty equal to 1 regardless of the source quantities

#### Scenario: Items merge in selection order

- **WHEN** the user selects types in a specific order
- **THEN** preset items SHALL be processed in that order, with earlier types' items appearing first in the deduplicated result

<!-- @trace
source: add-common-item-settings
updated: 2026-08-09
code:
  - style.css
  - app.js
tests:
  - tests/trip-data-portability.test.js
-->