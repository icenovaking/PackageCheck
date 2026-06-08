## 1. Define Example Data

- [x] 1.1 Create DEMO_DATA constant with example trip type "旅遊" containing preset item "護照" (qty 1)
- [x] 1.2 Add example trip "11月日本土浦煙火行" with typeId referencing the example trip type
- [x] 1.3 Add two items to example trip: "護照" (qty 1) and "手機" (qty 1), both unchecked
- [x] 1.4 Use `demo-` prefixed IDs for all example data objects (demo-type-, demo-preset-, demo-trip-, demo-item-)
- [x] 1.5 Use fixed timestamps (e.g., "2026-01-01T00:00:00.000Z") for createdAt fields

## 2. Modify Load State Logic

- [x] 2.1 Update loadState() to check if localStorage.getItem(STORAGE_KEY) returns null
- [x] 2.2 When null, assign DEMO_DATA to state and call saveState() immediately
- [x] 2.3 When not null, preserve existing load behavior (parse JSON, handle legacy payloads)
- [x] 2.4 Ensure corrupt data handling still resets to empty state (not example data)

## 3. Verification

- [x] 3.1 Test first launch: clear localStorage, reload page, verify example trip type and trip appear
- [x] 3.2 Test trip type selector shows "旅遊" option on add-trip form
- [x] 3.3 Test example trip shows correct name and items (護照, 手機) when opened
- [x] 3.4 Test creating a new trip with "旅遊" type seeds "護照" preset item
- [x] 3.5 Test deleting example data and reloading does not re-seed examples
- [x] 3.6 Test existing users: with pre-existing localStorage, examples do not appear
