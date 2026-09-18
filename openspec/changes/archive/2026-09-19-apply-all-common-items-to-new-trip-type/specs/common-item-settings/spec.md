## ADDED Requirements

### Requirement: Bulk-copy common items into a new trip type

The system SHALL support copying the complete common item catalog into a newly created trip type as independent preset item records. The copy operation SHALL use the catalog state at form submission time and SHALL NOT create a `commonItemId` relationship.

#### Scenario: Bulk copy preserves names and order

- **GIVEN** the common item catalog contains multiple records in a defined order
- **WHEN** the user creates a trip type with bulk apply selected
- **THEN** the new preset items SHALL preserve every common item name and the catalog order, SHALL each have quantity 1, and SHALL each receive a new preset item ID

#### Scenario: Later common item creation does not propagate

- **GIVEN** a trip type was created by bulk-copying the current common item catalog
- **WHEN** the user later creates another common item
- **THEN** the existing trip type SHALL NOT receive a new preset item automatically

#### Scenario: Later common item rename does not propagate

- **GIVEN** a trip type contains a preset item created by bulk copy
- **WHEN** the user renames the source common item
- **THEN** the existing preset item name SHALL remain unchanged

#### Scenario: Later common item deletion does not propagate

- **GIVEN** a trip type contains a preset item created by bulk copy
- **WHEN** the user deletes the source common item
- **THEN** the existing preset item SHALL remain in the trip type

#### Scenario: Missing common item collection is handled as empty

- **GIVEN** the in-memory common item collection is missing or is not an array
- **WHEN** the user creates a trip type
- **THEN** the system SHALL create the trip type with an empty `presetItems` collection and SHALL NOT throw an unhandled error
