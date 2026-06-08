## Context

**Current state:**

- Trip creation uses a single-select dropdown for trip type
- Trip data stores `typeId: string | null` to reference one type
- When a type is selected, its `presetItems` are deep-copied to the new trip's items

**User need:**

- Combine activities (e.g., travel + diving + business) in one trip
- Automatically merge preset items from multiple types
- Avoid duplicate items when types share common items

**Constraints:**

- Pure vanilla JS, no framework
- localStorage persistence only
- Must maintain backward compatibility with existing trips
- Follow existing visual design language

## Goals / Non-Goals

**Goals:**

- Support selecting up to 3 trip types when creating a trip
- Merge and deduplicate preset items intelligently based on item name
- Display selected types clearly on trip cards
- Migrate existing single-typeId trips seamlessly
- Preserve UX quality with visual feedback for selection limits

**Non-Goals:**

- Unlimited type selection (keep cognitive load low)
- Retroactive application of type changes to existing trips
- Editing trip types after creation
- Advanced deduplication (same meaning, different text)

## Decisions

### 1. Data Model: Hybrid Approach

**Decision:** Store both `typeIds` array and `typeDisplay` string on trip objects.

```javascript
// New structure
{
  id: "trip-123",
  name: "11月日本土浦煙火行",
  typeDisplay: "旅遊+潛水",           // Display string
  typeIds: ["type-1", "type-2"],     // Source IDs for traceability
  items: [...],
  createdAt: "..."
}
```

**Rationale:**

- `typeDisplay` preserves human-readable labels even if types are deleted
- `typeIds` enables future analytics ("how many trips use diving type?")
- Decouples display from data integrity (deleted types don't break UI)

**Alternative considered:** Store only `typeIds` and reconstruct display from live data

- Rejected: Displays incorrectly if types are renamed/deleted

### 2. UI Pattern: Inline Checkboxes with Limit

**Decision:** Replace dropdown with horizontal checkbox layout, max 3 selections.

**Rationale:**

- Checkboxes clearly communicate multi-select capability
- 3-item limit prevents overwhelming users and overly long displays
- Inline layout matches existing form density
- "（無）" as special option that deselects all others

**Alternative considered:** Multi-select dropdown with checkboxes inside

- Rejected: Requires extra click to open, hides selection state

### 3. Deduplication: Language-Aware Comparison

**Decision:** Use different comparison rules based on text content.

```javascript
function isSameItem(name1, name2) {
  const hasChinese = (str) => /[\u4e00-\u9fa5]/.test(str);

  if (hasChinese(name1) || hasChinese(name2)) {
    return name1 === name2; // Strict for Chinese
  }
  return name1.trim().toLowerCase() === name2.trim().toLowerCase(); // Loose for English
}
```

**Rationale:**

- Chinese: Users unlikely to add trailing spaces or case variations
- English: Common to have "Passport" vs "passport", accommodate typos
- Mixed text: Treat as Chinese (strict) for safety

**Alternative considered:** Always use strict comparison

- Rejected: Creates duplicate items for common English variations

### 4. Quantity Handling: Default to 1

**Decision:** When merging items with same name, always set `qty: 1` regardless of source quantities.

**Rationale:**

- Different types may have different quantity assumptions (travel passport × 1, diving passport × 2)
- No universally correct answer for "max", "sum", or "first"
- Better to be explicit and let user adjust than guess wrong
- Consistent behavior is easier to learn

**Alternative considered:** Use maximum quantity

- Rejected: May surprise users with unexpectedly high quantities

### 5. Display Format: Tag Badges

**Decision:** Show selected types as small badge components on trip cards.

```
┌────────────────────────┐
│ 11月日本土浦煙火行       │
│ [旅遊] [潛水]           │
│ 出發 3/8  │  回程 5/8   │
└────────────────────────┘
```

**Rationale:**

- More scannable than plain text "旅遊+潛水"
- Visually distinct from trip name
- Matches "Trip Plan" tag design pattern
- No badges shown if no types selected (keeps UI clean)

**Alternative considered:** Show as subtitle text

- Rejected: Less visually distinct, harder to scan

## Risks / Trade-offs

### Risk: localStorage Migration Failures

**Risk:** Corrupted or incompatible data during migration breaks the app.

**Mitigation:**

- Wrap migration in try-catch with fallback to empty state
- Preserve backward read compatibility (read both `typeId` and `typeIds`)
- Only write new structure on save, don't force rewrite of old data immediately

### Risk: User Confusion on Quantity Reset

**Risk:** Users expect merged items to sum or max quantities, surprised by qty: 1.

**Mitigation:**

- Not critical as users must review items before trip anyway
- Consider adding subtle hint text near form: "合併的物品數量將設為 1，可自行調整"
- Low priority: can iterate based on feedback

### Risk: Orphaned Type IDs

**Risk:** `typeIds` array contains deleted type IDs, causing confusion or errors.

**Mitigation:**

- Use `typeDisplay` for all display purposes (immune to deletions)
- When reading `typeIds`, filter out non-existent IDs silently
- No functionality depends on typeIds being valid (nice-to-have only)

### Trade-off: 3-Type Limit vs. Unlimited Selection

**Trade-off:** Limit may frustrate power users who want 4+ types.

**Decision:** Accept limitation for now.

- Rare use case (most trips have 1-2 activity types)
- Unlimited selection creates long badge lists, poor UX
- Can raise limit in future if user feedback demands it

## Migration Plan

### Data Migration

Run migration function on state load:

```javascript
function migrateTrips(state) {
  state.trips.forEach((trip) => {
    // If has old typeId but no new fields
    if (trip.typeId && !trip.typeIds) {
      const type = state.tripTypes.find((t) => t.id === trip.typeId);
      trip.typeIds = [trip.typeId];
      trip.typeDisplay = type?.name || null;
      delete trip.typeId;
    }

    // Ensure new fields exist
    if (!trip.typeIds) {
      trip.typeIds = null;
      trip.typeDisplay = null;
    }
  });
}
```

**Rollout:**

1. Deploy migration logic first (read both old/new formats)
2. New trips use new structure immediately
3. Old trips migrate lazily on load
4. After N days, can remove `typeId` read fallback

**Rollback:**

- If critical bug found, revert JS changes
- Data written in new format will lose type info on rollback (acceptable, trips remain functional)

## Open Questions

None - all key decisions finalized during exploration phase.
