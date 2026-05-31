## ADDED Requirements

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
