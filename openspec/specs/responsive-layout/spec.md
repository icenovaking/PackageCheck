## Purpose

Defines layout, sizing, and typography requirements that keep the app usable across mobile, tablet, and desktop viewports.

## Requirements

### Requirement: Mobile-first responsive layout

The system SHALL render correctly and be fully usable on screens as narrow as 320 px without horizontal scrolling.

#### Scenario: Small phone viewport

- **WHEN** the viewport width is 320 px
- **THEN** all interactive elements SHALL be visible and tappable without horizontal overflow

#### Scenario: Large phone viewport

- **WHEN** the viewport width is between 375 px and 599 px
- **THEN** content SHALL occupy the full width with comfortable padding

---
### Requirement: Tablet and desktop adaptation

The system SHALL use wider viewports to improve readability by constraining the content width.

#### Scenario: Tablet or desktop viewport

- **WHEN** the viewport width is ≥ 600 px
- **THEN** the main content column SHALL be centred and SHALL NOT exceed a comfortable reading width (e.g. 640 px)

---
### Requirement: Touch-friendly interactive targets

The system SHALL size all interactive elements (buttons, checkboxes, list items) to be easily tappable on a touchscreen.

#### Scenario: Tap target size

- **WHEN** a user views any button, checkbox, or tappable row on a mobile device
- **THEN** the minimum tap target height SHALL be 44 px in accordance with mobile accessibility guidelines

---
### Requirement: Readable typography at default zoom

The system SHALL use font sizes that are legible without requiring the user to zoom in.

#### Scenario: Default zoom legibility

- **WHEN** the page is loaded at 100 % zoom on a mobile browser
- **THEN** body text SHALL be at least 16 px and input fields SHALL NOT trigger automatic zoom on focus in iOS Safari (font-size ≥ 16 px on inputs)

---
### Requirement: Settings entry point fits in the trip-list header

The system SHALL place the settings entry-point control inside the trip-list view header in a position that does not crowd existing content on any supported viewport.

#### Scenario: Settings button visible on mobile

- **WHEN** the viewport width is between 320 px and 599 px
- **THEN** the settings button SHALL be visible inside the trip-list header without causing horizontal overflow, and its tap target SHALL be at least 44 px tall

#### Scenario: Settings button visible on desktop

- **WHEN** the viewport width is ≥ 600 px
- **THEN** the settings button SHALL appear aligned to the trailing edge of the trip-list header

---
### Requirement: Trip-type selector layout adapts to viewport

The system SHALL lay out the trip-type selector inside the add-trip form so the form remains usable on narrow screens.

#### Scenario: Selector on narrow phone

- **WHEN** the viewport width is between 320 px and 599 px
- **THEN** the trip-type selector SHALL stack vertically with the trip-name input (full width) and SHALL NOT cause horizontal overflow

#### Scenario: Selector on tablet or desktop

- **WHEN** the viewport width is ≥ 600 px
- **THEN** the trip-type selector MAY share a row with the trip-name input while the submit button remains visible without wrapping the form awkwardly

---
### Requirement: Jump-search controls adapt to viewport

The system SHALL lay out the new trip-query and type-query controls so they remain usable on narrow screens and consistent with the current responsive form language.

#### Scenario: Query controls on narrow phone

- **WHEN** the viewport width is between 320 px and 599 px
- **THEN** each query dropdown and query button SHALL stack or wrap without horizontal overflow, and both controls SHALL remain fully visible and tappable

#### Scenario: Query controls on tablet or desktop

- **WHEN** the viewport width is ≥ 600 px
- **THEN** each query dropdown and query button MAY share a row so long as the surrounding header and form content remain readable and uncrowded

---
### Requirement: Collapsible card headers remain touch-friendly

The system SHALL size the new card-toggle controls and collapsed card headers for touch interaction on mobile devices.

#### Scenario: Toggle target size on mobile

- **WHEN** a user views a collapsed or expanded trip card or trip-type card on a mobile device
- **THEN** the expand/collapse control SHALL provide a tap target of at least 44 px in one dimension

#### Scenario: Expanded card content stays within viewport

- **WHEN** a trip card or trip-type card is expanded on a viewport as narrow as 320 px
- **THEN** the expanded body SHALL remain usable without horizontal scrolling

---
### Requirement: Item checkbox indicators remain optically centered

The system SHALL position the visible check indicator from the center of its checkbox container without fixed directional margins. The visible box and its interactive label SHALL scale independently so the indicator remains centered while touch targets remain usable.

#### Scenario: Checked state on a phone viewport

- **WHEN** a departure or return checkbox is checked at a viewport width of 320 px or 390 px
- **THEN** the check indicator SHALL be horizontally and vertically centered within the visible checkbox border

#### Scenario: Checked state on a desktop viewport

