## MODIFIED Requirements

### Requirement: Define a trip type

The system SHALL allow users to create a named trip type and choose whether its preset item list is initialized from the common item catalog. When at least one common item exists, the bulk-apply option SHALL be selected by default.

#### Scenario: Default bulk apply creates preset copies

- **GIVEN** the common item catalog contains "護照", "充電器", and "雨傘" in that order
- **WHEN** the user enters "日本旅遊" and submits the add-type form without clearing the default bulk-apply option
- **THEN** the system SHALL create and persist the trip type with three preset items in the same order, each with the source name, quantity 1, and a distinct preset item ID

##### Example: Default bulk copy result

| Common item order | New preset item name | New preset quantity |
| ----- | ----- | ----- |
| 1 | 護照 | 1 |
| 2 | 充電器 | 1 |
| 3 | 雨傘 | 1 |

#### Scenario: User opts out of bulk apply

- **GIVEN** the common item catalog contains one or more records
- **WHEN** the user clears the bulk-apply option and submits a non-empty type name
- **THEN** the system SHALL create and persist the trip type with an empty `presetItems` collection

#### Scenario: Empty common item catalog creates an empty type

- **GIVEN** the common item catalog is empty
- **WHEN** the user submits a non-empty type name
- **THEN** the system SHALL create and persist the trip type with an empty `presetItems` collection

#### Scenario: Empty name rejected

- **WHEN** the user submits an empty or whitespace-only type name
- **THEN** the system SHALL display a validation error and SHALL NOT create a trip type or preset item
