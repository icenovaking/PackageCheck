## MODIFIED Requirements

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
