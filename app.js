/* =========================================================================
   PackCheck – Travel Packing Checklist
   Pure vanilla JS, localStorage persistence, hash-based SPA routing.
   ========================================================================= */

// ─── State (1.3) ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "packcheck_data";

/** @type {{ trips: Array<{id:string, name:string, createdAt:string, items:Array}> }} */
let state = { trips: [] };
let storageAvailable = true;

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
  plus: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <path d="M12 5v14M5 12h14"></path>
    </svg>`,
  back: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
      <path d="m10 6-6 6 6 6"></path>
      <path d="M4 12h16"></path>
    </svg>`,
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
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.trips)) {
        state = parsed;
      } else {
        throw new Error("unexpected shape");
      }
    }
  } catch (_) {
    state = { trips: [] };
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

// ─── Router (3.1 / 3.2 / 3.3) ────────────────────────────────────────────────

function router() {
  const hash = location.hash;
  const app = document.getElementById("app");

  if (!hash || hash === "#trips") {
    renderTripList(app);
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
  const totalItems = trips.reduce((sum, trip) => sum + trip.items.length, 0);
  const totalDeparture = trips.reduce(
    (sum, trip) =>
      sum + trip.items.filter((item) => item.departureChecked).length,
    0,
  );
  const totalReturn = trips.reduce(
    (sum, trip) => sum + trip.items.filter((item) => item.returnChecked).length,
    0,
  );

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
    tripsContent = trips
      .map((trip) => {
        const total = trip.items.length;
        const dep = trip.items.filter((i) => i.departureChecked).length;
        const ret = trip.items.filter((i) => i.returnChecked).length;
        const progressSummary =
          total === 0 ? "尚未建立任何行李項目" : `${total} 件物品已加入清單`;
        return `
          <div class="trip-card" role="listitem">
            <a href="#trip/${esc(trip.id)}" class="trip-card-body" aria-label="前往旅程：${esc(trip.name)}">
              <div class="trip-card-top">
                <span class="trip-tag">Trip Plan</span>
                <span class="trip-summary">${progressSummary}</span>
              </div>
              <span class="trip-name">${esc(trip.name)}</span>
              <div class="trip-progress">
                <span class="progress-pill progress-pill-departure">${icon("departure")}出發 ${dep}/${total}</span>
                <span class="progress-pill progress-pill-return">${icon("arrival")}回程 ${ret}/${total}</span>
              </div>
            </a>
            <button class="btn-icon btn-icon-danger js-delete-trip" data-id="${esc(trip.id)}" aria-label="刪除旅程 ${esc(trip.name)}">
              ${icon("trash")}
            </button>
          </div>`;
      })
      .join("");
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
          </div>

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

  // Bind: add trip (4.2)
  document.getElementById("form-add-trip").addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("input-trip-name");
    const errEl = document.getElementById("trip-error");
    const name = nameInput.value.trim();

    if (!name) {
      errEl.textContent = "請輸入旅程名稱。";
      errEl.classList.remove("hidden");
      nameInput.focus();
      return;
    }

    errEl.classList.add("hidden");
    state.trips.push({
      id: genId(),
      name,
      createdAt: new Date().toISOString(),
      items: [],
    });
    saveState(); // 2.3
    nameInput.value = "";
    renderTripList(document.getElementById("app"));
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
      saveState(); // 2.3
      renderTripList(document.getElementById("app"));
    });
  });
}

// ─── Trip Detail View (5.1 – 5.6) ────────────────────────────────────────────

