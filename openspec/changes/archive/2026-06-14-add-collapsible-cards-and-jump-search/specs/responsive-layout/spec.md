## ADDED Requirements

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
