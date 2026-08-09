# trip-type-presets Delta

## MODIFIED Requirements

### Requirement: Add a preset item to a trip type

The system SHALL allow users to add a preset item to a trip type by providing either a manual non-empty name or one selected common item, together with a positive integer quantity. The two name sources SHALL be mutually exclusive, and the resulting preset item SHALL receive a unique ID and SHALL NOT contain a commonItemId relationship.

#### Scenario: Successful manual preset addition

- **WHEN** the user enters a non-empty item name manually, leaves the common item selector empty, enters a positive integer quantity, and confirms
- **THEN** the system SHALL append a preset item with the entered name and quantity to that trip type's presetItems and SHALL persist the change

#### Scenario: Successful common item preset addition

- **GIVEN** commonItems contains a common item named "護照"
- **WHEN** the user selects "護照", enters a positive integer quantity, and confirms
- **THEN** the system SHALL append a preset item named "護照" with the entered quantity to that trip type's presetItems and SHALL persist the change

#### Scenario: Manual and common sources are mutually exclusive

- **WHEN** the user enters a non-blank manual name
- **THEN** the common item selector SHALL be disabled until the manual name is cleared

#### Scenario: Common item selection disables manual entry

- **WHEN** the user selects a common item
- **THEN** the manual name input SHALL be disabled until the common item selection is cleared

#### Scenario: Blank or dual source rejected

- **WHEN** the user submits with both name sources empty or with both sources populated
- **THEN** the system SHALL display an error and SHALL NOT add a preset item

#### Scenario: Invalid quantity rejected

- **WHEN** the user submits a quantity that is not a positive integer
- **THEN** the system SHALL display an error and SHALL NOT add a preset item

#### Scenario: Duplicate preset name rejected

- **GIVEN** the trip type already contains a preset item whose normalized name is "護照"
- **WHEN** the user attempts to add a manual or selected common item whose normalized name is "護照"
- **THEN** the system SHALL display a duplicate-name error and SHALL NOT add another preset item to that trip type

### Requirement: Merge preset items from multiple trip types

The system SHALL merge preset items from multiple selected trip types when creating a new trip, applying intelligent deduplication based on normalized item name.

#### Scenario: Merge items from two types with no overlap

- **WHEN** the user selects two trip types with completely different preset item names
- **THEN** the new trip's items SHALL contain all preset items from both types, each with qty equal to 1

#### Scenario: Merge items with duplicate normalized names

- **WHEN** the user selects two trip types where both have a preset item with the same normalized name, such as "護照" and "護照 "
- **THEN** the new trip's items SHALL contain only one copy of that item with qty equal to 1, preserving the first occurrence

#### Scenario: Chinese text comparison

- **WHEN** deduplicating preset items named "護照" and "護照 "
- **THEN** the system SHALL treat the names as duplicates after trimming outer whitespace and SHALL preserve the first occurrence's display name

#### Scenario: English text comparison

- **WHEN** deduplicating preset items named "Passport", "passport", and " PASSPORT "
- **THEN** the system SHALL treat the names as duplicates after trimming outer whitespace and applying locale-aware lowercase normalization

#### Scenario: Mixed text comparison

- **WHEN** deduplicating preset items containing both Chinese and English characters with equivalent outer whitespace and letter case
- **THEN** the system SHALL apply the same trimming and locale-aware lowercase normalization used for all item names

#### Scenario: Merged items preserve original name formatting

- **WHEN** duplicate items are detected and removed
- **THEN** the system SHALL preserve the exact name formatting of the first occurrence

#### Scenario: Merged items default to quantity 1

- **WHEN** multiple types have the same normalized item name with different quantities, such as "毛巾 × 2" and "毛巾 × 3"
- **THEN** the merged item SHALL have qty equal to 1 regardless of the source quantities

#### Scenario: Items merge in selection order

- **WHEN** the user selects types in a specific order
- **THEN** preset items SHALL be processed in that order, with earlier types' items appearing first in the deduplicated result
