## Context

Travellers need a simple mobile-friendly checklist to track which items they packed and whether those items were returned home safely. The current solution is a handwritten paper list that is easily lost and inconvenient to update. The new solution is a pure-frontend web app stored entirely in the user's browser, requiring no server infrastructure and working offline after the first page load.

The project has no existing codebase; this is a greenfield implementation.

## Goals / Non-Goals

**Goals:**

- Deliver a responsive single-page app usable on mobile phones (≥ 320 px wide) and desktops
- Allow users to create multiple trips, each acting as an independent packing session
- Within each trip, manage items with: name, quantity, pre-departure checked state, return-home checked state
- Persist all data in `localStorage` so data survives page reloads and browser restarts
- Zero external runtime dependencies — ship as plain HTML + CSS + JS (or a zero-dependency build)
- Operate fully offline after the initial page load

**Non-Goals:**

- User accounts, authentication, or server-side storage
- Cloud sync or multi-device data sharing
- Collaboration / sharing trips with other people
- Native mobile app (PWA install is a nice-to-have but not required)
- Sorting, filtering, or search across trips/items in v1
- Photo attachments or barcodes

## Decisions

### 1. Technology stack: Vanilla HTML/CSS/JS (no framework)

**Decision:** Use plain HTML, CSS, and JavaScript with no build step.

**Rationale:** The feature set is straightforward CRUD with local persistence. Adding React/Vue/etc. introduces a build pipeline, node_modules, and bundling complexity that is unnecessary for a single-file app. Vanilla JS keeps the output portable (open the HTML file directly in a browser, or drop it on any static host).

**Alternatives considered:**

- _Vue 3 CDN build_ — considered for reactivity convenience; rejected because it adds a CDN dependency that breaks offline-first use without extra setup.
- _React (Vite)_ — rejected; build step required, over-engineered for scope.

### 2. Data model: flat JSON in `localStorage`

**Decision:** Store a single JSON blob under one `localStorage` key (e.g., `packcheck_data`).

Shape:

```json
{
  "trips": [
    {
      "id": "uuid-or-timestamp",
      "name": "Japan 2026",
      "createdAt": "ISO-date",
      "items": [
        {
          "id": "uuid-or-timestamp",
          "name": "Passport",
          "qty": 1,
          "departureChecked": false,
          "returnChecked": false
        }
      ]
    }
  ]
}
```

**Rationale:** `localStorage` supports up to ~5 MB per origin — far more than any realistic packing list. A single serialised key avoids key-namespace collisions and makes export/import trivial if added later.

**Alternatives considered:**

- _IndexedDB_ — more capable but significantly more complex API; unnecessary for this data volume.
- _One key per trip_ — harder to iterate and back up; rejected.

### 3. Routing: hash-based SPA navigation

**Decision:** Use `location.hash` (`#trips`, `#trip/<id>`) to switch between the trip list and a trip detail view within a single HTML file.

**Rationale:** No server needed, works with `file://` protocol, simple to implement, and supports the browser back button naturally.

**Alternatives considered:**

- _History API_ — requires a server to handle deep-link reloads; rejected for offline compatibility.
- _Multiple HTML pages_ — would require passing state via URL params or `localStorage` flags; messier than hash routing.

### 4. Responsive layout: CSS Flexbox + media queries, mobile-first

**Decision:** Design for 320 px viewport first, with breakpoints at 600 px and 900 px.

**Rationale:** Target users are primarily on mobile phones. Desktop is secondary. Mobile-first CSS ensures a good baseline experience and progressively enhances.

### 5. Visual theme: travel-inspired design system

**Decision:** Apply a cohesive travel theme via CSS custom properties (variables): sky-blue primary (`#0077B6`), sunset-orange accent (`#F4A261`), sandy-cream background (`#FDF6EC`), with "Playfair Display" loaded from Google Fonts for headings and `system-ui` for body text.

**Rationale:** The app is emotionally tied to travel and adventure. A themed UI reinforces context, makes the app feel polished, and improves user delight with zero functional complexity. CSS variables keep the palette easy to change later.

**Alternatives considered:**

- _Generic material/flat style_ — functional but no personality; rejected in favour of a more distinctive identity.
- _Full custom icon set_ — over-engineered; emoji + one or two inline SVGs are sufficient for v1.

**Key visual tokens:**

```css
:root {
  --color-primary: #0077b6; /* sky/ocean blue  */
  --color-accent: #f4a261; /* sunset orange   */
  --color-bg: #fdf6ec; /* sandy cream     */
  --color-surface: #ffffff; /* card background */
  --color-text: #1a1a2e; /* dark navy text  */
  --radius-card: 12px;
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

## Risks / Trade-offs

- **`localStorage` is browser-scoped** → if the user clears browser data, all trips are lost. Mitigation: add a visible "Export JSON" button in a future iteration; document this limitation clearly in the UI.
- **No UUID library** → item/trip IDs generated with `Date.now() + Math.random()`. Collision probability is negligible for personal use; acceptable trade-off for zero-dependency goal.
- **Single-file HTML may grow large** → acceptable for this scope; if CSS/JS grows unwieldy, split into `style.css` + `app.js` referenced from `index.html`.
- **No offline service worker** → the page must be loaded at least once with network access (if hosted); after that, the browser cache usually suffices. A full PWA approach is deferred.
