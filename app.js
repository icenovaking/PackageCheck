/* =========================================================================
   PackCheck – Travel Packing Checklist
   Pure vanilla JS, localStorage persistence, hash-based SPA routing.
   ========================================================================= */

// ─── State (1.3) ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "packcheck_data";

/** @type {{ trips: Array<{id:string, name:string, createdAt:string, items:Array}> }} */
let state = { trips: [] };
let storageAvailable = true;

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

  // Build trip cards or empty state (8.3 summary line, 7.9 emoji)
  let tripsContent;
  if (trips.length === 0) {
    tripsContent = `
      <div class="empty-state">
        <span class="empty-icon">🗺️</span>
        <p>還沒有旅程，趕快建立第一個吧！</p>
      </div>`;
  } else {
    tripsContent = trips
      .map((trip) => {
        const total = trip.items.length;
        const dep = trip.items.filter((i) => i.departureChecked).length;
        const ret = trip.items.filter((i) => i.returnChecked).length;
        // 8.3 – summary line per trip
        const summary =
          total === 0
            ? "尚無物品"
            : `共 ${total} 件・✈️ 出發 ${dep}/${total}・🏠 回國 ${ret}/${total}`;
        return `
          <div class="trip-card" role="listitem">
            <div class="trip-card-stripe"></div>
            <a href="#trip/${esc(trip.id)}" class="trip-card-body" aria-label="前往旅程：${esc(trip.name)}">
              <span class="trip-name">${esc(trip.name)}</span>
              <span class="trip-summary">${summary}</span>
            </a>
            <button class="btn-icon btn-icon-danger js-delete-trip" data-id="${esc(trip.id)}" aria-label="刪除旅程 ${esc(trip.name)}">🗑️</button>
          </div>`;
      })
      .join("");
  }

  app.innerHTML = `
    <header class="app-header">
      <span class="header-icon">✈️</span>
      <h1>PackCheck</h1>
    </header>
    <main class="view-trips">
      <div class="view-header">
        <h2>我的旅程</h2>
      </div>

      <form id="form-add-trip" class="add-form" novalidate>
        <input
          type="text"
          id="input-trip-name"
          placeholder="輸入旅程名稱（例如：日本 2026）"
          autocomplete="off"
          maxlength="100"
        />
        <button type="submit" class="btn-primary">＋ 新增旅程</button>
      </form>
      <div id="trip-error" class="field-error hidden" role="alert"></div>

      <div class="trip-list" role="list">${tripsContent}</div>
    </main>`;

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

  // Build items table or empty state
  let itemsContent;
  if (trip.items.length === 0) {
    itemsContent = `<p class="empty-items">還沒有物品，新增你的第一件行李吧！🧳</p>`;
  } else {
    const rows = trip.items.map((item) => buildItemRow(item)).join("");
    itemsContent = `
      <div class="item-table-wrap">
        <table class="item-table" role="grid" aria-label="行李清單">
          <thead>
            <tr>
              <th class="col-name">物品</th>
              <th class="col-qty">數量</th>
              <th class="col-check">✈️ 出發</th>
              <th class="col-check">🏠 回國</th>
              <th class="col-actions"></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  app.innerHTML = `
    <header class="app-header">
      <span class="header-icon">✈️</span>
      <h1>PackCheck</h1>
    </header>
    <main class="view-detail">
      <div class="view-header">
        <a href="#trips" class="btn-back">← 返回旅程</a>
        <h2>${esc(trip.name)}</h2>
      </div>

      <form id="form-add-item" class="add-form" novalidate>
        <input
          type="text"
          id="input-item-name"
          placeholder="物品名稱（例如：護照）"
          autocomplete="off"
          maxlength="100"
        />
        <input
          type="number"
          id="input-item-qty"
          placeholder="數量"
          min="1"
          value="1"
        />
        <button type="submit" class="btn-primary">＋ 新增物品</button>
      </form>
      <div id="item-error" class="field-error hidden" role="alert"></div>

      <div class="item-list">${itemsContent}</div>
    </main>`;

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
      <td class="col-name item-name">${esc(item.name)}</td>
      <td class="col-qty item-qty">${item.qty}</td>
      <td class="col-check">
        <label class="checkbox-wrap" aria-label="出發確認：${esc(item.name)}">
          <input type="checkbox" class="js-cb-dep" data-id="${esc(item.id)}"${item.departureChecked ? " checked" : ""} />
          <span class="checkbox-custom"></span>
        </label>
      </td>
      <td class="col-check">
        <label class="checkbox-wrap" aria-label="回國確認：${esc(item.name)}">
          <input type="checkbox" class="js-cb-ret" data-id="${esc(item.id)}"${item.returnChecked ? " checked" : ""} />
          <span class="checkbox-custom"></span>
        </label>
      </td>
      <td class="col-actions">
        <button class="btn-icon btn-icon-edit js-edit-item" data-id="${esc(item.id)}" aria-label="編輯 ${esc(item.name)}">✏️</button>
        <button class="btn-icon btn-icon-danger js-delete-item" data-id="${esc(item.id)}" aria-label="刪除 ${esc(item.name)}">🗑️</button>
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
        <td class="col-name" colspan="2">
          <input type="text" class="edit-name-input" value="${esc(item.name)}" maxlength="100" />
        </td>
        <td class="col-qty">
          <input type="number" class="edit-qty-input" value="${item.qty}" min="1" />
        </td>
        <td class="col-actions edit-actions-cell" colspan="2">
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
