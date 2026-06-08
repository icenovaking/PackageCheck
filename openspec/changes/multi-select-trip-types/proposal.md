## Why

Users want to create trips that combine multiple activity types (e.g., "travel + diving") to automatically merge preset items from different categories, reducing manual setup time while avoiding duplicate items.

## What Changes

- Change trip type selection from single-select dropdown to multi-select checkboxes (maximum 3 types)
- Add "（無）" option that deselects all other types when clicked
- Display selection counter (e.g., "已選 2 個（最多 3 個）") with visual feedback when limit is reached
- Merge preset items from all selected types with intelligent deduplication:
  - Chinese text: strict exact match (`===`)
  - English text: case-insensitive + trimmed match
  - All merged items default to `qty: 1` for user adjustment
- Store both `typeDisplay` string (e.g., "旅遊+潛水") and `typeIds` array in trip data
- Display selected types as tag badges on trip cards (e.g., `[旅遊] [潛水]`)
- Migrate existing trips with single `typeId` to new `typeIds` + `typeDisplay` structure

## Capabilities

### New Capabilities

None - this enhances existing capabilities.

### Modified Capabilities

- `trip-management`: Change trip creation to support multiple type selection, update trip data model from `typeId` (string|null) to `typeIds` (array) + `typeDisplay` (string), and modify trip list cards to display type badges
- `trip-type-presets`: Implement preset item merging logic with intelligent deduplication based on text language detection

## Impact

- **Data model**: Trip object gains `typeIds` and `typeDisplay` fields; `typeId` becomes deprecated (backward compatibility maintained)
- **UI components**: Trip creation form, trip list cards
- **Storage**: localStorage schema migration for existing trips
- **Visual design**: New checkbox layout, tag badge components, selection counter
