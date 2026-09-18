## ADDED Requirements

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

### Requirement: Item row actions retain consistent geometry across modes

The system SHALL keep the action table cell in table layout and SHALL arrange row actions through a shared inner action group. Edit and delete actions SHALL use the same outer button size, icon size, gap, focus treatment, and column alignment as save and cancel actions at the same viewport.

#### Scenario: Switch an item row into edit mode

- **WHEN** the user activates Edit on a trip item or preset item
- **THEN** Save and Cancel SHALL replace Edit and Delete within the same action column without changing the column alignment or row action geometry

#### Scenario: Return an item row to display mode

- **WHEN** the user saves or cancels an item edit
- **THEN** Edit and Delete SHALL return to the same action positions previously occupied by Save and Cancel

#### Scenario: Row actions on a coarse pointer

- **WHEN** row action buttons are used with a coarse pointer
- **THEN** each button SHALL provide a tap target at least 44 px in both dimensions and adjacent hit areas SHALL NOT overlap

#### Scenario: Item table at the minimum supported width

- **WHEN** the item table is displayed at a 320 px viewport with quantity, departure, return, and action controls visible
- **THEN** all controls SHALL remain tappable and the page SHALL NOT gain horizontal overflow