function renderTripDetail(app, tripId) {
  const trip = state.trips.find((t) => t.id === tripId);
  if (!trip) {
    location.replace("#trips");
    return;
  }

  const totalItems = trip.items.length;
  const departureCount = trip.items.filter(
    (item) => item.departureChecked,
  ).length;
  const returnCount = trip.items.filter((item) => item.returnChecked).length;

  // Build items table or empty state
  let itemsContent;
  if (trip.items.length === 0) {
    itemsContent = `
      <div class="empty-state empty-state-inline">
        <div class="empty-icon">${icon("suitcase")}</div>
        <h3>還沒有物品</h3>
        <p>把護照、充電器、衣物或回程伴手禮需求都先列進來，之後勾選會更快。</p>
      </div>`;
  } else {
    const rows = trip.items.map((item) => buildItemRow(item)).join("");
    itemsContent = `
      <div class="item-table-wrap">
        <table class="item-table" role="grid" aria-label="行李清單">
          <thead>
            <tr>
              <th class="col-name">物品</th>
              <th class="col-qty">數量</th>
              <th class="col-check">出發確認</th>
              <th class="col-check">回程確認</th>
              <th class="col-actions"></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
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
      <main class="page-main view-detail">
        <section class="content-panel">
          <div class="view-header">
            <div>
              <a href="#trips" class="btn-back">${icon("back")}返回旅程</a>
              <p class="section-kicker">Packing Manifest</p>
              <h2>${esc(trip.name)}</h2>
            </div>
          </div>

          <form id="form-add-item" class="add-form surface-panel" novalidate>
            <div class="input-group input-group-wide">
              <label for="input-item-name">物品名稱</label>
              <input
                type="text"
                id="input-item-name"
                placeholder="物品名稱（例如：護照）"
                autocomplete="off"
                maxlength="100"
              />
            </div>
            <div class="input-group input-group-compact">
              <label for="input-item-qty">數量</label>
              <input
                type="number"
                id="input-item-qty"
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
          <div id="item-error" class="field-error hidden" role="alert"></div>

          <div class="item-list">${itemsContent}</div>
        </section>
      </main>
    </div>`;

  // Bind: add item (5.2)
  document.getElementById("form-add-item").addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("input-item-name");
    const qtyInput = document.getElementById("input-item-qty");
    const errEl = document.getElementById("item-error");
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
    saveState(); // 2.3
    nameInput.value = "";
    qtyInput.value = "1";
    renderTripDetail(document.getElementById("app"), tripId);
  });

  // Bind: checkbox toggles, edit, delete
  bindItemActions(app, trip, tripId);
}

/** Build a single item <tr> HTML string. */
function buildItemRow(item) {
  const fullyChecked = item.departureChecked && item.returnChecked;
  return `
    <tr class="item-row${fullyChecked ? " fully-checked" : ""}" data-id="${esc(item.id)}">
      <td class="col-name item-name" data-label="物品">
        <div class="table-item-name">${esc(item.name)}</div>
      </td>
      <td class="col-qty item-qty" data-label="數量">${item.qty}</td>
      <td class="col-check" data-label="出發確認">
        <label class="checkbox-wrap" aria-label="出發確認：${esc(item.name)}">
          <input type="checkbox" class="js-cb-dep" data-id="${esc(item.id)}"${item.departureChecked ? " checked" : ""} />
          <span class="checkbox-custom"></span>
        </label>
      </td>
      <td class="col-check" data-label="回程確認">
        <label class="checkbox-wrap" aria-label="回國確認：${esc(item.name)}">
          <input type="checkbox" class="js-cb-ret" data-id="${esc(item.id)}"${item.returnChecked ? " checked" : ""} />
          <span class="checkbox-custom"></span>
        </label>
      </td>
      <td class="col-actions" data-label="操作">
        <div class="action-group">
          <button class="btn-icon btn-icon-edit js-edit-item" data-id="${esc(item.id)}" aria-label="編輯 ${esc(item.name)}">
            ${icon("edit")}
          </button>
          <button class="btn-icon btn-icon-danger js-delete-item" data-id="${esc(item.id)}" aria-label="刪除 ${esc(item.name)}">
            ${icon("trash")}
          </button>
        </div>
      </td>
    </tr>`;
}

/** Bind all item-level interactions. */
function bindItemActions(app, trip, tripId) {
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
      renderTripDetail(document.getElementById("app"), tripId);
    });
  });

  // 5.5 – inline edit: switch row to edit mode
  app.querySelectorAll(".js-edit-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = trip.items.find((i) => i.id === btn.dataset.id);
      if (!item) return;
      const row = app.querySelector(`.item-row[data-id="${esc(item.id)}"]`);
      if (!row) return;

      row.innerHTML = `
        <td class="col-name" data-label="物品" colspan="2">
          <input type="text" class="edit-name-input" value="${esc(item.name)}" maxlength="100" />
        </td>
        <td class="col-qty" data-label="數量">
          <input type="number" class="edit-qty-input" value="${item.qty}" min="1" />
        </td>
        <td class="col-actions edit-actions-cell" data-label="操作" colspan="2">
          <button class="btn-primary btn-sm js-save-edit">儲存</button>
          <button class="btn-secondary btn-sm js-cancel-edit">取消</button>
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
        renderTripDetail(document.getElementById("app"), tripId);
      });

      row.querySelector(".js-cancel-edit").addEventListener("click", () => {
        renderTripDetail(document.getElementById("app"), tripId);
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

// ─── Init (1.3) ───────────────────────────────────────────────────────────────

function init() {
  loadState(); // 2.1
  router(); // 3.1
}

init();
