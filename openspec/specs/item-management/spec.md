## Purpose

Defines how items within a trip are added, edited, deleted, and toggled across departure and return checklists.

## Requirements

### Requirement: Add an item to a trip

The system SHALL allow users to add a new item to the current trip by providing a name and quantity.

#### Scenario: Successful item addition

- **WHEN** user enters a non-empty item name and a positive integer quantity and confirms
- **THEN** a new item with a unique ID, the given name, the given quantity, and both checkboxes unchecked SHALL be appended to the trip's item list and persisted

#### Scenario: Empty name rejected

- **WHEN** user attempts to add an item with a blank name
- **THEN** the system SHALL display an error and NOT add the item

#### Scenario: Invalid quantity rejected

- **WHEN** user enters a quantity that is not a positive integer (e.g. 0, negative, or non-numeric)
- **THEN** the system SHALL display an error and NOT add the item

### Requirement: Display item list

The system SHALL display all items in the current trip with their name, quantity, pre-departure checkbox, and return-home checkbox.

#### Scenario: Items listed

- **WHEN** the trip detail view is open
- **THEN** every item in the trip SHALL be visible with its name, quantity, departure checkbox state, and return checkbox state

### Requirement: Toggle pre-departure checkbox

The system SHALL allow users to mark or unmark an item as packed before departure.

#### Scenario: Mark as packed

- **WHEN** user taps the pre-departure checkbox of an item
- **THEN** the item's `departureChecked` state SHALL toggle and be immediately persisted

### Requirement: Toggle return-home checkbox

The system SHALL allow users to mark or unmark an item as returned/accounted for before going home.

#### Scenario: Mark as returned

- **WHEN** user taps the return-home checkbox of an item
- **THEN** the item's `returnChecked` state SHALL toggle and be immediately persisted

### Requirement: Edit an item

The system SHALL allow users to edit an existing item's name or quantity.

#### Scenario: Successful edit

- **WHEN** user edits an item's name or quantity and saves
- **THEN** the item SHALL reflect the updated values and the change SHALL be persisted

### Requirement: Delete an item

The system SHALL allow users to remove an item from the trip.

#### Scenario: Item removed

- **WHEN** user confirms deletion of an item
- **THEN** the item SHALL be removed from the trip's list and from storage
