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

### Requirement: Tablet and desktop adaptation

The system SHALL use wider viewports to improve readability by constraining the content width.

#### Scenario: Tablet or desktop viewport

- **WHEN** the viewport width is ≥ 600 px
- **THEN** the main content column SHALL be centred and SHALL NOT exceed a comfortable reading width (e.g. 640 px)

### Requirement: Touch-friendly interactive targets

The system SHALL size all interactive elements (buttons, checkboxes, list items) to be easily tappable on a touchscreen.

#### Scenario: Tap target size

- **WHEN** a user views any button, checkbox, or tappable row on a mobile device
- **THEN** the minimum tap target height SHALL be 44 px in accordance with mobile accessibility guidelines

### Requirement: Readable typography at default zoom

The system SHALL use font sizes that are legible without requiring the user to zoom in.

#### Scenario: Default zoom legibility

- **WHEN** the page is loaded at 100 % zoom on a mobile browser
- **THEN** body text SHALL be at least 16 px and input fields SHALL NOT trigger automatic zoom on focus in iOS Safari (font-size ≥ 16 px on inputs)

### Requirement: Settings entry point fits in the trip-list header

The system SHALL place the settings entry-point control inside the trip-list view header in a position that does not crowd existing content on any supported viewport.

#### Scenario: Settings button visible on mobile

- **WHEN** the viewport width is between 320 px and 599 px
- **THEN** the settings button SHALL be visible inside the trip-list header without causing horizontal overflow, and its tap target SHALL be at least 44 px tall

#### Scenario: Settings button visible on desktop

- **WHEN** the viewport width is ≥ 600 px
- **THEN** the settings button SHALL appear aligned to the trailing edge of the trip-list header

### Requirement: Trip-type selector layout adapts to viewport

The system SHALL lay out the trip-type selector inside the add-trip form so the form remains usable on narrow screens.

#### Scenario: Selector on narrow phone

- **WHEN** the viewport width is between 320 px and 599 px
- **THEN** the trip-type selector SHALL stack vertically with the trip-name input (full width) and SHALL NOT cause horizontal overflow

#### Scenario: Selector on tablet or desktop

- **WHEN** the viewport width is ≥ 600 px
- **THEN** the trip-type selector MAY share a row with the trip-name input while the submit button remains visible without wrapping the form awkwardly

### Requirement: Jump-search controls adapt to viewport

The system SHALL lay out the new trip-query and type-query controls so they remain usable on narrow screens and consistent with the current responsive form language.

#### Scenario: Query controls on narrow phone

- **WHEN** the viewport width is between 320 px and 599 px
- **THEN** each query dropdown and query button SHALL stack or wrap without horizontal overflow, and both controls SHALL remain fully visible and tappable

#### Scenario: Query controls on tablet or desktop

- **WHEN** the viewport width is ≥ 600 px
- **THEN** each query dropdown and query button MAY share a row so long as the surrounding header and form content remain readable and uncrowded

### Requirement: Collapsible card headers remain touch-friendly

The system SHALL size the new card-toggle controls and collapsed card headers for touch interaction on mobile devices.

#### Scenario: Toggle target size on mobile

- **WHEN** a user views a collapsed or expanded trip card or trip-type card on a mobile device
- **THEN** the expand/collapse control SHALL provide a tap target of at least 44 px in one dimension

#### Scenario: Expanded card content stays within viewport

- **WHEN** a trip card or trip-type card is expanded on a viewport as narrow as 320 px
- **THEN** the expanded body SHALL remain usable without horizontal scrolling

