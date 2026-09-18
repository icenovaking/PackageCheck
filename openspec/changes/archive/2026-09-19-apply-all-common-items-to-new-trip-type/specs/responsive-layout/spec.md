## ADDED Requirements

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
