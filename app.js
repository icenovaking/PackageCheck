/* =========================================================================
   PackCheck – Travel Packing Checklist
   Pure vanilla JS, localStorage persistence, hash-based SPA routing.
   ========================================================================= */

// ─── State (1.3) ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "packcheck_data";
const DATA_EXPORT_FORMAT = "packcheck-data";
const DATA_EXPORT_VERSION = 2;

/** @type {{ trips: Array<{id:string, name:string, createdAt:string, items:Array, typeId?:string|null, typeIds?:string[]|null, typeDisplay?:string|null}>, tripTypes: Array<{id:string, name:string, createdAt:string, presetItems:Array<{id:string,name:string,qty:number}>}>, commonItems: Array<{id:string,name:string}> }} */
let state = { trips: [], tripTypes: [], commonItems: [] };
let storageAvailable = true;
const uiState = {
  expandedTripId: null,
  expandedTypeId: null,
  editingTypeId: null,
  editingTripId: null,
  editingCommonItemId: null,
  pendingCardFocus: null,
};

function buildExportPayload(currentState) {
  return {
    format: DATA_EXPORT_FORMAT,
    version: DATA_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      trips: currentState.trips,
      tripTypes: currentState.tripTypes,
      commonItems: Array.isArray(currentState.commonItems)
        ? currentState.commonItems
        : [],
    },
  };
}

