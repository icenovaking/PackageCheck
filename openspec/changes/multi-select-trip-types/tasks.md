## 1. Data Model & Migration

- [x] 1.1 Update JSDoc type definition for trip to include `typeIds: string[] | null` and `typeDisplay: string | null`
- [x] 1.2 Implement `migrateTrips()` function to convert legacy `typeId` to `typeIds` + `typeDisplay`
- [x] 1.3 Call migration function in `loadState()` after parsing localStorage data
- [x] 1.4 Update DEMO_DATA to use new `typeIds` and `typeDisplay` fields

## 2. Item Merging & Deduplication Logic

- [x] 2.1 Implement `isSameItem(name1, name2)` helper function with Chinese regex detection
- [x] 2.2 Implement strict comparison for Chinese text (exact `===` match)
- [x] 2.3 Implement case-insensitive + trimmed comparison for English text
- [x] 2.4 Implement `mergePresetItems(selectedTypeIds)` function to merge and deduplicate preset items
- [x] 2.5 Ensure merged items always have `qty: 1` regardless of source quantities
- [x] 2.6 Implement `buildTypeDisplay(selectedTypeIds)` to generate "旅遊+潛水" format string

## 3. Trip Creation Form UI

- [x] 3.1 Replace `<select>` dropdown with horizontal checkbox layout in `renderTripList()`
- [x] 3.2 Add "（無）" checkbox as first option
- [x] 3.3 Render all trip types as checkboxes using existing trip types data
- [x] 3.4 Add selection counter element with initial hidden state
- [x] 3.5 Implement `handleTypeCheckboxChange()` event handler for checkbox clicks
- [x] 3.6 Implement "（無）" mutual exclusivity (clicking it unchecks all others)
- [x] 3.7 Implement unchecking "（無）" when any other type is selected
- [x] 3.8 Implement 3-selection limit enforcement (disable unselected checkboxes when limit reached)
- [x] 3.9 Update selection counter display ("已選 X 個（最多 3 個）" or "已選 3 個（已達上限）")
- [x] 3.10 Add `.at-limit` CSS class when 3 types selected for visual emphasis

## 4. Trip Card Display

- [x] 4.1 Update trip card rendering to check for `typeDisplay` field
- [x] 4.2 Implement badge rendering by splitting `typeDisplay` on "+" character
- [x] 4.3 Add `.trip-type-badges` container element in trip card markup
- [x] 4.4 Add `.trip-type-badge` styled elements for each type name
- [x] 4.5 Ensure no badges render when `typeDisplay` is null or empty

## 5. CSS Styling

- [x] 5.1 Add `.trip-type-checkboxes` styles for horizontal checkbox layout
- [x] 5.2 Add `.trip-type-checkbox` styles for individual checkbox containers with hover states
- [x] 5.3 Add `.selection-counter` styles for counter display
- [x] 5.4 Add `.selection-counter.at-limit` styles for emphasized limit state
- [x] 5.5 Add `.trip-type-badge` styles matching existing tag/badge design pattern
- [x] 5.6 Add `:disabled` styles for checkboxes when limit reached
- [x] 5.7 Ensure responsive behavior for checkbox wrapping on narrow screens

## 6. Form Submission Logic

- [x] 6.1 Update trip creation submit handler to collect selected type IDs from checkboxes
- [x] 6.2 Call `mergePresetItems()` with selected type IDs to get seedItems
- [x] 6.3 Call `buildTypeDisplay()` to generate display string
- [x] 6.4 Create trip with new `typeIds` and `typeDisplay` fields (not legacy `typeId`)
- [x] 6.5 Reset checkbox states and counter after successful trip creation

## 7. Testing & Validation

- [x] 7.1 Test migration of existing trips with single `typeId` loads correctly
- [x] 7.2 Test creating trip with no types selected sets `typeIds: null` and `typeDisplay: null`
- [x] 7.3 Test creating trip with one type works identically to before (except data structure)
- [x] 7.4 Test creating trip with 2-3 types merges items correctly
- [x] 7.5 Test Chinese deduplication (exact match): "護照" vs "護照" vs "護照 "
- [x] 7.6 Test English deduplication (case-insensitive): "Passport" vs "passport" vs "PASSPORT"
- [x] 7.7 Test selection limit prevents selecting more than 3 types
- [x] 7.8 Test "（無）" unchecks all other types when clicked
- [x] 7.9 Test selecting any type unchecks "（無）"
- [x] 7.10 Test type badges display correctly on trip cards
- [x] 7.11 Test deleted trip types don't break trips (typeDisplay still shows)
