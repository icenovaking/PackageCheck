## ADDED Requirements

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
