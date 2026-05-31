## Why

Travellers currently track packing lists on paper, making it error-prone and inconvenient to verify items before returning home. A mobile-friendly web app replaces paper with a persistent, always-available checklist that covers both departure and return checks.

## What Changes

- Introduce a new pure-frontend web app with no backend or database requirement
- Add a **Trips** management layer: create, name, and delete trips (each trip = one journey)
- Add an **Items** management layer within each trip: item name, quantity, pre-departure checked state, and return-home checked state
- Persist all data in `localStorage` so the list survives page refreshes and browser restarts
- Responsive layout (RWD) optimised for mobile screens (≥ 320 px) and usable on desktop

## Capabilities

### New Capabilities

- `trip-management`: Create, list, rename, and delete trips; each trip is an independent packing session
- `item-management`: Add, edit, and remove items within a trip; each item stores name, quantity, pre-departure checkbox state, and return-home checkbox state
- `local-persistence`: Serialise and deserialise all trip and item data to/from `localStorage`
- `responsive-layout`: CSS layout that adapts from small mobile screens up to wide desktop viewports

### Modified Capabilities

<!-- No existing specs to modify -->

## Impact

- New standalone frontend files (HTML, CSS, JS) — no existing code affected
- No external dependencies required; vanilla HTML/CSS/JS or a lightweight framework acceptable
- Data stored exclusively in the user's browser `localStorage`; no server, API, or database involved
