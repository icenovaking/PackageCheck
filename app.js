/* =========================================================================
   PackCheck – Travel Packing Checklist
   Pure vanilla JS, localStorage persistence, hash-based SPA routing.
   ========================================================================= */

// ─── State (1.3) ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "packcheck_data";

/** @type {{ trips: Array<{id:string, name:string, createdAt:string, items:Array, typeId?:string|null, typeIds?:string[]|null, typeDisplay?:string|null}>, tripTypes: Array<{id:string, name:string, createdAt:string, presetItems:Array<{id:string,name:string,qty:number}>}> }} */
let state = { trips: [], tripTypes: [] };
let storageAvailable = true;
const uiState = {
  expandedTripId: null,
  expandedTypeId: null,
  editingTypeId: null,
  editingTripId: null,
  pendingCardFocus: null,
};

const ICONS = {
  brand: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="8.25"></circle>
      <path d="M12 7.25 15 12l-3 4.75L9 12l3-4.75Z"></path>
      <path d="M12 3.75v3M20.25 12h-3M12 20.25v-3M3.75 12h3"></path>
    </svg>`,
  suitcase: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="5" y="7" width="14" height="12" rx="2.5"></rect>
      <path d="M9 7V5.75A1.75 1.75 0 0 1 10.75 4h2.5A1.75 1.75 0 0 1 15 5.75V7"></path>
      <path d="M12 10.5v5"></path>
    </svg>`,
  route: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="6" cy="17" r="2"></circle>
      <circle cx="18" cy="7" r="2"></circle>
      <path d="M8 16c2.5-.25 4.25-1.1 5.25-2.5 1-1.4 1.75-2.55 2.75-4.5"></path>
      <path d="m14.5 6.5 1.5-2 2 1.5"></path>
    </svg>`,
  departure: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 18h18"></path>
      <path d="m6 15 11-6 1.75 1.75-5.5 4.25 2.25 1.5-1.25 1.25-3-1-1.5 2H8l.75-2.5L6 15Z"></path>
    </svg>`,
  arrival: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 18h18"></path>
      <path d="m6 10.5 2 1 7.75-3.5 1.75 1.75L13 13.5l1.5 2-1.25 1.25-2-1.25L9.5 18H8l.5-3L6 13.5v-3Z"></path>
    </svg>`,
  trash: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 7h16"></path>
      <path d="M9 7V5.75A1.75 1.75 0 0 1 10.75 4h2.5A1.75 1.75 0 0 1 15 5.75V7"></path>
      <path d="M7.5 7 8.25 19A2 2 0 0 0 10.24 21h3.52a2 2 0 0 0 1.99-2L16.5 7"></path>
      <path d="M10 11v5M14 11v5"></path>
    </svg>`,
  edit: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="m4 16.25 8.75-8.75 3.75 3.75L7.75 20H4v-3.75Z"></path>
      <path d="m12 8.25 2-2a1.75 1.75 0 0 1 2.5 0l1.25 1.25a1.75 1.75 0 0 1 0 2.5l-2 2"></path>
    </svg>`,
  check: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">
      <path d="m5 12.5 4.25 4.25L19 7"></path>
    </svg>`,
  x: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round">
      <path d="M6 6l12 12M18 6 6 18"></path>
    </svg>`,
  plus: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <path d="M12 5v14M5 12h14"></path>
    </svg>`,
  back: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="m10 6-6 6 6 6"></path>
      <path d="M4 12h16"></path>
    </svg>`,
  settings: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.13.43.45.79.86 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"></path>
    </svg>`,
  chevronDown: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="m6 9 6 6 6-6"></path>
    </svg>`,
  chevronUp: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="m6 15 6-6 6 6"></path>
    </svg>`,
};

// ─── Example Data ────────────────────────────────────────────────────────────

const DEMO_DATA = {
  tripTypes: [
    {
      id: "demo-type-travel",
      name: "旅遊",
      createdAt: "2026-01-01T00:00:00.000Z",
      presetItems: [
        {
          id: "demo-preset-passport",
          name: "護照",
          qty: 1,
        },
      ],
    },
  ],
  trips: [
    {
      id: "demo-trip-japan",
      name: "11月日本土浦煙火行",
      createdAt: "2026-01-01T00:00:00.000Z",
      typeIds: ["demo-type-travel"],
      typeDisplay: "旅遊",
      items: [
        {
          id: "demo-item-passport",
          name: "護照",
          qty: 1,
          departureChecked: false,
          returnChecked: false,
        },
        {
          id: "demo-item-phone",
          name: "手機",
          qty: 1,
          departureChecked: false,
          returnChecked: false,
        },
      ],
    },
  ],
};

// ─── Persistence (2.1 / 2.2) ─────────────────────────────────────────────────

function loadState() {
  // Probe whether localStorage is usable
  try {
    localStorage.setItem("__pc_probe__", "1");
    localStorage.removeItem("__pc_probe__");
  } catch (_) {
    storageAvailable = false;
    showStorageWarning(
      "您的瀏覽器不支援本地儲存，本次資料將在關閉頁面後消失。",
    );
    return;
  }

  // Read existing data
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      // First launch: seed with example data
      state = DEMO_DATA;
      saveState();
      return;
    }

    // Parse existing data
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.trips)) {
      state = parsed;
      // Legacy payloads predating trip-types: default to [] silently.
      if (!Array.isArray(state.tripTypes)) {
        state.tripTypes = [];
      }
      // Migrate legacy typeId to typeIds + typeDisplay
      migrateTrips();
    } else {
      throw new Error("unexpected shape");
    }
  } catch (_) {
    state = { trips: [], tripTypes: [] };
    showStorageWarning("偵測到損毀的儲存資料，已重設為空白清單。");
  }
}

/** Write current state to localStorage. Called after every mutation (2.3). */
function saveState() {
  if (!storageAvailable) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {
    showStorageWarning("無法儲存資料，儲存空間可能已滿。");
  }
}

