## ADDED Requirements

### Requirement: Merge preset items from multiple trip types

The system SHALL merge preset items from multiple selected trip types when creating a new trip, applying intelligent deduplication based on item name.

#### Scenario: Merge items from two types with no overlap

- **WHEN** user selects two trip types with completely different preset items
- **THEN** the new trip's items SHALL contain all preset items from both types, each with `qty: 1`

#### Scenario: Merge items with exact duplicate names

- **WHEN** user selects two trip types where both have a preset item with the exact same name (e.g., "護照" in both types)
- **THEN** the new trip's items SHALL contain only one copy of that item with `qty: 1`, preserving the first occurrence

#### Scenario: Chinese text uses strict comparison

- **WHEN** deduplicating preset items containing Chinese characters
- **THEN** the system SHALL use strict equality comparison (`===`) where "護照" matches "護照" but "護照" does not match "護照 " (with trailing space)

#### Scenario: English text uses case-insensitive comparison

- **WHEN** deduplicating preset items containing only English/ASCII characters
- **THEN** the system SHALL use case-insensitive and trimmed comparison where "Passport", "passport", and " PASSPORT " all match and are deduplicated

#### Scenario: Mixed text uses strict comparison

- **WHEN** deduplicating preset items containing both Chinese and English characters
- **THEN** the system SHALL use strict equality comparison (same as Chinese-only text)

#### Scenario: Merged items preserve original name formatting

- **WHEN** duplicate items are detected and removed
- **THEN** the system SHALL preserve the exact name formatting (capitalization, spacing) of the first occurrence

#### Scenario: Merged items default to quantity 1

- **WHEN** multiple types have the same item with different quantities (e.g., "毛巾 × 2" and "毛巾 × 3")
- **THEN** the merged item SHALL have `qty: 1` regardless of the source quantities

#### Scenario: Items merged in selection order

- **WHEN** user selects types in a specific order
- **THEN** preset items SHALL be processed in that order, with earlier types' items appearing first in the deduplicated result
