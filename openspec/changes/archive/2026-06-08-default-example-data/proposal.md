## Why

First-time users see empty lists and lack context for how to use the app's trip type presets and trip management features. Providing working examples on first launch demonstrates the feature flow and accelerates learning.

## What Changes

- Add default example data that seeds the app on first launch (when localStorage is empty)
- Provide one example trip type: "旅遊" with "護照" as a preset item
- Provide one example trip: "11月日本土浦煙火行" created from the "旅遊" type, containing "護照" (from the type) and "手機" (additional item)
- The seeding happens once; if user deletes examples or creates any data, examples won't reappear
- All example items start unchecked to demonstrate the checkbox interaction
- Example data uses fixed IDs with `demo-` prefix for easy identification

## Capabilities

### New Capabilities

- `default-example-data`: Mechanism to detect first launch and seed predefined trip types and trips into empty state

### Modified Capabilities

- `local-persistence`: Add first-launch detection logic to seed example data before normal load path

## Impact

- Modifies `loadState()` function in app.js to detect empty localStorage and inject examples
- Affects initial user experience only - existing users with saved data see no changes
- No breaking changes to data structure or API
- Example data can be deleted by users like any other data