function showStorageWarning(msg) {
  const el = document.getElementById("storage-warning");
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Simple collision-resistant ID for personal use. */
function genId() {
  return `${Date.now()}-${Math.floor(Math.random() * 1e7)}`;
}

/** Escape HTML special characters to prevent XSS. */
function esc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function icon(name) {
  return `<span class="icon icon-${name}" aria-hidden="true">${ICONS[name] || ""}</span>`;
}

function cardSelector(kind, id) {
  if (kind === "trip") {
    return `.trip-card[data-trip-id="${esc(id)}"]`;
  }
  return `.trip-type-card[data-type-id="${esc(id)}"]`;
}

function toggleExpandedCard(kind, id) {
  const key = kind === "trip" ? "expandedTripId" : "expandedTypeId";
  uiState[key] = uiState[key] === id ? null : id;
}

function setExpandedCard(kind, id) {
  const key = kind === "trip" ? "expandedTripId" : "expandedTypeId";
  uiState[key] = id;
}

function queueCardFocus(kind, id) {
  uiState.pendingCardFocus = { kind, id };
}

function applyPendingCardFocus(app) {
  if (!uiState.pendingCardFocus) return;
  const { kind, id } = uiState.pendingCardFocus;
  uiState.pendingCardFocus = null;

  requestAnimationFrame(() => {
    const card = app.querySelector(cardSelector(kind, id));
    if (!card) return;

    card.scrollIntoView({ behavior: "smooth", block: "start" });
    card.classList.add("card-highlight");
    card.setAttribute("tabindex", "-1");
    card.focus({ preventScroll: true });

    setTimeout(() => {
      card.classList.remove("card-highlight");
      if (card.getAttribute("tabindex") === "-1") {
        card.removeAttribute("tabindex");
      }
    }, 1800);
  });
}

function buildTripTypeBadges(typeDisplay) {
  if (!typeDisplay) return "";
  const typeNames = typeDisplay.split("+");
  return `
    <div class="trip-type-badges">
      ${typeNames.map((name) => `<span class="trip-type-badge">${esc(name)}</span>`).join("")}
    </div>`;
}

function buildTripItemsContent(trip) {
  if (trip.items.length === 0) {
    return `
      <div class="empty-state empty-state-inline">
        <div class="empty-icon">${icon("suitcase")}</div>
        <h3>還沒有物品</h3>
        <p>把護照、充電器、衣物或回程伴手禮需求都先列進來，之後勾選會更快。</p>
      </div>`;
  }

  const rows = trip.items.map((item) => buildItemRow(item)).join("");
  return `
    <div class="item-table-wrap">
      <table class="item-table" role="grid" aria-label="行李清單">
        <thead>
          <tr>
            <th class="col-name">物品</th>
            <th class="col-qty">數量</th>
            <th class="col-check">出發</th>
            <th class="col-check">回程</th>
            <th class="col-actions"></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function buildTripManager(trip, view) {
  const scopeId = `${view}-${trip.id}`;
  return `
    <form class="add-form surface-panel js-add-item-form" data-trip-id="${esc(trip.id)}" data-view="${view}" novalidate>
      <div class="input-group input-group-wide">
        <label for="input-item-name-${esc(scopeId)}">物品名稱</label>
        <input
          type="text"
          id="input-item-name-${esc(scopeId)}"
          class="js-item-name-input"
          placeholder="物品名稱（例如：護照）"
          autocomplete="off"
          maxlength="100"
        />
      </div>
      <div class="input-group input-group-compact">
        <label for="input-item-qty-${esc(scopeId)}">數量</label>
        <input
          type="number"
          id="input-item-qty-${esc(scopeId)}"
          class="js-item-qty-input"
          placeholder="數量"
          min="1"
          value="1"
        />
      </div>
      <button type="submit" class="btn-primary">
        ${icon("plus")}
        <span>新增物品</span>
      </button>
    </form>
    <div class="field-error hidden js-item-error" data-trip-id="${esc(trip.id)}" data-view="${view}" role="alert"></div>
    <div class="item-list">${buildTripItemsContent(trip)}</div>`;
}

function rerenderTripView(tripId, view) {
  if (view === "detail") {
    renderTripDetail(document.getElementById("app"), tripId);
    return;
  }

  uiState.expandedTripId = tripId;
  renderTripList(document.getElementById("app"));
}

function bindTripItemForms(app) {
  app.querySelectorAll(".js-add-item-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const tripId = form.dataset.tripId;
      const view = form.dataset.view || "detail";
      const trip = state.trips.find((t) => t.id === tripId);
      if (!trip) return;

      const nameInput = form.querySelector(".js-item-name-input");
      const qtyInput = form.querySelector(".js-item-qty-input");
      const errEl = app.querySelector(
        `.js-item-error[data-trip-id="${esc(tripId)}"][data-view="${esc(view)}"]`,
      );
      const name = nameInput.value.trim();
      const qty = parseInt(qtyInput.value, 10);

      if (!name) {
        errEl.textContent = "請輸入物品名稱。";
        errEl.classList.remove("hidden");
        nameInput.focus();
        return;
      }

      if (!Number.isInteger(qty) || qty < 1) {
        errEl.textContent = "數量必須是正整數（≥ 1）。";
        errEl.classList.remove("hidden");
        qtyInput.focus();
        return;
      }

      errEl.classList.add("hidden");
      trip.items.push({
        id: genId(),
        name,
        qty,
        departureChecked: false,
        returnChecked: false,
      });
      saveState();
      rerenderTripView(tripId, view);
    });
  });
}

function buildTripCard(trip) {
  const total = trip.items.length;
  const dep = trip.items.filter((i) => i.departureChecked).length;
  const ret = trip.items.filter((i) => i.returnChecked).length;
  const progressSummary =
    total === 0 ? "尚未建立任何行李項目" : `${total} 件物品已加入清單`;
  const expanded = uiState.expandedTripId === trip.id;
  const editing = uiState.editingTripId === trip.id;

  const headerHtml = editing
    ? `
        <div class="card-toggle-editing">
          <div class="trip-card-main">
            <div class="trip-card-top">
              <span class="trip-tag">Trip Plan</span>
              <span class="trip-summary">${progressSummary}</span>
            </div>
            <input type="text" class="edit-name-input js-edit-trip-input" value="${esc(trip.name)}" maxlength="100" aria-label="旅程名稱" />
          </div>
          <span class="card-toggle-indicator disabled">${icon("chevronUp")}</span>
        </div>`
    : `
        <button type="button" class="card-toggle trip-card-toggle js-toggle-trip" data-id="${esc(trip.id)}" aria-expanded="${expanded}">
          <div class="trip-card-main">
            <div class="trip-card-top">
              <span class="trip-tag">Trip Plan</span>
              <span class="trip-summary">${progressSummary}</span>
            </div>
            <span class="trip-name">${esc(trip.name)}</span>
          </div>
          <span class="card-toggle-indicator">${icon(expanded ? "chevronUp" : "chevronDown")}</span>
        </button>`;

  const actionsHtml = expanded
    ? `
        <div class="trip-card-header-actions">
          ${
            editing
              ? `
                <button class="btn-icon btn-icon-save js-save-trip" data-id="${esc(trip.id)}" aria-label="儲存旅程 ${esc(trip.name)}">
                  ${icon("check")}
                </button>
                <button class="btn-icon btn-icon-cancel js-cancel-trip" data-id="${esc(trip.id)}" aria-label="取消編輯旅程 ${esc(trip.name)}">
                  ${icon("x")}
                </button>`
              : `
                <button class="btn-icon btn-icon-edit js-edit-trip" data-id="${esc(trip.id)}" aria-label="編輯旅程 ${esc(trip.name)}">
                  ${icon("edit")}
                </button>
                <button class="btn-icon btn-icon-danger js-delete-trip" data-id="${esc(trip.id)}" aria-label="刪除旅程 ${esc(trip.name)}">
                  ${icon("trash")}
                </button>`
          }
        </div>`
    : "";

  return `
    <div class="trip-card surface-panel${expanded ? " is-expanded" : ""}" data-trip-id="${esc(trip.id)}" role="listitem">
      <div class="trip-card-header">
        ${headerHtml}
        ${actionsHtml}
      </div>
      ${
        expanded
          ? `
            <div class="trip-card-panel">
              ${buildTripTypeBadges(trip.typeDisplay)}
              <div class="trip-progress trip-progress-paired">
                <span class="progress-pill progress-pill-departure">${icon("departure")}出發 ${dep}/${total}</span>
                <span class="progress-pill progress-pill-return">${icon("arrival")}回程 ${ret}/${total}</span>
              </div>
              <div class="trip-card-panel-actions">
                <a href="#trip/${esc(trip.id)}" class="btn-secondary btn-sm trip-detail-link">完整頁面</a>
              </div>
            </div>`
          : ""
      }
    </div>`;
}

/**
 * Migrate trips from legacy typeId to typeIds + typeDisplay structure.
 * Called after loading state from storage.
 */
function migrateTrips() {
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

/**
 * Check if two item names are the same for deduplication purposes.
 * - Chinese text: strict exact match (===)
 * - English text: case-insensitive + trimmed
 * - Mixed text: treat as Chinese (strict)
 */
function isSameItem(name1, name2) {
  const hasChinese = (str) => /[\u4e00-\u9fa5]/.test(str);

  // Any Chinese characters → strict comparison
  if (hasChinese(name1) || hasChinese(name2)) {
    return name1 === name2;
  }

  // Pure English/ASCII → case-insensitive + trimmed
  return name1.trim().toLowerCase() === name2.trim().toLowerCase();
}

/**
 * Merge preset items from multiple trip types with intelligent deduplication.
 * @param {string[]} selectedTypeIds - Array of trip type IDs to merge
 * @returns {Array} Merged and deduplicated items with qty: 1
 */
function mergePresetItems(selectedTypeIds) {
  const allItems = [];
  const existingNames = [];

  selectedTypeIds.forEach((typeId) => {
    const type = state.tripTypes.find((t) => t.id === typeId);
    if (!type) return;

    type.presetItems.forEach((preset) => {
      // Check if item already exists using intelligent comparison
      const isDuplicate = existingNames.some((existing) =>
        isSameItem(existing, preset.name),
      );

      if (!isDuplicate) {
        existingNames.push(preset.name);
        allItems.push({
          id: genId(),
          name: preset.name,
          qty: 1, // Always default to 1
          departureChecked: false,
          returnChecked: false,
        });
      }
    });
  });

  return allItems;
}

/**
 * Build display string from selected trip type IDs.
 * @param {string[]} selectedTypeIds - Array of trip type IDs
 * @returns {string|null} Display string like "旅遊+潛水" or null if empty
 */
function buildTypeDisplay(selectedTypeIds) {
  if (!selectedTypeIds || selectedTypeIds.length === 0) return null;

  const names = selectedTypeIds
    .map((id) => state.tripTypes.find((t) => t.id === id))
    .filter(Boolean)
    .map((t) => t.name);

  return names.length > 0 ? names.join("+") : null;
}

// ─── Router (3.1 / 3.2 / 3.3) ────────────────────────────────────────────────

function router() {
  const hash = location.hash;
  const app = document.getElementById("app");

  if (!hash || hash === "#trips") {
    renderTripList(app);
  } else if (hash === "#settings") {
    renderSettings(app);
  } else if (hash.startsWith("#trip/")) {
    const id = hash.slice("#trip/".length);
    renderTripDetail(app, id);
  } else {
    // Unknown route → redirect home (3.3 handles back button naturally via hash)
    location.replace("#trips");
  }
}

// Attach hashchange so every navigation (including back button) runs router (3.2)
window.addEventListener("hashchange", router);

// ─── Trip List View (4.1 / 4.2 / 4.3 / 4.4) ─────────────────────────────────

function renderTripList(app) {
  const { trips } = state;
  if (uiState.expandedTripId && !trips.some((trip) => trip.id === uiState.expandedTripId)) {
    uiState.expandedTripId = null;
  }

  // Build trip cards or empty state
  let tripsContent;
  if (trips.length === 0) {
    tripsContent = `
      <div class="empty-state">
        <div class="empty-icon">${icon("route")}</div>
        <h3>還沒有旅程</h3>
        <p>先建立一個目的地，接著把每件必帶行李整理成清楚的出發與回程清單。</p>
      </div>`;
  } else {
    tripsContent = trips.map((trip) => buildTripCard(trip)).join("");
  }

  app.innerHTML = `
    <div class="page-shell">
      <header class="app-header">
        <div class="brand-lockup">
          <div class="brand-mark">${icon("brand")}</div>
          <div>
            <p class="eyebrow">Travel Packing Companion</p>
            <h1>PackCheck</h1>
          </div>
        </div>
        <div class="header-chip">旅遊行李檢查</div>
      </header>
      <main class="page-main view-trips">
        <section class="content-panel">
          <div class="view-header">
            <div>
              <p class="section-kicker">My Trips</p>
              <h2>我的旅程</h2>
            </div>
            <a href="#settings" class="header-chip" aria-label="開啟旅程類型設定">
              類型設定
            </a>
          </div>

          <form id="form-trip-jump" class="jump-search-form surface-panel" novalidate>
            <div class="input-group input-group-grow">
              <label for="select-trip-jump">現有行程查詢</label>
              <select id="select-trip-jump" class="select-input"${trips.length === 0 ? " disabled" : ""}>
                <option value="">${trips.length === 0 ? "尚無可查詢行程" : "選擇現有行程"}</option>
                ${trips
                  .map(
                    (trip) =>
                      `<option value="${esc(trip.id)}">${esc(trip.name)}</option>`,
                  )
                  .join("")}
              </select>
            </div>
            <button type="submit" class="btn-primary"${trips.length === 0 ? " disabled" : ""}>
              查詢
            </button>
          </form>

          <form id="form-add-trip" class="add-form surface-panel" novalidate>
            <div class="input-group">
              <label for="input-trip-name">旅程名稱</label>
              <input
                type="text"
                id="input-trip-name"
                placeholder="輸入旅程名稱（例如：日本 2026）"
                autocomplete="off"
                maxlength="100"
              />
            </div>
            <div class="input-group">
              <div class="trip-type-label-row">
                <label>旅程類型</label>
                <span id="selection-counter" class="selection-counter hidden"></span>
              </div>
              <div class="trip-type-checkboxes">
                <label class="trip-type-checkbox">
                  <input type="checkbox" name="trip-type" value="" data-is-none="true" checked />
                  <span>（無）</span>
                </label>
                ${state.tripTypes
                  .map(
                    (t) =>
                      `<label class="trip-type-checkbox">
                        <input type="checkbox" name="trip-type" value="${esc(t.id)}" />
                        <span>${esc(t.name)}</span>
                      </label>`,
                  )
                  .join("")}
              </div>
            </div>
            <button type="submit" class="btn-primary">
              ${icon("plus")}
              <span>新增旅程</span>
            </button>
          </form>
          <div id="trip-error" class="field-error hidden" role="alert"></div>

          <div class="trip-list" role="list">${tripsContent}</div>
        </section>
      </main>
    </div>`;

  // Bind: trip type checkbox handlers
  const checkboxes = app.querySelectorAll('input[name="trip-type"]');
  const counter = app.querySelector("#selection-counter");
  const noneCheckbox = app.querySelector('input[data-is-none="true"]');

  function updateSelectionCounter() {
    const selected = Array.from(checkboxes).filter(
      (cb) => cb.checked && !cb.dataset.isNone,
    );
    const count = selected.length;

    if (count === 0) {
      counter.classList.add("hidden");
    } else {
      counter.classList.remove("hidden");
      if (count >= 3) {
        counter.textContent = "已選 3 個（已達上限）";
        counter.classList.add("at-limit");
        // Disable unselected checkboxes
        checkboxes.forEach((cb) => {
          if (!cb.checked && !cb.dataset.isNone) {
            cb.disabled = true;
          }
        });
      } else {
        counter.textContent = `已選 ${count} 個（最多 3 個）`;
        counter.classList.remove("at-limit");
        // Enable all checkboxes
        checkboxes.forEach((cb) => {
          cb.disabled = false;
        });
      }
    }
  }

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      if (checkbox.dataset.isNone) {
        // "（無）" clicked - uncheck all others
        if (checkbox.checked) {
          checkboxes.forEach((cb) => {
            if (!cb.dataset.isNone) cb.checked = false;
          });
        }
      } else {
        // Any type clicked - uncheck "（無）"
        if (checkbox.checked && noneCheckbox) {
          noneCheckbox.checked = false;
        }
      }
      updateSelectionCounter();
    });
  });

  document.getElementById("form-trip-jump").addEventListener("submit", (e) => {
    e.preventDefault();
    const select = document.getElementById("select-trip-jump");
    if (!select.value) return;
    uiState.editingTypeId = null;
    setExpandedCard("trip", select.value);
    queueCardFocus("trip", select.value);
    renderTripList(document.getElementById("app"));
  });

  // Bind: add trip (4.2)
  document.getElementById("form-add-trip").addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("input-trip-name");
    const errEl = document.getElementById("trip-error");
    const name = nameInput.value.trim();

    // Collect selected type IDs from checkboxes
    const selectedTypeIds = Array.from(checkboxes)
      .filter((cb) => cb.checked && !cb.dataset.isNone && cb.value)
      .map((cb) => cb.value);

    if (!name) {
      errEl.textContent = "請輸入旅程名稱。";
      errEl.classList.remove("hidden");
      nameInput.focus();
      return;
    }

    errEl.classList.add("hidden");

    // Merge preset items from selected types
    const seedItems = mergePresetItems(selectedTypeIds);
    const typeDisplay = buildTypeDisplay(selectedTypeIds);

    state.trips.push({
      id: genId(),
      name,
      createdAt: new Date().toISOString(),
      typeIds: selectedTypeIds.length > 0 ? selectedTypeIds : null,
      typeDisplay,
      items: seedItems,
    });
    saveState(); // 2.3
    nameInput.value = "";
    checkboxes.forEach((cb) => (cb.checked = false));
    counter.classList.add("hidden");
    if (noneCheckbox) noneCheckbox.checked = true;
    uiState.expandedTripId = null;
    renderTripList(document.getElementById("app"));
  });

  app.querySelectorAll(".js-toggle-trip").forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleExpandedCard("trip", btn.dataset.id);
      renderTripList(document.getElementById("app"));
    });
  });

  // Bind: edit trip name
  app.querySelectorAll(".js-edit-trip").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      uiState.editingTripId = id;
      renderTripList(document.getElementById("app"));
      // Focus and select the input text
      const card = document.querySelector(`[data-trip-id="${id}"]`);
      const input = card?.querySelector(".js-edit-trip-input");
      if (input) {
        input.focus();
        input.select();
      }
    });
  });

  app.querySelectorAll(".js-save-trip").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const card = document.querySelector(`[data-trip-id="${id}"]`);
      const input = card?.querySelector(".js-edit-trip-input");
      const newName = input?.value.trim();
      if (!newName) {
        alert("請輸入旅程名稱。");
        input?.focus();
        return;
      }
      const trip = state.trips.find((t) => t.id === id);
      if (trip) {
        trip.name = newName;
        saveState();
      }
      uiState.editingTripId = null;
      renderTripList(document.getElementById("app"));
    });
  });

  app.querySelectorAll(".js-cancel-trip").forEach((btn) => {
    btn.addEventListener("click", () => {
      uiState.editingTripId = null;
      renderTripList(document.getElementById("app"));
    });
  });

  app.querySelectorAll(".js-edit-trip-input").forEach((input) => {
    input.addEventListener("keydown", (e) => {
      const card = input.closest("[data-trip-id]");
      const id = card?.dataset.tripId;
      if (!id) return;
      if (e.key === "Enter") {
        e.preventDefault();
        const newName = input.value.trim();
        if (!newName) {
          alert("請輸入旅程名稱。");
          input.focus();
          return;
        }
        const trip = state.trips.find((t) => t.id === id);
        if (trip) {
          trip.name = newName;
          saveState();
        }
        uiState.editingTripId = null;
        renderTripList(document.getElementById("app"));
      } else if (e.key === "Escape") {
        e.preventDefault();
        uiState.editingTripId = null;
        renderTripList(document.getElementById("app"));
      }
    });
  });

  // Bind: delete trip (4.3)
  app.querySelectorAll(".js-delete-trip").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const trip = state.trips.find((t) => t.id === id);
      if (!trip) return;
      if (
        !confirm(
          `確定要刪除「${trip.name}」？\n所有物品將一併刪除，且無法復原。`,
        )
      )
        return;
      state.trips = state.trips.filter((t) => t.id !== id);
      if (uiState.expandedTripId === id) {
        uiState.expandedTripId = null;
      }
      saveState(); // 2.3
      renderTripList(document.getElementById("app"));
    });
  });

  applyPendingCardFocus(app);
}

// ─── Trip Detail View (5.1 – 5.6) ────────────────────────────────────────────

function renderTripDetail(app, tripId) {
  const trip = state.trips.find((t) => t.id === tripId);
  if (!trip) {
    location.replace("#trips");
    return;
  }

  app.innerHTML = `
    <div class="page-shell">
      <header class="app-header">
        <div class="brand-lockup">
          <div class="brand-mark">${icon("brand")}</div>
          <div>
            <p class="eyebrow">Travel Packing Companion</p>
            <h1>PackCheck</h1>
          </div>
        </div>
        <div class="header-chip">旅遊行李檢查</div>
      </header>
      <main class="page-main view-detail">
        <section class="content-panel">
          <div class="view-header">
            <div>
              <a href="#trips" class="btn-back">${icon("back")}返回旅程</a>
              <p class="section-kicker">Packing Manifest</p>
              <h2>${esc(trip.name)}</h2>
            </div>
          </div>

          ${buildTripManager(trip, "detail")}
        </section>
      </main>
    </div>`;

  bindTripItemForms(app);
  bindItemActions(app, trip, () => {
    renderTripDetail(document.getElementById("app"), tripId);
  });
}

/** Build a single item <tr> HTML string. */
function buildItemRow(item) {
  const fullyChecked = item.departureChecked && item.returnChecked;
  return `
    <tr class="item-row${fullyChecked ? " fully-checked" : ""}" data-id="${esc(item.id)}">
      <td class="col-name item-name">
        <div class="item-primary">
          <span class="item-field-label">物品</span>
          <div class="table-item-name">${esc(item.name)}</div>
        </div>
      </td>
      <td class="col-qty item-qty">
        <div class="item-qty-block">
          <span class="item-field-label">數量</span>
          <span class="item-qty-value">${item.qty}</span>
        </div>
      </td>
      <td class="col-check col-check-departure">
        <div class="status-card">
          <span class="item-field-label">出發確認</span>
          <label class="checkbox-wrap" aria-label="出發確認：${esc(item.name)}">
            <input type="checkbox" class="js-cb-dep" data-id="${esc(item.id)}"${item.departureChecked ? " checked" : ""} />
            <span class="checkbox-custom"></span>
          </label>
        </div>
      </td>
      <td class="col-check col-check-return">
        <div class="status-card">
          <span class="item-field-label">回程確認</span>
          <label class="checkbox-wrap" aria-label="回國確認：${esc(item.name)}">
            <input type="checkbox" class="js-cb-ret" data-id="${esc(item.id)}"${item.returnChecked ? " checked" : ""} />
            <span class="checkbox-custom"></span>
          </label>
        </div>
      </td>
      <td class="col-actions">
        <div class="action-group">
          <button class="btn-icon btn-icon-edit js-edit-item" data-id="${esc(item.id)}" aria-label="編輯 ${esc(item.name)}">
            ${icon("edit")}
            <span class="btn-icon-text">編輯</span>
          </button>
          <button class="btn-icon btn-icon-danger js-delete-item" data-id="${esc(item.id)}" aria-label="刪除 ${esc(item.name)}">
            ${icon("trash")}
            <span class="btn-icon-text">刪除</span>
          </button>
        </div>
      </td>
    </tr>`;
}

/** Bind all item-level interactions. */
function bindItemActions(app, trip, rerender) {
  // 5.3 – pre-departure checkbox toggle
  app.querySelectorAll(".js-cb-dep").forEach((cb) => {
    cb.addEventListener("change", () => {
      const item = trip.items.find((i) => i.id === cb.dataset.id);
      if (!item) return;
      item.departureChecked = cb.checked;
      saveState(); // 2.3
      updateRowClass(app, item);
    });
  });

  // 5.4 – return-home checkbox toggle
  app.querySelectorAll(".js-cb-ret").forEach((cb) => {
    cb.addEventListener("change", () => {
      const item = trip.items.find((i) => i.id === cb.dataset.id);
      if (!item) return;
      item.returnChecked = cb.checked;
      saveState(); // 2.3
      updateRowClass(app, item);
    });
  });

  // 5.6 – delete item
  app.querySelectorAll(".js-delete-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = trip.items.find((i) => i.id === btn.dataset.id);
      if (!item) return;
      if (!confirm(`確定要刪除「${item.name}」？`)) return;
      trip.items = trip.items.filter((i) => i.id !== btn.dataset.id);
      saveState(); // 2.3
      rerender();
    });
  });

  // 5.5 – inline edit: switch row to edit mode
  app.querySelectorAll(".js-edit-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = trip.items.find((i) => i.id === btn.dataset.id);
      if (!item) return;
      const row = app.querySelector(`.item-row[data-id="${esc(item.id)}"]`);
      if (!row) return;
      row.classList.add("is-editing");

      row.innerHTML = `
        <td class="col-name">
          <input type="text" class="edit-name-input" value="${esc(item.name)}" maxlength="100" aria-label="物品名稱" />
        </td>
        <td class="col-qty">
          <input type="number" class="edit-qty-input" value="${item.qty}" min="1" aria-label="數量" />
        </td>
        <td class="col-check edit-placeholder" aria-hidden="true"></td>
        <td class="col-check edit-placeholder" aria-hidden="true"></td>
        <td class="col-actions edit-actions-cell">
          <button class="btn-icon btn-icon-save js-save-edit" aria-label="儲存 ${esc(item.name)}">
            ${icon("check")}
          </button>
          <button class="btn-icon btn-icon-cancel js-cancel-edit" aria-label="取消編輯 ${esc(item.name)}">
            ${icon("x")}
          </button>
        </td>`;

      const nameInput = row.querySelector(".edit-name-input");
      nameInput.focus();
      nameInput.select();

      row.querySelector(".js-save-edit").addEventListener("click", () => {
        const newName = row.querySelector(".edit-name-input").value.trim();
        const newQty = parseInt(row.querySelector(".edit-qty-input").value, 10);
        if (!newName || !Number.isInteger(newQty) || newQty < 1) return;
        item.name = newName;
        item.qty = newQty;
        saveState(); // 2.3
        rerender();
      });

      row.querySelector(".js-cancel-edit").addEventListener("click", () => {
        rerender();
      });
    });
  });
}

/**
 * Update the fully-checked CSS class on an item row in-place,
 * avoiding a full re-render on every checkbox toggle.
 */
function updateRowClass(app, item) {
  const row = app.querySelector(`.item-row[data-id="${esc(item.id)}"]`);
  if (!row) return;
  row.classList.toggle(
    "fully-checked",
    item.departureChecked && item.returnChecked,
  );
}

// ─── Settings View — Trip Type Presets ───────────────────────────────────────

function renderSettings(app) {
  const { tripTypes } = state;
  if (
    uiState.expandedTypeId &&
    !tripTypes.some((type) => type.id === uiState.expandedTypeId)
  ) {
    uiState.expandedTypeId = null;
  }
  if (
    uiState.editingTypeId &&
    !tripTypes.some((type) => type.id === uiState.editingTypeId)
  ) {
    uiState.editingTypeId = null;
  }

  let typesContent;
  if (tripTypes.length === 0) {
    typesContent = `
      <div class="empty-state">
        <div class="empty-icon">${icon("settings")}</div>
        <h3>還沒有旅程類型</h3>
        <p>建立一個類型（例如「潛水」「旅遊」），把常用物品加入預設清單，建立新旅程時就能一鍵帶入。</p>
      </div>`;
  } else {
    typesContent = `
      <div class="trip-type-list" role="list">
        ${tripTypes.map((type) => buildTripTypeCard(type)).join("")}
      </div>`;
  }

  app.innerHTML = `
    <div class="page-shell">
      <header class="app-header">
        <div class="brand-lockup">
          <div class="brand-mark">${icon("brand")}</div>
          <div>
            <p class="eyebrow">Travel Packing Companion</p>
            <h1>PackCheck</h1>
          </div>
        </div>
        <div class="header-chip">旅遊行李檢查</div>
      </header>
      <main class="page-main view-settings">
        <section class="content-panel">
          <div class="view-header">
            <div>
              <a href="#trips" class="btn-back">${icon("back")}返回旅程</a>
              <p class="section-kicker">Settings</p>
              <h2>旅程類型設定</h2>
            </div>
          </div>

          <p class="settings-hint">套用為預設項目，不會回頭修改現有旅程。</p>

          <form id="form-type-jump" class="jump-search-form surface-panel" novalidate>
            <div class="input-group input-group-grow">
              <label for="select-type-jump">類型查詢</label>
              <select id="select-type-jump" class="select-input"${tripTypes.length === 0 ? " disabled" : ""}>
                <option value="">${tripTypes.length === 0 ? "尚無可查詢類型" : "選擇現有類型"}</option>
                ${tripTypes
                  .map(
                    (type) =>
                      `<option value="${esc(type.id)}">${esc(type.name)}</option>`,
                  )
                  .join("")}
              </select>
            </div>
            <button type="submit" class="btn-primary"${tripTypes.length === 0 ? " disabled" : ""}>
              查詢
            </button>
          </form>

          <form id="form-add-trip-type" class="add-form surface-panel" novalidate>
            <div class="input-group">
              <label for="input-trip-type-name">類型名稱</label>
              <input
                type="text"
                id="input-trip-type-name"
                placeholder="輸入類型名稱（例如：潛水）"
                autocomplete="off"
                maxlength="100"
              />
            </div>
            <button type="submit" class="btn-primary">
              ${icon("plus")}
              <span>新增類型</span>
            </button>
          </form>
          <div id="trip-type-error" class="field-error hidden" role="alert"></div>

          ${typesContent}
        </section>
      </main>
    </div>`;

  bindSettingsActions(app);
  applyPendingCardFocus(app);
}

function buildTripTypeCard(type) {
  const expanded = uiState.expandedTypeId === type.id;
  const editing = uiState.editingTypeId === type.id;
  let presetContent;
  if (type.presetItems.length === 0) {
    presetContent = `
      <div class="empty-state empty-state-inline preset-empty">
        <p>還沒有預設物品，下方加入第一項。</p>
      </div>`;
  } else {
    const rows = type.presetItems
      .map((p) => buildPresetRow(type.id, p))
      .join("");
    presetContent = `
      <div class="item-table-wrap preset-table-wrap">
        <table class="item-table preset-table" aria-label="預設物品清單">
          <thead>
            <tr>
              <th class="col-name">物品</th>
              <th class="col-qty">數量</th>
              <th class="col-actions"></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  return `
    <div class="trip-type-card surface-panel${expanded ? " is-expanded" : ""}" data-type-id="${esc(type.id)}" role="listitem">
      <div class="trip-type-header">
        <div class="trip-type-header-main">
          <div class="trip-type-name-wrap">
            <span class="trip-tag">Trip Type</span>
            ${
              editing
                ? `<input type="text" class="edit-name-input js-edit-type-input" value="${esc(type.name)}" maxlength="100" aria-label="類型名稱" />`
                : `<span class="trip-type-name">${esc(type.name)}</span>`
            }
          </div>
        </div>
        <div class="action-group card-header-actions trip-type-header-actions">
          ${
            editing
              ? `
                <button class="btn-icon btn-icon-save js-save-type" data-id="${esc(type.id)}" aria-label="儲存類型 ${esc(type.name)}">
                  ${icon("check")}
                </button>
                <button class="btn-icon btn-icon-cancel js-cancel-type" data-id="${esc(type.id)}" aria-label="取消編輯類型 ${esc(type.name)}">
                  ${icon("x")}
                </button>`
              : `
                <button class="btn-icon btn-icon-edit js-edit-type" data-id="${esc(type.id)}" aria-label="編輯類型 ${esc(type.name)}">
                  ${icon("edit")}
                </button>
                <button class="btn-icon btn-icon-danger js-delete-type" data-id="${esc(type.id)}" aria-label="刪除類型 ${esc(type.name)}">
                  ${icon("trash")}
                </button>
                <button class="btn-icon js-toggle-type" data-id="${esc(type.id)}" aria-label="${expanded ? "收合" : "展開"}類型 ${esc(type.name)}" aria-expanded="${expanded}">
                  ${icon(expanded ? "chevronUp" : "chevronDown")}
                </button>`
          }
        </div>
      </div>

      ${
        expanded
          ? `
            <div class="trip-type-card-panel">
              <form class="add-form surface-panel preset-add-form js-add-preset-form" data-type-id="${esc(type.id)}" novalidate>
                <div class="input-group input-group-wide">
                  <label for="input-preset-name-${esc(type.id)}">預設物品名稱</label>
                  <input
                    type="text"
                    id="input-preset-name-${esc(type.id)}"
                    class="js-preset-name-input"
                    placeholder="物品名稱（例如：護照）"
                    autocomplete="off"
                    maxlength="100"
                  />
                </div>
                <div class="input-group input-group-compact">
                  <label for="input-preset-qty-${esc(type.id)}">數量</label>
                  <input
                    type="number"
                    id="input-preset-qty-${esc(type.id)}"
                    class="js-preset-qty-input"
                    placeholder="數量"
                    min="1"
                    value="1"
                  />
                </div>
                <button type="submit" class="btn-primary">
                  ${icon("plus")}
                  <span>新增物品</span>
                </button>
              </form>
              <div class="field-error hidden js-preset-error" data-type-id="${esc(type.id)}" role="alert"></div>
              ${presetContent}
            </div>`
          : ""
      }
    </div>`;
}

function buildPresetRow(typeId, preset) {
  return `
    <tr class="item-row preset-row" data-type-id="${esc(typeId)}" data-id="${esc(preset.id)}">
      <td class="col-name item-name">
        <div class="item-primary">
          <span class="item-field-label">物品</span>
          <div class="table-item-name">${esc(preset.name)}</div>
        </div>
      </td>
      <td class="col-qty item-qty">
        <div class="item-qty-block">
          <span class="item-field-label">數量</span>
          <span class="item-qty-value">${preset.qty}</span>
        </div>
      </td>
      <td class="col-actions">
        <div class="action-group">
          <button class="btn-icon btn-icon-edit js-edit-preset" data-type-id="${esc(typeId)}" data-id="${esc(preset.id)}" aria-label="編輯 ${esc(preset.name)}">
            ${icon("edit")}
            <span class="btn-icon-text">編輯</span>
          </button>
          <button class="btn-icon btn-icon-danger js-delete-preset" data-type-id="${esc(typeId)}" data-id="${esc(preset.id)}" aria-label="刪除 ${esc(preset.name)}">
            ${icon("trash")}
            <span class="btn-icon-text">刪除</span>
          </button>
        </div>
      </td>
    </tr>`;
}

function bindSettingsActions(app) {
  const rerender = () => renderSettings(document.getElementById("app"));

  document.getElementById("form-type-jump").addEventListener("submit", (e) => {
    e.preventDefault();
    const select = document.getElementById("select-type-jump");
    if (!select.value) return;
    uiState.editingTypeId = null;
    setExpandedCard("type", select.value);
    queueCardFocus("type", select.value);
    rerender();
  });

  // Add a new trip type
  document
    .getElementById("form-add-trip-type")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("input-trip-type-name");
      const errEl = document.getElementById("trip-type-error");
      const name = input.value.trim();
      if (!name) {
        errEl.textContent = "請輸入類型名稱。";
        errEl.classList.remove("hidden");
        input.focus();
        return;
      }
      errEl.classList.add("hidden");
      state.tripTypes.push({
        id: genId(),
        name,
        createdAt: new Date().toISOString(),
        presetItems: [],
      });
      saveState();
      input.value = "";
      uiState.editingTypeId = null;
      rerender();
    });

  app.querySelectorAll(".js-toggle-type").forEach((btn) => {
    btn.addEventListener("click", () => {
      uiState.editingTypeId = null;
      toggleExpandedCard("type", btn.dataset.id);
      rerender();
    });
  });

  // Edit trip-type name (inline)
  app.querySelectorAll(".js-edit-type").forEach((btn) => {
    btn.addEventListener("click", () => {
      const typeId = btn.dataset.id;
      uiState.editingTypeId = typeId;
      uiState.expandedTypeId = typeId;
      rerender();
    });
  });

  app.querySelectorAll(".js-save-type").forEach((btn) => {
    btn.addEventListener("click", () => {
      const typeId = btn.dataset.id;
      const type = state.tripTypes.find((t) => t.id === typeId);
      if (!type) return;
      const card = app.querySelector(
        `.trip-type-card[data-type-id="${esc(typeId)}"]`,
      );
      const input = card?.querySelector(".js-edit-type-input");
      if (!input) return;
      const newName = input.value.trim();
      if (!newName) {
        input.focus();
        return;
      }
      type.name = newName;
      uiState.editingTypeId = null;
      saveState();
      rerender();
    });
  });

  app.querySelectorAll(".js-cancel-type").forEach((btn) => {
    btn.addEventListener("click", () => {
      uiState.editingTypeId = null;
      rerender();
    });
  });

  // Delete trip type
  app.querySelectorAll(".js-delete-type").forEach((btn) => {
    btn.addEventListener("click", () => {
      const typeId = btn.dataset.id;
      const type = state.tripTypes.find((t) => t.id === typeId);
      if (!type) return;
      if (
        !confirm(
          `確定要刪除類型「${type.name}」？\n現有旅程不會受影響，但下次新增旅程將無此選項。`,
        )
      )
        return;
      state.tripTypes = state.tripTypes.filter((t) => t.id !== typeId);
      if (uiState.expandedTypeId === typeId) {
        uiState.expandedTypeId = null;
      }
      if (uiState.editingTypeId === typeId) {
        uiState.editingTypeId = null;
      }
      saveState();
      rerender();
    });
  });

  // Add preset item to a type
  app.querySelectorAll(".js-add-preset-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const typeId = form.dataset.typeId;
      const type = state.tripTypes.find((t) => t.id === typeId);
      if (!type) return;
      const nameInput = form.querySelector(".js-preset-name-input");
      const qtyInput = form.querySelector(".js-preset-qty-input");
      const errEl = app.querySelector(
        `.js-preset-error[data-type-id="${esc(typeId)}"]`,
      );
      const name = nameInput.value.trim();
      const qty = parseInt(qtyInput.value, 10);
      if (!name) {
        errEl.textContent = "請輸入物品名稱。";
        errEl.classList.remove("hidden");
        nameInput.focus();
        return;
      }
      if (!Number.isInteger(qty) || qty < 1) {
        errEl.textContent = "數量必須是正整數（≥ 1）。";
        errEl.classList.remove("hidden");
        qtyInput.focus();
        return;
      }
      errEl.classList.add("hidden");
      type.presetItems.push({ id: genId(), name, qty });
      uiState.expandedTypeId = typeId;
      saveState();
      rerender();
    });
  });

  // Delete preset item
  app.querySelectorAll(".js-delete-preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      const typeId = btn.dataset.typeId;
      const presetId = btn.dataset.id;
      const type = state.tripTypes.find((t) => t.id === typeId);
      if (!type) return;
      const preset = type.presetItems.find((p) => p.id === presetId);
      if (!preset) return;
      if (!confirm(`確定要刪除預設物品「${preset.name}」？`)) return;
      type.presetItems = type.presetItems.filter((p) => p.id !== presetId);
      uiState.expandedTypeId = typeId;
      saveState();
      rerender();
    });
  });

  // Inline-edit preset item (mirrors item-row edit pattern)
  app.querySelectorAll(".js-edit-preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      const typeId = btn.dataset.typeId;
      const presetId = btn.dataset.id;
      const type = state.tripTypes.find((t) => t.id === typeId);
      if (!type) return;
      const preset = type.presetItems.find((p) => p.id === presetId);
      if (!preset) return;
      const row = app.querySelector(
        `.preset-row[data-type-id="${esc(typeId)}"][data-id="${esc(presetId)}"]`,
      );
      if (!row) return;
      row.classList.add("is-editing");
      row.innerHTML = `
        <td class="col-name">
          <input type="text" class="edit-name-input" value="${esc(preset.name)}" maxlength="100" aria-label="物品名稱" />
        </td>
        <td class="col-qty">
          <input type="number" class="edit-qty-input" value="${preset.qty}" min="1" aria-label="數量" />
        </td>
        <td class="col-actions edit-actions-cell">
          <button class="btn-icon btn-icon-save js-save-preset-edit" aria-label="儲存 ${esc(preset.name)}">
            ${icon("check")}
          </button>
          <button class="btn-icon btn-icon-cancel js-cancel-preset-edit" aria-label="取消編輯 ${esc(preset.name)}">
            ${icon("x")}
          </button>
        </td>`;
      const nameInput = row.querySelector(".edit-name-input");
      nameInput.focus();
      nameInput.select();
      row
        .querySelector(".js-save-preset-edit")
        .addEventListener("click", () => {
          const newName = row.querySelector(".edit-name-input").value.trim();
          const newQty = parseInt(
            row.querySelector(".edit-qty-input").value,
            10,
          );
          if (!newName || !Number.isInteger(newQty) || newQty < 1) return;
          preset.name = newName;
          preset.qty = newQty;
          uiState.expandedTypeId = typeId;
          saveState();
          rerender();
        });
      row
        .querySelector(".js-cancel-preset-edit")
        .addEventListener("click", rerender);
    });
  });

  if (uiState.editingTypeId) {
    const input = app.querySelector(".js-edit-type-input");
    if (input) {
      input.focus();
      input.select();
    }
  }
}

// ─── Init (1.3) ───────────────────────────────────────────────────────────────

function init() {
  loadState(); // 2.1
  router(); // 3.1
}

init();