function formatExportTimestamp(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}-${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`;
}

function downloadExportPayload(payload, dependencies = {}) {
  const BlobCtor = dependencies.BlobCtor || Blob;
  const urlApi = dependencies.urlApi || URL;
  const documentApi = dependencies.documentApi || document;
  const now = dependencies.now || (() => new Date());
  const blob = new BlobCtor([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const objectUrl = urlApi.createObjectURL(blob);
  const link = documentApi.createElement("a");

  link.href = objectUrl;
  link.download = `packcheck-export-${formatExportTimestamp(now())}.json`;
  try {
    link.click();
  } finally {
    urlApi.revokeObjectURL(objectUrl);
  }
}

function importValidationError(message) {
  throw new Error(`匯入資料無效：${message}`);
}

function requireImportString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    importValidationError(`${label}必須是非空字串。`);
  }
}

function requireImportArray(value, label) {
  if (!Array.isArray(value)) {
    importValidationError(`${label}必須是陣列。`);
  }
}

function requireImportQuantity(value, label) {
  if (!Number.isInteger(value) || value < 1) {
    importValidationError(`${label}（數量）必須是正整數。`);
  }
}

function requireUniqueImportIds(records, label) {
  const ids = new Set();
  records.forEach((record, index) => {
    requireImportString(record?.id, `${label}[${index}].id`);
    if (ids.has(record.id)) {
      importValidationError(`${label}包含重複的 id。`);
    }
    ids.add(record.id);
  });
  return ids;
}

function requireUniqueImportNames(records, label) {
  const names = new Set();
  records.forEach((record, index) => {
    requireImportString(record?.name, `${label}[${index}].name`);
    const normalizedName = normalizeItemName(record.name);
    if (names.has(normalizedName)) {
      importValidationError(`${label}包含重複的名稱。`);
    }
    names.add(normalizedName);
  });
  return names;
}

function validateImportCommonItem(item, path) {
  requireImportString(item?.id, `${path}.id`);
  requireImportString(item?.name, `${path}.name`);
}

function validateImportPresetItem(item, path) {
  requireImportString(item?.id, `${path}.id`);
  requireImportString(item?.name, `${path}.name`);
  requireImportQuantity(item?.qty, `${path}.qty`);
}

function validateImportTripType(type, index) {
  const path = `data.tripTypes[${index}]`;
  requireImportString(type?.name, `${path}.name`);
  requireImportString(type?.createdAt, `${path}.createdAt`);
  if (Number.isNaN(Date.parse(type.createdAt))) {
    importValidationError(`${path}.createdAt 必須是有效的 ISO 日期。`);
  }
  requireImportArray(type?.presetItems, `${path}.presetItems`);
  requireUniqueImportIds(type.presetItems, `${path}.presetItems`);
  type.presetItems.forEach((item, itemIndex) => {
    validateImportPresetItem(item, `${path}.presetItems[${itemIndex}]`);
  });
}

function validateImportItem(item, path) {
  requireImportString(item?.id, `${path}.id`);
  requireImportString(item?.name, `${path}.name`);
  requireImportQuantity(item?.qty, `${path}.qty`);
  if (
    typeof item?.departureChecked !== "boolean" ||
    typeof item?.returnChecked !== "boolean"
  ) {
    importValidationError(`${path}的勾選狀態必須是布林值。`);
  }
}

function validateImportTrip(trip, index, availableTypeIds) {
  const path = `data.trips[${index}]`;
  requireImportString(trip?.name, `${path}.name`);
  requireImportString(trip?.createdAt, `${path}.createdAt`);
  if (Number.isNaN(Date.parse(trip.createdAt))) {
    importValidationError(`${path}.createdAt 必須是有效的 ISO 日期。`);
  }
  requireImportArray(trip?.items, `${path}.items`);
  requireUniqueImportIds(trip.items, `${path}.items`);
  trip.items.forEach((item, itemIndex) => {
    validateImportItem(item, `${path}.items[${itemIndex}]`);
  });

  if (trip.typeIds !== null && !Array.isArray(trip.typeIds)) {
    importValidationError(`${path}.typeIds 必須是 null 或陣列。`);
  }
  if (Array.isArray(trip.typeIds)) {
    const typeIds = new Set();
    trip.typeIds.forEach((typeId, typeIndex) => {
      requireImportString(typeId, `${path}.typeIds[${typeIndex}]`);
      if (typeIds.has(typeId)) {
        importValidationError(`${path}.typeIds 包含重複的類型 id。`);
      }
      if (!availableTypeIds.has(typeId)) {
        importValidationError(`${path}.typeIds 包含無法解析的類型參照。`);
      }
      typeIds.add(typeId);
    });
  }
  if (trip.typeDisplay !== null) {
    requireImportString(trip.typeDisplay, `${path}.typeDisplay`);
  }
}

function normalizeImportPayload(payload) {
  return {
    format: payload.format,
    version: payload.version,
    exportedAt: payload.exportedAt,
    data: {
      tripTypes: payload.data.tripTypes.map((type) => ({
        id: type.id,
        name: type.name,
        createdAt: type.createdAt,
        presetItems: type.presetItems.map((item) => ({
          id: item.id,
          name: item.name,
          qty: item.qty,
        })),
      })),
      trips: payload.data.trips.map((trip) => ({
        id: trip.id,
        name: trip.name,
        createdAt: trip.createdAt,
        typeIds: trip.typeIds,
        typeDisplay: trip.typeDisplay,
        items: trip.items.map((item) => ({
          id: item.id,
          name: item.name,
          qty: item.qty,
          departureChecked: item.departureChecked,
          returnChecked: item.returnChecked,
        })),
      })),
      commonItems: payload.data.commonItems.map((item) => ({
        id: item.id,
        name: item.name,
      })),
    },
  };
}

function parseImportPayload(rawText, currentState = { trips: [], tripTypes: [] }) {
  let payload;
  try {
    payload = JSON.parse(rawText);
  } catch (_) {
    importValidationError("檔案不是有效 JSON。 ");
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    importValidationError("根資料必須是物件。 ");
  }
  if (payload.format !== DATA_EXPORT_FORMAT) {
    importValidationError("格式不受支援。 ");
  }
  if (payload.version !== 1 && payload.version !== DATA_EXPORT_VERSION) {
    importValidationError("版本不受支援。 ");
  }
  requireImportString(payload.exportedAt, "exportedAt");
  if (Number.isNaN(Date.parse(payload.exportedAt))) {
    importValidationError("exportedAt 必須是有效的 ISO 日期。 ");
  }
  requireImportArray(payload.data?.tripTypes, "data.tripTypes");
  requireImportArray(payload.data?.trips, "data.trips");
  const commonItems =
    payload.version === DATA_EXPORT_VERSION
      ? payload.data?.commonItems
      : [];
  requireImportArray(commonItems, "data.commonItems");

  const importedTypeIds = requireUniqueImportIds(
    payload.data.tripTypes,
    "data.tripTypes",
  );
  const localTypeIds = new Set(
    (Array.isArray(currentState.tripTypes) ? currentState.tripTypes : [])
      .map((type) => type?.id)
      .filter((id) => typeof id === "string" && id.length > 0),
  );
  const availableTypeIds = new Set([...localTypeIds, ...importedTypeIds]);

  payload.data.tripTypes.forEach((type, index) => {
    validateImportTripType(type, index);
  });
  requireUniqueImportIds(commonItems, "data.commonItems");
  requireUniqueImportNames(commonItems, "data.commonItems");
  commonItems.forEach((item, index) => {
    validateImportCommonItem(item, `data.commonItems[${index}]`);
  });
  requireUniqueImportIds(payload.data.trips, "data.trips");
  payload.data.trips.forEach((trip, index) => {
    validateImportTrip(trip, index, availableTypeIds);
  });

  return normalizeImportPayload({
    ...payload,
    data: {
      ...payload.data,
      commonItems,
    },
  });
}

function mergeImportedState(currentState, importedPayload) {
  const localTripTypes = Array.isArray(currentState.tripTypes)
    ? currentState.tripTypes
    : [];
  const localTrips = Array.isArray(currentState.trips) ? currentState.trips : [];
  const localCommonItems = Array.isArray(currentState.commonItems)
    ? currentState.commonItems
    : [];
  const localTypeIds = new Set(localTripTypes.map((type) => type.id));
  const localTripIds = new Set(localTrips.map((trip) => trip.id));
  const localCommonItemIds = new Set(localCommonItems.map((item) => item.id));
  const localCommonItemNames = new Set(
    localCommonItems.map((item) => normalizeItemName(item.name)),
  );
  const importedTripTypes = importedPayload.data.tripTypes;
  const importedTrips = importedPayload.data.trips;
  const importedCommonItems = importedPayload.data.commonItems;
  const tripTypes = [...localTripTypes];
  const trips = [...localTrips];
  const commonItems = [...localCommonItems];
  let skippedTripTypes = 0;
  let skippedTrips = 0;
  let skippedCommonItems = 0;

  importedTripTypes.forEach((type) => {
    if (localTypeIds.has(type.id)) {
      skippedTripTypes += 1;
      return;
    }
    localTypeIds.add(type.id);
    tripTypes.push(type);
  });

  importedTrips.forEach((trip) => {
    if (localTripIds.has(trip.id)) {
      skippedTrips += 1;
      return;
    }
    localTripIds.add(trip.id);
    trips.push(trip);
  });

  importedCommonItems.forEach((item) => {
    const normalizedName = normalizeItemName(item.name);
    if (
      localCommonItemIds.has(item.id) ||
      localCommonItemNames.has(normalizedName)
    ) {
      skippedCommonItems += 1;
      return;
    }
    localCommonItemIds.add(item.id);
    localCommonItemNames.add(normalizedName);
    commonItems.push(item);
  });

  return {
    state: { trips, tripTypes, commonItems },
    addedTrips: importedTrips.length - skippedTrips,
    addedTripTypes: importedTripTypes.length - skippedTripTypes,
    addedCommonItems: importedCommonItems.length - skippedCommonItems,
    skippedTrips,
    skippedTripTypes,
    skippedCommonItems,
  };
}

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
  commonItems: [],
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
      if (!Array.isArray(state.commonItems)) {
        state.commonItems = [];
      }
      // Migrate legacy typeId to typeIds + typeDisplay
      migrateTrips();
    } else {
      throw new Error("unexpected shape");
    }
  } catch (_) {
    state = { trips: [], tripTypes: [], commonItems: [] };
    showStorageWarning("偵測到損毀的儲存資料，已重設為空白清單。");
  }
}

/** Write current state to localStorage. Called after every mutation (2.3). */
function saveState() {
  if (!storageAvailable) return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (_) {
    showStorageWarning("無法儲存資料，儲存空間可能已滿。");
    return false;
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

function buildDataTransferControlsMarkup() {
  return `
    <div class="data-transfer-actions" aria-label="資料匯入匯出">
      <button type="button" id="btn-export-data" class="header-chip data-transfer-button">
        匯出設定
      </button>
      <button type="button" id="btn-import-data" class="header-chip data-transfer-button">
        匯入設定
      </button>
      <input
        type="file"
        id="input-import-data"
        class="hidden"
        accept=".json,application/json"
        aria-label="選擇要匯入的 JSON 設定檔"
      />
      <div id="data-transfer-status" class="data-transfer-status hidden" role="status" aria-live="polite"></div>
    </div>`;
}

function setDataTransferStatus(app, message, tone = "success") {
  const status = app.querySelector("#data-transfer-status");
  if (!status) return;
  status.textContent = message;
  status.classList.remove("hidden", "is-success", "is-error");
  status.classList.add(tone === "error" ? "is-error" : "is-success");
}

function formatDataTransferImportResult(result) {
  return `匯入完成：新增 ${result.addedTrips} 個旅程、${result.addedTripTypes} 個旅程類型、${result.addedCommonItems} 個常用物品；略過 ${result.skippedTrips} 個重複旅程、${result.skippedTripTypes} 個重複旅程類型、${result.skippedCommonItems} 個重複常用物品。`;
}

async function importDataFile(file, app) {
  if (!file) return;

  try {
    if (typeof file.text !== "function") {
      throw new Error("無法讀取選取的檔案。 ");
    }
    const importedPayload = parseImportPayload(await file.text(), state);
    const previousState = state;
    const mergeResult = mergeImportedState(state, importedPayload);
    state = mergeResult.state;

    if (!saveState()) {
      state = previousState;
      setDataTransferStatus(app, "匯入內容無法儲存，請確認瀏覽器儲存空間。", "error");
      return;
    }

    renderTripList(app);
    setDataTransferStatus(
      app,
      formatDataTransferImportResult(mergeResult),
      "success",
    );
  } catch (error) {
    setDataTransferStatus(
      app,
      error instanceof Error ? error.message : "匯入失敗，請確認 JSON 檔案格式。",
      "error",
    );
  } finally {
    const importInput = app.querySelector("#input-import-data");
    if (importInput) importInput.value = "";
  }
}

function bindDataTransferActions(app) {
  const exportButton = app.querySelector("#btn-export-data");
  const importButton = app.querySelector("#btn-import-data");
  const importInput = app.querySelector("#input-import-data");

  exportButton?.addEventListener("click", () => {
    try {
      downloadExportPayload(buildExportPayload(state));
      setDataTransferStatus(app, "設定已匯出。", "success");
    } catch (_) {
      setDataTransferStatus(app, "匯出失敗，請稍後再試。", "error");
    }
  });

  importButton?.addEventListener("click", () => {
    importInput?.click();
  });

  importInput?.addEventListener("change", () => {
    void importDataFile(importInput.files?.[0], app);
  });
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

function parseAllowedQuantity(rawValue, currentQuantity = null) {
  const normalizedValue = String(rawValue).trim();
  if (!/^\d+$/.test(normalizedValue)) return null;

  const quantity = Number(normalizedValue);
  if (!Number.isSafeInteger(quantity) || String(quantity) !== normalizedValue) {
    return null;
  }
  if (quantity >= 1 && quantity <= 10) return quantity;

  return Number.isSafeInteger(currentQuantity) &&
    currentQuantity > 10 &&
    quantity === currentQuantity
    ? quantity
    : null;
}

function buildQuantityOptions(selectedQuantity = 1) {
  const selected =
    Number.isSafeInteger(selectedQuantity) && selectedQuantity > 10
      ? selectedQuantity
      : parseAllowedQuantity(selectedQuantity) || 1;
  const quantities = Array.from({ length: 10 }, (_, index) => index + 1);
  if (selected > 10) quantities.push(selected);

  return quantities
    .map(
      (quantity) =>
        `<option value="${quantity}"${quantity === selected ? " selected" : ""}>${quantity}</option>`,
    )
    .join("");
}

function buildTripPrintManifest(trip) {
  const items = Array.isArray(trip.items) ? trip.items : [];
  const content =
    items.length === 0
      ? '<p class="trip-print-empty">目前沒有可列印的物品。</p>'
      : `
        <table class="trip-print-table" aria-label="旅程物品列印清單">
          <thead>
            <tr>
              <th class="trip-print-col-name">物品</th>
              <th class="trip-print-col-qty">數量</th>
              <th class="trip-print-col-check">出發</th>
              <th class="trip-print-col-check">回程</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
                  <tr>
                    <td class="trip-print-item-name">${esc(item.name)}</td>
                    <td class="trip-print-item-qty">${esc(item.qty)}</td>
                    <td class="trip-print-check-cell"><span class="trip-print-checkbox" aria-label="空白勾選框"></span></td>
                    <td class="trip-print-check-cell"><span class="trip-print-checkbox" aria-label="空白勾選框"></span></td>
                  </tr>`,
              )
              .join("")}
          </tbody>
        </table>`;

  return `
    <section class="trip-print-manifest" aria-label="旅程物品列印清單">
      <header class="trip-print-header">
        <p class="trip-print-kicker">Packing Manifest</p>
        <h1 class="trip-print-title">${esc(trip.name)}</h1>
      </header>
      ${content}
    </section>`;
}