- **WHEN** a departure or return checkbox is checked at a viewport width of at least 1024 px
- **THEN** the check indicator SHALL remain horizontally and vertically centered within the visible checkbox border

#### Scenario: Checkbox touch target uses a coarse pointer

- **WHEN** the item table is used with a coarse pointer
- **THEN** each checkbox label SHALL provide a tap target at least 44 px in both dimensions without changing the visible checkbox to fill the entire target


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
### Requirement: Item quantity selectors adapt without opening a keyboard

The system SHALL render item and preset-item quantity controls as native select controls that remain readable and operable across supported viewports.

#### Scenario: Quantity selector on a narrow phone

- **WHEN** a quantity selector is rendered at a viewport width of 320 px or 390 px
- **THEN** it SHALL remain fully visible inside the quantity column, use a font size of at least 16 px, and SHALL NOT cause horizontal overflow

#### Scenario: Quantity selector on a desktop viewport

- **WHEN** a quantity selector is rendered at a viewport width of at least 1024 px
- **THEN** it SHALL align with the table's quantity column and remain operable by mouse and keyboard

#### Scenario: Mobile quantity selection

- **WHEN** a user activates a quantity selector on a mobile browser
- **THEN** the browser SHALL present its native selection interface instead of a numeric text-entry keyboard


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
### Requirement: Item row actions retain consistent geometry across modes

The system SHALL keep each action table cell in table layout and SHALL arrange row actions through a shared inner action group. Trip-item, common-item, and preset-item tables SHALL reserve enough width for two adjacent action buttons, their gap, and cell padding. Edit and Delete actions SHALL use the same outer button size, icon size, gap, focus treatment, and column alignment as Save and Cancel actions at the same viewport. The complete visual boundary and icon of each action button SHALL remain inside its table container at every supported viewport width.

#### Scenario: Switch an item row into edit mode

- **WHEN** the user activates Edit on a trip item, common item, or preset item
- **THEN** Save and Cancel SHALL replace Edit and Delete within the same action column without changing the column alignment or clipping either action

#### Scenario: Return an item row to display mode

- **WHEN** the user saves or cancels an item edit
- **THEN** Edit and Delete SHALL return to the same action positions previously occupied by Save and Cancel without clipping either action

#### Scenario: Row actions on a coarse pointer

- **WHEN** row action buttons are used with a coarse pointer
- **THEN** each button SHALL provide a tap target at least 44 px in both dimensions, adjacent hit areas SHALL NOT overlap, and both targets SHALL fit inside the action table cell

#### Scenario: Row actions at supported phone widths

- **WHEN** a trip-item, common-item, or preset-item table is displayed at a viewport width of 320 px, 375 px, 390 px, or 430 px
- **THEN** both Edit and Delete SHALL remain fully visible inside the table container and the page SHALL NOT gain horizontal overflow

#### Scenario: Editing row actions at supported phone widths

- **WHEN** a trip-item, common-item, or preset-item row enters edit mode at a viewport width of 320 px, 375 px, 390 px, or 430 px
- **THEN** both Save and Cancel SHALL remain fully visible inside the table container and the page SHALL NOT gain horizontal overflow

#### Scenario: Long item name beside row actions

- **WHEN** an item name requires multiple lines at a supported phone width
- **THEN** the name SHALL wrap within the name column while quantity, checklist, and action controls remain visible and aligned in their assigned columns

<!-- @trace
source: fix-mobile-action-button-clipping
updated: 2026-09-18
code:
  - style.css
tests:
  - tests/trip-data-portability.test.js
-->

---
### Requirement: Bulk-apply option remains operable across supported viewports

The system SHALL render the add-type bulk-apply option as a labeled, touch-friendly control between the type-name field and submit button without introducing horizontal page overflow.

#### Scenario: Bulk-apply option on a narrow phone

- **WHEN** the settings page is rendered at a viewport width of 320 px or 390 px
- **THEN** the option label, status text, checkbox, and submit button SHALL remain fully visible without horizontal scrolling, and the option row SHALL provide a tap target at least 44 px high

#### Scenario: Entire option row toggles the checkbox

- **GIVEN** the bulk-apply option is enabled
- **WHEN** the user taps or clicks its label row outside the visible checkbox
- **THEN** the checkbox state SHALL toggle once

#### Scenario: Keyboard operation exposes visible focus

- **WHEN** the user reaches the enabled bulk-apply checkbox by keyboard and activates it
- **THEN** the checkbox state SHALL toggle and the focused control SHALL retain a visible focus indicator

#### Scenario: Empty catalog exposes a stable disabled state

- **GIVEN** the common item catalog is empty
- **WHEN** the settings page is rendered at any supported viewport
- **THEN** the bulk-apply option SHALL remain visible, disabled, and unchecked with text explaining that no common items are available, without changing the add-type form width

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