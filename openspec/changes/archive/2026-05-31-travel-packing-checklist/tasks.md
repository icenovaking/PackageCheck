## 1. Project Scaffold

- [x] 1.1 Create `index.html` with HTML5 boilerplate, `<meta name="viewport">`, and links to `style.css` and `app.js`
- [x] 1.2 Create `style.css` with CSS reset and mobile-first base styles (font-size ≥ 16 px, box-sizing border-box)
- [x] 1.3 Create `app.js` with module skeleton (state object, init function, render function)

## 2. Local Persistence Layer

- [x] 2.1 Implement `loadState()` — read and parse JSON from `localStorage`; return empty state on missing or corrupt data and show a non-blocking warning
- [x] 2.2 Implement `saveState()` — serialise state to JSON and write to `localStorage`; detect unavailable storage and warn the user
- [x] 2.3 Wire `saveState()` to be called after every mutation (create, update, delete, toggle)

## 3. Hash-Based Routing

- [x] 3.1 Implement `router()` function that reads `location.hash` and renders the correct view (`#trips` → trip list, `#trip/<id>` → trip detail)
- [x] 3.2 Attach `hashchange` event listener and call `router()` on page load
- [x] 3.3 Ensure browser back button navigates from trip detail back to trip list

## 4. Trip Management

- [x] 4.1 Render trip list view: display all trips by name or show an empty-state message when none exist
- [x] 4.2 Implement "New Trip" button that prompts for a name, validates it is non-empty, creates a trip object (unique ID, name, createdAt, empty items array), saves state, and re-renders
- [x] 4.3 Implement trip delete: show confirmation prompt, remove trip from state, save, and re-render
- [x] 4.4 Navigate to `#trip/<id>` when a trip row is tapped/clicked

## 5. Item Management

- [x] 5.1 Render trip detail view: show trip name, back link to `#trips`, and list of items (name, qty, departure checkbox, return checkbox)
- [x] 5.2 Implement "Add Item" form: fields for name (non-empty) and quantity (positive integer), validate inputs, append item to trip, save state, and re-render
- [x] 5.3 Implement toggle for pre-departure checkbox: flip `departureChecked`, save state, re-render
- [x] 5.4 Implement toggle for return-home checkbox: flip `returnChecked`, save state, re-render
- [x] 5.5 Implement inline edit for item name and quantity: validate updated values, save state, re-render
- [x] 5.6 Implement item delete: remove item from trip, save state, re-render

## 6. Responsive Layout

- [x] 6.1 Apply mobile-first layout in `style.css`: full-width content with comfortable padding on small screens (≥ 320 px), no horizontal overflow
- [x] 6.2 Add breakpoint at 600 px to centre and constrain content column width to ≤ 640 px
- [x] 6.3 Ensure all interactive elements (buttons, checkboxes, list rows) have a minimum tap target height of 44 px
- [x] 6.4 Set font-size ≥ 16 px on all `<input>` elements to prevent iOS Safari auto-zoom

## 7. Travel Visual Theme

- [x] 7.1 Define CSS custom properties (variables) for colour palette (`--color-primary`, `--color-accent`, `--color-bg`, `--color-surface`, `--color-text`, `--radius-card`, `--shadow-card`) in `:root`
- [x] 7.2 Load "Playfair Display" from Google Fonts (or embed as `@font-face`) and apply it to `h1`, `h2`; set `system-ui` as the body font stack
- [x] 7.3 Apply `--color-bg` as page background and `--color-text` as default text colour
- [x] 7.4 Style the app header: travel icon (✈️ or inline SVG suitcase), title in Playfair Display, primary-colour background strip
- [x] 7.5 Style trip cards: `--color-surface` background, `--radius-card` rounded corners, `--shadow-card` drop shadow, left accent stripe in `--color-primary`
- [x] 7.6 Style primary action buttons with `--color-accent` background, white text, rounded corners, and a darker hover/active state
- [x] 7.7 Style form inputs with rounded border, focus ring in `--color-primary`, and ≥ 12 px vertical padding
- [x] 7.8 Implement custom checkbox styling: checked state tick in `--color-primary`; column headers labelled ✈️ 出發 and 🏠 回國
- [x] 7.9 Add travel emoji (🗺️) to the empty-state message on the trip list view

## 8. Polish & Edge Cases

- [x] 8.1 Display a non-blocking banner when localStorage is unavailable (in-memory mode warning)
- [x] 8.2 Visually distinguish items where both checkboxes are checked (e.g. greyed-out or strikethrough) for quick scan
- [x] 8.3 Show a summary line per trip in the trip list (e.g. "5 items, 3/5 packed, 2/5 returned") for at-a-glance status
- [ ] 8.4 Test on Chrome/Safari mobile emulation at 320 px, 375 px, and 768 px viewport widths and fix any layout issues