function buildTripManager(trip, view) {
  const scopeId = `${view}-${trip.id}`;
  return `
    <form class="add-form surface-panel js-add-item-form" data-trip-id="${esc(trip.id)}" data-view="${view}" novalidate>
      ${buildItemSourceMarkup({
        scopeId,
        manualInputClass: "js-item-name-input",
        selectClass: "js-common-item-select",
      })}
      <div class="input-group input-group-compact">
        <label for="input-item-qty-${esc(scopeId)}">數量</label>
        <select
          id="input-item-qty-${esc(scopeId)}"
          class="select-input quantity-select js-item-qty-input"
        >
          ${buildQuantityOptions()}
        </select>
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

function buildItemSourceMarkup({
  scopeId,
  manualInputClass = "",
  selectClass = "",
}) {
  const commonItems = Array.isArray(state.commonItems) ? state.commonItems : [];
  const manualId = `input-item-name-${scopeId}`;
  const selectId = `select-common-item-${scopeId}`;

  return `
    <div class="input-group input-group-wide item-source-manual">
      <label for="${esc(manualId)}">手動輸入物品</label>
      <input
        type="text"
        id="${esc(manualId)}"
        class="js-manual-item-input ${esc(manualInputClass)}"
        placeholder="物品名稱（例如：護照）"
        autocomplete="off"
        maxlength="100"
      />
    </div>
    <div class="input-group input-group-wide item-source-common">
      <label for="${esc(selectId)}">選擇常用物品</label>
      <select
        id="${esc(selectId)}"
        class="select-input js-common-item-select ${esc(selectClass)}"${commonItems.length === 0 ? " disabled" : ""}
      >
        <option value="">${commonItems.length === 0 ? "尚無常用物品" : "選擇常用物品"}</option>
        ${commonItems
          .map(
            (item) =>
              `<option value="${esc(item.id)}">${esc(item.name)}</option>`,
          )
          .join("")}
      </select>
      <span class="item-source-hint">手動輸入與下拉選單二選一</span>
    </div>`;
}

function resolveItemSource({ manualName = "", commonItemId = "" }, commonItems) {
  const name = String(manualName).trim();
  const selectedId = String(commonItemId).trim();

  if (name && selectedId) {
    return { error: "手動輸入與常用物品只能選一種。" };
  }
  if (!name && !selectedId) {
    return { error: "請輸入物品名稱或選擇常用物品。" };
  }
  if (selectedId) {
    const selectedItem = (Array.isArray(commonItems) ? commonItems : []).find(
      (item) => item.id === selectedId,
    );
    if (!selectedItem) {
      return { error: "所選常用物品不存在，請重新選擇。" };
    }
    return { name: selectedItem.name };
  }
  return { name };
}

function bindMutuallyExclusiveItemSource(form) {
  const manualInput = form.querySelector(".js-manual-item-input");
  const commonSelect = form.querySelector(".js-common-item-select");
  if (!manualInput || !commonSelect) return;

  const syncState = () => {
    const hasManualName = manualInput.value.trim() !== "";
    const hasCommonItem = commonSelect.value !== "";

    if (hasManualName) {
      commonSelect.value = "";
      commonSelect.disabled = true;
      manualInput.disabled = false;
      return;
    }
    if (hasCommonItem) {
      manualInput.value = "";
      manualInput.disabled = true;
      commonSelect.disabled = false;
      return;
    }
    manualInput.disabled = false;
    commonSelect.disabled =
      !Array.isArray(state.commonItems) || state.commonItems.length === 0;
  };

  manualInput.addEventListener("input", syncState);
  commonSelect.addEventListener("change", syncState);
  syncState();
}

function bindTripItemForms(app) {
  app.querySelectorAll(".js-add-item-form").forEach((form) => {
    bindMutuallyExclusiveItemSource(form);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const tripId = form.dataset.tripId;
      const view = form.dataset.view || "detail";
      const trip = state.trips.find((t) => t.id === tripId);
      if (!trip) return;

      const nameInput = form.querySelector(".js-item-name-input");
      const commonSelect = form.querySelector(".js-common-item-select");
      const qtyInput = form.querySelector(".js-item-qty-input");
      const errEl = app.querySelector(
        `.js-item-error[data-trip-id="${esc(tripId)}"][data-view="${esc(view)}"]`,
      );
      const source = resolveItemSource(
        {
          manualName: nameInput.value,
          commonItemId: commonSelect?.value,
        },
        state.commonItems,
      );
      const qty = parseAllowedQuantity(qtyInput.value);

      if (source.error) {
        errEl.textContent = source.error;
        errEl.classList.remove("hidden");
        (nameInput.value.trim() ? commonSelect : nameInput)?.focus();
        return;
      }

      const name = source.name;

      if (hasDuplicateItemName(trip.items, name)) {
        errEl.textContent = "這個旅程已有相同名稱的物品。";
        errEl.classList.remove("hidden");
        nameInput.focus();
        return;
      }

      if (qty === null) {
        errEl.textContent = "數量必須選擇 1 至 10。";
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
 * Normalize a user-facing item name for same-list duplicate checks.
 * Outer whitespace and letter case are insignificant; internal whitespace and
 * punctuation remain part of the name.
 */
function normalizeItemName(name) {
  return String(name).trim().toLocaleLowerCase();
}

function hasDuplicateItemName(records, name, excludedId = null) {
  const normalizedName = normalizeItemName(name);
  return records.some(
    (record) =>
      record.id !== excludedId && normalizeItemName(record.name) === normalizedName,
  );
}

function isSameItem(name1, name2) {
  return normalizeItemName(name1) === normalizeItemName(name2);
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
  } else if (hash === "#common-items") {
    renderCommonItems(app);
  } else if (hash.startsWith("#trip/")) {
    const id = hash.slice("#trip/".length);
    renderTripDetail(app, id);
  } else {
    // Unknown route → redirect home (3.3 handles back button naturally via hash)
    location.replace("#trips");
  }
}

function buildSettingsNavigationMarkup(activeRoute = "") {
  const link = (href, label) =>
    `<a href="${href}" class="header-chip${activeRoute === href ? " is-active" : ""}"${activeRoute === href ? ' aria-current="page"' : ""}>${label}</a>`;

  return `<nav class="settings-nav" aria-label="設定頁面">${link("#settings", "類型設定")}${link("#common-items", "常用物品")}</nav>`;
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
        ${buildDataTransferControlsMarkup()}
      </header>
      <main class="page-main view-trips">
        <section class="content-panel">
          <div class="view-header">
            <div>
              <p class="section-kicker">My Trips</p>
              <h2>我的旅程</h2>
            </div>
            ${buildSettingsNavigationMarkup()}
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

  bindDataTransferActions(app);

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
            <button type="button" id="btn-print-trip" class="btn-secondary btn-print-trip">
              匯出 PDF
            </button>
          </div>

          <div class="trip-detail-interactive">
            ${buildTripManager(trip, "detail")}
          </div>
          ${buildTripPrintManifest(trip)}
        </section>
      </main>
    </div>`;

  bindTripItemForms(app);
  bindTripPrintAction(app);
  bindItemActions(app, trip, () => {
    renderTripDetail(document.getElementById("app"), tripId);
  });
}

