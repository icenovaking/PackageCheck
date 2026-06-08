## Context

PackCheck currently initializes with empty `trips` and `tripTypes` arrays when no localStorage data exists. First-time users see empty states and lack context for how trip type presets and trip creation workflows relate to each other. This change seeds the app with working examples on first launch to demonstrate the complete feature flow.

Existing behavior:

- `loadState()` returns `{ trips: [], tripTypes: [] }` when localStorage is empty
- No guidance on how to use trip types or create trips
- Users must discover features through trial and error

## Goals / Non-Goals

**Goals:**

- Demonstrate the trip type → trip creation workflow with real examples
- Show the relationship between preset items and trip items
- Provide immediate value by presenting a working app on first launch
- Maintain backward compatibility - existing users unaffected
- Keep examples simple (minimal clutter) while showing key features

**Non-Goals:**

- Not a tutorial or onboarding flow - just seed data
- Not persistent templates that always appear
- Not customizable example data (fixed content is fine)
- Not localization-aware (Chinese examples only for now)

## Decisions

### 1. Seed Timing: First Launch Detection

**Decision**: Detect first launch by checking if `localStorage.getItem(STORAGE_KEY)` returns `null`.

**Rationale**:

- Simple and reliable - `null` means truly first use
- After seeding, we immediately call `saveState()`, so subsequent loads won't be "first launch"
- If user deletes all data, localStorage becomes `{ trips: [], tripTypes: [] }` (not `null`), so examples won't reappear
- Alternatives considered:
  - Flag like `hasSeenExamples`: Adds unnecessary state
  - Check array lengths: Fails if user deletes all data then reloads

### 2. Data Structure: Static Constant vs Generated

**Decision**: Use a static `DEMO_DATA` constant with fixed IDs and timestamps.

**Rationale**:

- Predictable and debuggable - same data every time
- Easy to identify with `demo-` prefix on IDs
- Fixed timestamps sort consistently (older than user data)
- Alternatives considered:
  - Generate with `genId()` and `new Date()`: Inconsistent, harder to debug
  - Load from external file: Overkill for ~20 lines of data

### 3. Example Content: Linked Trip and Type

**Decision**: Create a "旅遊" type with "護照" preset, and a "11月日本土浦煙火行" trip that references this type (via `typeId`) with "護照" (from type) + "手機" (added manually).

**Rationale**:

- Demonstrates the complete preset workflow: type → create trip → preset items seed → add more items
- Users see the value of trip types immediately
- Shows both preset-sourced items and manual additions in one example
- Alternatives considered:
  - Unlinked trip (`typeId: null`): Doesn't show the preset feature flow
  - Multiple trips: Clutters the initial view
  - More items: 2 items is enough to show the structure without overwhelming

### 4. Example Item State: All Unchecked

**Decision**: All items start with `departureChecked: false` and `returnChecked: false`.

**Rationale**:

- Encourages interaction - users will click checkboxes to explore
- Shows the initial state clearly
- Avoids confusion about "why are these already checked?"
- Alternatives considered:
  - Pre-checked items: Hides the checkbox interaction, less clear

### 5. Example Labeling: No Visual Indicators

**Decision**: Do not add "範例" or "demo" badges to example data in the UI.

**Rationale**:

- Feels more natural - users can treat it as real data
- Can be deleted like any other data using existing controls
- Reduces UI complexity
- Alternatives considered:
  - Visual badge: Might make users feel "this isn't mine" and reduce engagement
  - Separate section: Adds complexity for minimal benefit

## Risks / Trade-offs

**Risk**: Users might mistake examples for real data they created.

- **Mitigation**: Example content is clearly identifiable ("11月日本土浦煙火行" is specific enough to recognize as demo). Users can delete it easily.

**Risk**: If we change example data in a future update, existing users won't see it.

- **Mitigation**: Accepted trade-off. First launch only. Future onboarding improvements could use different mechanisms.

**Trade-off**: Example trip has `typeId` pointing to the example type - if user deletes the type, the reference becomes stale.

- **Mitigation**: Existing behavior already handles orphaned `typeId` gracefully (type just won't be found). No special handling needed.

**Risk**: Fixed IDs like `demo-trip-japan` could theoretically collide if user creates data with same ID.

- **Mitigation**: `genId()` uses timestamp + random, astronomically unlikely to collide with `demo-` prefixed strings. Accepted risk.
