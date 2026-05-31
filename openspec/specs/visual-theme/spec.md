## Purpose

Defines the travel-themed visual language (palette, typography, surfaces, iconography) that all views share.

## Requirements

### Requirement: Travel-themed colour palette

The system SHALL use a warm, adventure-inspired colour palette throughout the UI.

#### Scenario: Colour tokens applied

- **WHEN** the page is rendered
- **THEN** the primary colour SHALL be a sky/ocean blue (e.g. `#0077B6`), the accent colour SHALL be a warm sunset orange (e.g. `#F4A261`), and the background SHALL use a soft sandy/cream tone (e.g. `#FDF6EC`)

### Requirement: Travel-themed typography

The system SHALL use a heading font that conveys an adventurous, wanderlust mood.

#### Scenario: Heading font applied

- **WHEN** the page is rendered
- **THEN** all `<h1>` and `<h2>` headings SHALL use a display/serif-style font (e.g. Google Fonts "Playfair Display" or a locally declared `@font-face`) and body text SHALL use a clean sans-serif (e.g. "Inter" or system-ui)

### Requirement: Travel iconography in UI

The system SHALL use travel-related emoji or inline SVG icons as decorative accents in the header and empty states.

#### Scenario: App header icon

- **WHEN** the trip list view is rendered
- **THEN** the app title SHALL be accompanied by a travel icon (e.g. ✈️ or a suitcase SVG) that is visible on all screen sizes

#### Scenario: Empty-state illustration

- **WHEN** no trips exist
- **THEN** the empty state SHALL display a relevant travel emoji or icon (e.g. 🗺️) alongside the prompt text

### Requirement: Card-style trip tiles

The system SHALL present each trip as a styled card with a subtle shadow and rounded corners to give a boarding-pass or postcard feel.

#### Scenario: Trip card appearance

- **WHEN** trips are listed
- **THEN** each trip SHALL appear as a card with rounded corners (≥ 8 px radius), a soft drop shadow, and a left-side accent stripe in the primary colour

### Requirement: Themed button and form styles

Buttons and form inputs SHALL follow the travel colour palette and feel tactile and friendly.

#### Scenario: Primary button style

- **WHEN** a primary action button (e.g. "Add Trip", "Add Item") is rendered
- **THEN** it SHALL use the accent colour as background, white text, rounded corners, and a hover/active state that darkens the background

#### Scenario: Input field style

- **WHEN** form inputs are rendered
- **THEN** they SHALL have a rounded border, a focus ring in the primary colour, and comfortable padding (≥ 12 px vertical)

### Requirement: Checkbox visual style aligned with theme

Pre-departure and return-home checkboxes SHALL use custom styling that fits the travel theme.

#### Scenario: Checkbox colours

- **WHEN** a checkbox is checked
- **THEN** the checked state SHALL display a filled tick in the primary or accent colour rather than the browser default grey

#### Scenario: Column headers

- **WHEN** the item list header row is rendered
- **THEN** pre-departure column SHALL be labelled with a departure icon (e.g. ✈️ 出發) and return column with a return icon (e.g. 🏠 回國)