function bindTripPrintAction(app) {
  const printButton = app.querySelector("#btn-print-trip");
  printButton?.addEventListener("click", () => {
    if (typeof window.print === "function") {
      window.print();
    }
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

function buildItemEditRowMarkup(item) {
  return `
    <td class="col-name">
      <input type="text" class="edit-name-input" value="${esc(item.name)}" maxlength="100" aria-label="物品名稱" />
    </td>
    <td class="col-qty">
      <select class="select-input quantity-select edit-qty-input" aria-label="數量">
        ${buildQuantityOptions(item.qty)}
      </select>
    </td>
    <td class="col-check edit-placeholder" aria-hidden="true"></td>
    <td class="col-check edit-placeholder" aria-hidden="true"></td>
    <td class="col-actions edit-actions-cell">
      <div class="action-group">
        <button class="btn-icon btn-icon-save js-save-edit" aria-label="儲存 ${esc(item.name)}">
          ${icon("check")}
        </button>
        <button class="btn-icon btn-icon-cancel js-cancel-edit" aria-label="取消編輯 ${esc(item.name)}">
          ${icon("x")}
        </button>
      </div>
    </td>`;
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

      row.innerHTML = buildItemEditRowMarkup(item);

      const nameInput = row.querySelector(".edit-name-input");
      nameInput.focus();
      nameInput.select();

      row.querySelector(".js-save-edit").addEventListener("click", () => {
        const newName = row.querySelector(".edit-name-input").value.trim();
        const newQty = parseAllowedQuantity(
          row.querySelector(".edit-qty-input").value,
          item.qty,
        );
        if (!newName || newQty === null) return;
        if (hasDuplicateItemName(trip.items, newName, item.id)) {
          window.alert("這個旅程已有相同名稱的物品。");
          row.querySelector(".edit-name-input").focus();
          return;
        }
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

// ─── Settings View — Common Items ────────────────────────────────────────────

function renderCommonItems(app) {
  const { commonItems } = state;
  if (
    uiState.editingCommonItemId &&
    !commonItems.some((item) => item.id === uiState.editingCommonItemId)
  ) {
    uiState.editingCommonItemId = null;
  }

  const itemsContent =
    commonItems.length === 0
      ? `
        <div class="empty-state">
          <div class="empty-icon">${icon("settings")}</div>
          <h3>還沒有常用物品</h3>
          <p>先建立常用物品，新增旅程或旅程類型預設物品時就能從下拉選單快速帶入。</p>
        </div>`
      : `
        <div class="item-table-wrap common-item-table-wrap">
          <table class="item-table common-item-table" aria-label="常用物品清單">
            <thead>
              <tr>
                <th class="col-name">物品</th>
                <th class="col-actions"></th>
              </tr>
            </thead>
            <tbody>${commonItems.map(buildCommonItemRow).join("")}</tbody>
          </table>
        </div>`;

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
              <h2>常用物品設定</h2>
            </div>
            ${buildSettingsNavigationMarkup("#common-items")}
          </div>

          <p class="settings-hint">建立可重複使用的物品名稱；選取後會複製到當下的清單，不會回頭修改既有資料。</p>

          <form id="form-add-common-item" class="add-form surface-panel" novalidate>
            <div class="input-group input-group-grow">
              <label for="input-common-item-name">物品名稱</label>
              <input
                type="text"
                id="input-common-item-name"
                placeholder="輸入常用物品名稱（例如：護照）"
                autocomplete="off"
                maxlength="100"
              />
            </div>
            <button type="submit" class="btn-primary">
              ${icon("plus")}
              <span>新增物品</span>
            </button>
          </form>
          <div id="common-item-error" class="field-error hidden" role="alert"></div>

          ${itemsContent}
        </section>
      </main>
    </div>`;

  bindCommonItemActions(app);
}

function buildCommonItemRow(item) {
  const editing = uiState.editingCommonItemId === item.id;
  if (editing) {
    return `
      <tr class="item-row common-item-row is-editing" data-id="${esc(item.id)}">
        <td class="col-name">
          <input type="text" class="edit-name-input js-edit-common-item-input" value="${esc(item.name)}" maxlength="100" aria-label="物品名稱" />
        </td>
        <td class="col-actions edit-actions-cell">
          <button type="button" class="btn-icon btn-icon-save js-save-common-item" data-id="${esc(item.id)}" aria-label="儲存 ${esc(item.name)}">
            ${icon("check")}
          </button>
          <button type="button" class="btn-icon btn-icon-cancel js-cancel-common-item" data-id="${esc(item.id)}" aria-label="取消編輯 ${esc(item.name)}">
            ${icon("x")}
          </button>
        </td>
      </tr>`;
  }

  return `
    <tr class="item-row common-item-row" data-id="${esc(item.id)}">
      <td class="col-name item-name">
        <div class="item-primary">
          <span class="item-field-label">物品</span>
          <div class="table-item-name">${esc(item.name)}</div>
        </div>
      </td>
      <td class="col-actions">
        <div class="action-group">
          <button type="button" class="btn-icon btn-icon-edit js-edit-common-item" data-id="${esc(item.id)}" aria-label="編輯 ${esc(item.name)}">
            ${icon("edit")}
            <span class="btn-icon-text">編輯</span>
          </button>
          <button type="button" class="btn-icon btn-icon-danger js-delete-common-item" data-id="${esc(item.id)}" aria-label="刪除 ${esc(item.name)}">
            ${icon("trash")}
            <span class="btn-icon-text">刪除</span>
          </button>
        </div>
      </td>
    </tr>`;
}

function bindCommonItemActions(app) {
  const rerender = () => renderCommonItems(document.getElementById("app"));

  document
    .getElementById("form-add-common-item")
    .addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("input-common-item-name");
      const errEl = document.getElementById("common-item-error");
      const name = input.value.trim();
      if (!name) {
        errEl.textContent = "請輸入物品名稱。";
        errEl.classList.remove("hidden");
        input.focus();
        return;
      }
      if (hasDuplicateItemName(state.commonItems, name)) {
        errEl.textContent = "已有相同名稱的常用物品。";
        errEl.classList.remove("hidden");
        input.focus();
        return;
      }
      errEl.classList.add("hidden");
      state.commonItems.push({ id: genId(), name });
      saveState();
      input.value = "";
      uiState.editingCommonItemId = null;
      rerender();
    });

  app.querySelectorAll(".js-edit-common-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      uiState.editingCommonItemId = btn.dataset.id;
      rerender();
    });
  });

  app.querySelectorAll(".js-save-common-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = state.commonItems.find((entry) => entry.id === btn.dataset.id);
      const row = app.querySelector(
        `.common-item-row[data-id="${esc(btn.dataset.id)}"]`,
      );
      const input = row?.querySelector(".js-edit-common-item-input");
      if (!item || !input) return;
      const name = input.value.trim();
      if (!name) {
        input.focus();
        return;
      }
      if (hasDuplicateItemName(state.commonItems, name, item.id)) {
        window.alert("已有相同名稱的常用物品。");
        input.focus();
        return;
      }
      item.name = name;
      uiState.editingCommonItemId = null;
      saveState();
      rerender();
    });
  });

  app.querySelectorAll(".js-cancel-common-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      uiState.editingCommonItemId = null;
      rerender();
    });
  });

  app.querySelectorAll(".js-delete-common-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = state.commonItems.find((entry) => entry.id === btn.dataset.id);
      if (!item) return;
      if (!confirm(`確定要刪除常用物品「${item.name}」？`)) return;
      state.commonItems = state.commonItems.filter(
        (entry) => entry.id !== btn.dataset.id,
      );
      if (uiState.editingCommonItemId === btn.dataset.id) {
        uiState.editingCommonItemId = null;
      }
      saveState();
      rerender();
    });
  });

  const editingInput = app.querySelector(".js-edit-common-item-input");
  if (editingInput) {
    editingInput.focus();
    editingInput.select();
  }
}

// ─── Settings View — Trip Type Presets ───────────────────────────────────────

function renderSettings(app) {
  const { tripTypes } = state;
  const commonItems = Array.isArray(state.commonItems)
    ? state.commonItems
    : [];
  const hasCommonItems = commonItems.length > 0;
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
            ${buildSettingsNavigationMarkup("#settings")}
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
            <div class="trip-type-bulk-apply${hasCommonItems ? "" : " is-disabled"}">
              <label class="trip-type-bulk-apply-label" for="input-apply-common-items">
                <input
                  type="checkbox"
                  id="input-apply-common-items"
                  aria-describedby="apply-common-items-hint"${hasCommonItems ? " checked" : " disabled"}
                />
                <span class="trip-type-bulk-apply-copy">
                  <span class="trip-type-bulk-apply-title">將全部常用物品加入此類型</span>
                  <span id="apply-common-items-hint" class="trip-type-bulk-apply-hint">${
                    hasCommonItems
                      ? `建立後仍可逐項刪除（目前共 ${commonItems.length} 項）`
                      : "目前沒有常用物品可套用"
                  }</span>
                </span>
              </label>
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

  const headerHtml = editing
    ? `
        <div class="card-toggle-editing">
          <div class="trip-type-header-main">
            <div class="trip-type-name-wrap">
              <span class="trip-tag">Trip Type</span>
              <input type="text" class="edit-name-input js-edit-type-input" value="${esc(type.name)}" maxlength="100" aria-label="類型名稱" />
            </div>
          </div>
          <span class="card-toggle-indicator disabled">${icon("chevronUp")}</span>
        </div>`
    : `
        <button type="button" class="card-toggle trip-type-card-toggle js-toggle-type" data-id="${esc(type.id)}" aria-expanded="${expanded}">
          <div class="trip-type-header-main">
            <div class="trip-type-name-wrap">
              <span class="trip-tag">Trip Type</span>
              <span class="trip-type-name">${esc(type.name)}</span>
            </div>
          </div>
          <span class="card-toggle-indicator">${icon(expanded ? "chevronUp" : "chevronDown")}</span>
        </button>`;

  const actionsHtml = expanded
    ? `
        <div class="trip-type-header-actions">
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
                </button>`
          }
        </div>`
    : "";

  return `
    <div class="trip-type-card surface-panel${expanded ? " is-expanded" : ""}" data-type-id="${esc(type.id)}" role="listitem">
      <div class="trip-type-header">
        ${headerHtml}
        ${actionsHtml}
      </div>

      ${
        expanded
          ? `
            <div class="trip-type-card-panel">
              <form class="add-form surface-panel preset-add-form js-add-preset-form" data-type-id="${esc(type.id)}" novalidate>
                ${buildItemSourceMarkup({
                  scopeId: `preset-${type.id}`,
                  manualInputClass: "js-preset-name-input",
                  selectClass: "js-preset-common-item-select",
                })}
                <div class="input-group input-group-compact">
                  <label for="input-preset-qty-${esc(type.id)}">數量</label>
                  <select
                    id="input-preset-qty-${esc(type.id)}"
                    class="select-input quantity-select js-preset-qty-input"
                  >
                    ${buildQuantityOptions()}
                  </select>
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

function buildPresetEditRowMarkup(preset) {
  return `
    <td class="col-name">
      <input type="text" class="edit-name-input" value="${esc(preset.name)}" maxlength="100" aria-label="物品名稱" />
    </td>
    <td class="col-qty">
      <select class="select-input quantity-select edit-qty-input" aria-label="數量">
        ${buildQuantityOptions(preset.qty)}
      </select>
    </td>
    <td class="col-actions edit-actions-cell">
      <div class="action-group">
        <button class="btn-icon btn-icon-save js-save-preset-edit" aria-label="儲存 ${esc(preset.name)}">
          ${icon("check")}
        </button>
        <button class="btn-icon btn-icon-cancel js-cancel-preset-edit" aria-label="取消編輯 ${esc(preset.name)}">
          ${icon("x")}
        </button>
      </div>
    </td>`;
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
      const applyCommonItemsInput = document.getElementById(
        "input-apply-common-items",
      );
      const commonItems = Array.isArray(state.commonItems)
        ? state.commonItems
        : [];
      const typeId = genId();
      const presetItems =
        applyCommonItemsInput?.checked === true
          ? commonItems.map((item) => ({
              id: genId(),
              name: item.name,
              qty: 1,
            }))
          : [];
      state.tripTypes.push({
        id: typeId,
        name,
        createdAt: new Date().toISOString(),
        presetItems,
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
    bindMutuallyExclusiveItemSource(form);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const typeId = form.dataset.typeId;
      const type = state.tripTypes.find((t) => t.id === typeId);
      if (!type) return;
      const nameInput = form.querySelector(".js-preset-name-input");
      const commonSelect = form.querySelector(".js-preset-common-item-select");
      const qtyInput = form.querySelector(".js-preset-qty-input");
      const errEl = app.querySelector(
        `.js-preset-error[data-type-id="${esc(typeId)}"]`,
      );
      const source = resolveItemSource(
        {
          manualName: nameInput.value,
          commonItemId: commonSelect?.value,
        },
        state.commonItems,
      );
      const qty = parseAllowedQuantity(qtyInput.value);
      if (source.error) {
        errEl.textContent = source.error;
        errEl.classList.remove("hidden");
        (nameInput.value.trim() ? commonSelect : nameInput)?.focus();
        return;
      }
      const name = source.name;
      if (hasDuplicateItemName(type.presetItems, name)) {
        errEl.textContent = "這個旅程類型已有相同名稱的預設物品。";
        errEl.classList.remove("hidden");
        nameInput.focus();
        return;
      }
      if (qty === null) {
        errEl.textContent = "數量必須選擇 1 至 10。";
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
      row.innerHTML = buildPresetEditRowMarkup(preset);
      const nameInput = row.querySelector(".edit-name-input");
      nameInput.focus();
      nameInput.select();
      row
        .querySelector(".js-save-preset-edit")
        .addEventListener("click", () => {
          const newName = row.querySelector(".edit-name-input").value.trim();
          const newQty = parseAllowedQuantity(
            row.querySelector(".edit-qty-input").value,
            preset.qty,
          );
          if (!newName || newQty === null) return;
          if (hasDuplicateItemName(type.presetItems, newName, preset.id)) {
            window.alert("這個旅程類型已有相同名稱的預設物品。");
            row.querySelector(".edit-name-input").focus();
            return;
          }
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
