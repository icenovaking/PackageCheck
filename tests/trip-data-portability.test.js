const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadAppFunctions() {
  const appPath = path.join(__dirname, "..", "app.js");
  const source = fs
    .readFileSync(appPath, "utf8")
    .replace(/\r?\ninit\(\);\s*$/, "\n");
  const context = {
    window: { addEventListener() {} },
  };
  vm.runInNewContext(source, context, { filename: appPath });
  return context;
}

function validPayload(overrides = {}) {
  return {
    format: "packcheck-data",
    version: 1,
    exportedAt: "2026-08-08T00:00:00.000Z",
    data: {
      tripTypes: [
        {
          id: "shared-type",
          name: "Travel",
          createdAt: "2026-08-08T00:00:00.000Z",
          presetItems: [{ id: "preset-passport", name: "Passport", qty: 1 }],
        },
      ],
      trips: [
        {
          id: "shared-trip",
          name: "Japan",
          createdAt: "2026-08-08T00:00:00.000Z",
          typeIds: ["shared-type"],
          typeDisplay: "Travel",
          items: [
            {
              id: "item-passport",
              name: "Passport",
              qty: 1,
              departureChecked: true,
              returnChecked: false,
            },
          ],
        },
      ],
    },
    ...overrides,
  };
}

test("buildExportPayload includes common items in canonical state", () => {
  const { buildExportPayload } = loadAppFunctions();
  const state = {
    trips: [],
    tripTypes: [],
    commonItems: [{ id: "common-passport", name: "Passport" }],
  };

  const payload = buildExportPayload(state);

  assert.deepEqual(payload.data.commonItems, state.commonItems);
});

test("loadState defaults missing commonItems to an empty array", () => {
  const context = loadAppFunctions();
  context.localStorage = {
    setItem() {},
    removeItem() {},
    getItem(key) {
      assert.equal(key, "packcheck_data");
      return JSON.stringify({ trips: [], tripTypes: [] });
    },
  };
  context.document = { getElementById: () => null };

  context.loadState();

  assert.deepEqual(JSON.parse(JSON.stringify(vm.runInNewContext("state", context))), {
    trips: [],
    tripTypes: [],
    commonItems: [],
  });
});

test("buildExportPayload includes complete canonical state", () => {
  const { buildExportPayload } = loadAppFunctions();
  const state = {
    commonItems: [],
    tripTypes: [
      {
        id: "shared-type",
        name: "Travel",
        createdAt: "2026-08-08T00:00:00.000Z",
        presetItems: [{ id: "preset-passport", name: "Passport", qty: 1 }],
      },
    ],
    trips: [
      {
        id: "shared-trip",
        name: "Japan",
        createdAt: "2026-08-08T00:00:00.000Z",
        typeIds: ["shared-type"],
        typeDisplay: "Travel",
        items: [
          {
            id: "item-passport",
            name: "Passport",
            qty: 1,
            departureChecked: true,
            returnChecked: false,
          },
        ],
      },
    ],
  };

  const payload = buildExportPayload(state);

  assert.equal(payload.format, "packcheck-data");
  assert.equal(payload.version, 2);
  assert.equal(typeof payload.exportedAt, "string");
  assert.deepEqual(JSON.parse(JSON.stringify(payload.data)), state);
});

test("downloadExportPayload downloads JSON and revokes the object URL", () => {
  const { downloadExportPayload } = loadAppFunctions();
  const events = [];
  const link = {
    click() {
      events.push({ type: "click", href: this.href, download: this.download });
    },
  };
  const fakeBlob = function FakeBlob(parts, options) {
    this.parts = parts;
    this.options = options;
  };
  const urlApi = {
    createObjectURL(blob) {
      events.push({ type: "create", blob });
      return "blob:packcheck";
    },
    revokeObjectURL(url) {
      events.push({ type: "revoke", url });
    },
  };
  const documentApi = {
    createElement(tagName) {
      assert.equal(tagName, "a");
      return link;
    },
  };
  const payload = {
    format: "packcheck-data",
    version: 1,
    exportedAt: "2026-08-08T00:00:00.000Z",
    data: { trips: [], tripTypes: [] },
  };

  downloadExportPayload(payload, {
    BlobCtor: fakeBlob,
    urlApi,
    documentApi,
    now: () => new Date("2026-08-08T12:34:56.000Z"),
  });

  assert.equal(events[0].type, "create");
  assert.equal(events[0].blob.options.type, "application/json");
  assert.deepEqual(JSON.parse(events[0].blob.parts[0]), payload);
  assert.deepEqual(events[1], {
    type: "click",
    href: "blob:packcheck",
    download: "packcheck-export-20260808-123456.json",
  });
  assert.deepEqual(events[2], { type: "revoke", url: "blob:packcheck" });
});

test("parseImportPayload accepts a valid package and unknown fields", () => {
  const { parseImportPayload } = loadAppFunctions();
  const payload = validPayload();
  payload.data.extraMetadata = { source: "shared" };

  const parsed = parseImportPayload(JSON.stringify(payload), {
    trips: [],
    tripTypes: [],
  });

  assert.equal(parsed.format, "packcheck-data");
  assert.equal(parsed.version, 1);
  assert.equal(parsed.data.trips[0].typeIds[0], "shared-type");
  assert.equal("extraMetadata" in parsed.data, false);
});

test("parseImportPayload accepts a reference to an existing local type", () => {
  const { parseImportPayload } = loadAppFunctions();
  const payload = validPayload();
  payload.data.tripTypes = [];

  assert.doesNotThrow(() =>
    parseImportPayload(JSON.stringify(payload), {
      trips: [],
      tripTypes: [{ id: "shared-type" }],
    }),
  );
});

test("parseImportPayload rejects malformed JSON without mutating current state", () => {
  const { parseImportPayload } = loadAppFunctions();
  const currentState = { trips: [], tripTypes: [{ id: "local-type" }] };
  const before = JSON.stringify(currentState);

  assert.throws(
    () => parseImportPayload("{not-json", currentState),
    /有效 JSON/,
  );
  assert.equal(JSON.stringify(currentState), before);
});

test("parseImportPayload rejects unsupported versions", () => {
  const { parseImportPayload } = loadAppFunctions();
  const payload = validPayload({ version: 3 });

  assert.throws(
    () => parseImportPayload(JSON.stringify(payload), { trips: [], tripTypes: [] }),
    /版本/,
  );
});

test("parseImportPayload rejects invalid quantities and check states", () => {
  const { parseImportPayload } = loadAppFunctions();
  const payload = validPayload();
  payload.data.trips[0].items[0].qty = 0;

  assert.throws(
    () => parseImportPayload(JSON.stringify(payload), { trips: [], tripTypes: [] }),
    /數量/,
  );

  payload.data.trips[0].items[0].qty = 1;
  payload.data.trips[0].items[0].departureChecked = "true";
  assert.throws(
    () => parseImportPayload(JSON.stringify(payload), { trips: [], tripTypes: [] }),
    /勾選/,
  );
});

test("parseImportPayload rejects unresolved trip type references", () => {
  const { parseImportPayload } = loadAppFunctions();
  const payload = validPayload();
  payload.data.tripTypes = [];

  assert.throws(
    () => parseImportPayload(JSON.stringify(payload), { trips: [], tripTypes: [] }),
    /類型參照/,
  );
});

test("mergeImportedState keeps local IDs and adds imported IDs", () => {
  const { mergeImportedState, parseImportPayload } = loadAppFunctions();
  const localState = {
    tripTypes: [
      {
        id: "local-type",
        name: "Local Type",
        createdAt: "2026-08-01T00:00:00.000Z",
        presetItems: [],
      },
    ],
    trips: [
      {
        id: "local-trip",
        name: "Local Trip",
        createdAt: "2026-08-01T00:00:00.000Z",
        typeIds: ["local-type"],
        typeDisplay: "Local Type",
        items: [],
      },
    ],
  };
  const importedPayload = validPayload({
    data: {
      tripTypes: [
        {
          id: "local-type",
          name: "Imported Replacement",
          createdAt: "2026-08-08T00:00:00.000Z",
          presetItems: [],
        },
        {
          id: "new-type",
          name: "New Type",
          createdAt: "2026-08-08T00:00:00.000Z",
          presetItems: [],
        },
      ],
      trips: [
        {
          id: "local-trip",
          name: "Imported Replacement",
          createdAt: "2026-08-08T00:00:00.000Z",
          typeIds: ["local-type"],
          typeDisplay: "Imported Replacement",
          items: [],
        },
        {
          id: "new-trip",
          name: "Shared Trip",
          createdAt: "2026-08-08T00:00:00.000Z",
          typeIds: ["new-type"],
          typeDisplay: "New Type",
          items: [],
        },
      ],
    },
  });
  const parsed = parseImportPayload(JSON.stringify(importedPayload), localState);
  const before = JSON.stringify(localState);

  const result = mergeImportedState(localState, parsed);

  assert.equal(result.addedTripTypes, 1);
  assert.equal(result.skippedTripTypes, 1);
  assert.equal(result.addedTrips, 1);
  assert.equal(result.skippedTrips, 1);
  assert.deepEqual(
    JSON.parse(JSON.stringify(result.state.tripTypes)),
    JSON.parse(JSON.stringify([localState.tripTypes[0], parsed.data.tripTypes[1]])),
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(result.state.trips)),
    JSON.parse(JSON.stringify([localState.trips[0], parsed.data.trips[1]])),
  );
  assert.equal(JSON.stringify(localState), before);
});

test("mergeImportedState preserves relationships and item check states", () => {
  const { mergeImportedState, parseImportPayload } = loadAppFunctions();
  const payload = validPayload();
  const parsed = parseImportPayload(JSON.stringify(payload), {
    trips: [],
    tripTypes: [],
  });

  const result = mergeImportedState({ trips: [], tripTypes: [] }, parsed);
  const importedTrip = result.state.trips[0];
  const importedItem = importedTrip.items[0];

  assert.deepEqual(
    JSON.parse(JSON.stringify(importedTrip.typeIds)),
    ["shared-type"],
  );
  assert.equal(importedTrip.typeDisplay, "Travel");
  assert.equal(importedItem.id, "item-passport");
  assert.equal(importedItem.qty, 1);
  assert.equal(importedItem.departureChecked, true);
  assert.equal(importedItem.returnChecked, false);
});

test("buildDataTransferControlsMarkup exposes accessible export and import controls", () => {
  const { buildDataTransferControlsMarkup } = loadAppFunctions();

  const markup = buildDataTransferControlsMarkup();

  assert.match(markup, /id="btn-export-data"/);
  assert.match(markup, /匯出設定\s*<\/button>/);
  assert.match(markup, /id="btn-import-data"/);
  assert.match(markup, /匯入設定\s*<\/button>/);
  assert.match(markup, /type="file"/);
  assert.match(markup, /accept="\.json,application\/json"/);
  assert.match(markup, /id="data-transfer-status"/);
  assert.match(markup, /role="status"/);
});

test("formatDataTransferImportResult reports added and skipped records", () => {
  const { formatDataTransferImportResult } = loadAppFunctions();

  const message = formatDataTransferImportResult({
    addedTrips: 2,
    addedTripTypes: 1,
    addedCommonItems: 4,
    skippedTrips: 1,
    skippedTripTypes: 3,
    skippedCommonItems: 2,
  });

  assert.equal(
    message,
    "匯入完成：新增 2 個旅程、1 個旅程類型、4 個常用物品；略過 1 個重複旅程、3 個重複旅程類型、2 個重複常用物品。",
  );
});

function transferAppFixture() {
  const listeners = {};
  const status = {
    textContent: "",
    classList: {
      remove() {},
      add() {},
    },
  };
  const importInput = {
    files: [],
    value: "selected.json",
    click() {
      listeners.opened = true;
    },
    addEventListener(type, handler) {
      listeners[type] = handler;
    },
  };
  const exportButton = {
    addEventListener(type, handler) {
      listeners[`export:${type}`] = handler;
    },
  };
  const importButton = {
    addEventListener(type, handler) {
      listeners[`import:${type}`] = handler;
    },
  };
  const app = {
    querySelector(selector) {
      return {
        "#btn-export-data": exportButton,
        "#btn-import-data": importButton,
        "#input-import-data": importInput,
        "#data-transfer-status": status,
      }[selector];
    },
  };
  return { app, importInput, status, listeners };
}

test("bindDataTransferActions opens the picker and failed imports reset the input", async () => {
  const context = loadAppFunctions();
  const fixture = transferAppFixture();
  context.bindDataTransferActions(fixture.app);

  fixture.listeners["import:click"]();
  assert.equal(fixture.listeners.opened, true);

  await context.importDataFile(
    { text: async () => "{not-json" },
    fixture.app,
  );
  assert.equal(fixture.importInput.value, "");
  assert.match(fixture.status.textContent, /有效 JSON/);
});

test("importDataFile persists a valid merge and rerenders the trip list", async () => {
  const context = loadAppFunctions();
  const fixture = transferAppFixture();
  let savedValue = null;
  let rerendered = false;
  context.localStorage = {
    setItem(key, value) {
      assert.equal(key, "packcheck_data");
      savedValue = value;
    },
  };
  context.renderTripList = () => {
    rerendered = true;
  };

  await context.importDataFile(
    { text: async () => JSON.stringify(validPayload()) },
    fixture.app,
  );

  const savedState = JSON.parse(savedValue);
  assert.equal(savedState.trips[0].id, "shared-trip");
  assert.equal(savedState.tripTypes[0].id, "shared-type");
  assert.equal(rerendered, true);
  assert.match(fixture.status.textContent, /匯入完成/);
  assert.equal(fixture.importInput.value, "");
});

test("importDataFile restores state and reports failure when persistence fails", async () => {
  const context = loadAppFunctions();
  const fixture = transferAppFixture();
  const warning = {
    textContent: "",
    classList: { remove() {}, add() {} },
  };
  context.document = { getElementById: () => warning };
  context.localStorage = {
    setItem() {
      throw new Error("quota");
    },
  };
  vm.runInNewContext(
    `state = ${JSON.stringify({
      trips: [],
      tripTypes: [],
      commonItems: [{ id: "local-item", name: "本機物品" }],
    })}; storageAvailable = true;`,
    context,
  );

  await context.importDataFile(
    { text: async () => JSON.stringify(validPayload()) },
    fixture.app,
  );

  const restoredState = vm.runInNewContext("state", context);
  assert.deepEqual(JSON.parse(JSON.stringify(restoredState)), {
    trips: [],
    tripTypes: [],
    commonItems: [{ id: "local-item", name: "本機物品" }],
  });
  assert.match(fixture.status.textContent, /無法儲存/);
  assert.equal(fixture.importInput.value, "");
});

test("buildCommonItemRow exposes common item management controls", () => {
  const context = loadAppFunctions();
  const markup = context.buildCommonItemRow({
    id: "common-passport",
    name: "護照",
  });

  assert.match(markup, /class="[^"]*common-item-row/);
  assert.match(markup, /data-id="common-passport"/);
  assert.match(markup, /js-edit-common-item/);
  assert.match(markup, /js-delete-common-item/);
  assert.match(markup, /護照/);
});

test("normalizeItemName ignores outer whitespace and letter case", () => {
  const context = loadAppFunctions();

  assert.equal(context.normalizeItemName("  Passport  "), "passport");
  assert.equal(context.normalizeItemName(" 護照 "), "護照");
});

test("hasDuplicateItemName compares normalized names and allows the edited record", () => {
  const context = loadAppFunctions();
  const records = [
    { id: "item-1", name: "Passport" },
    { id: "item-2", name: "護照" },
  ];

  assert.equal(context.hasDuplicateItemName(records, " passport "), true);
  assert.equal(context.hasDuplicateItemName(records, "護照", "item-2"), false);
  assert.equal(context.hasDuplicateItemName(records, "Passport", "item-2"), true);
});

test("mergePresetItems deduplicates names after trimming and case folding", () => {
  const context = loadAppFunctions();
  vm.runInNewContext(
    `state = ${JSON.stringify({
      trips: [],
      commonItems: [],
      tripTypes: [
        { id: "type-1", name: "A", presetItems: [{ id: "preset-1", name: " Passport ", qty: 1 }] },
        { id: "type-2", name: "B", presetItems: [{ id: "preset-2", name: "passport", qty: 2 }] },
      ],
    })};`,
    context,
  );

  assert.equal(context.mergePresetItems(["type-1", "type-2"]).length, 1);
});

test("buildSettingsNavigationMarkup exposes both settings pages", () => {
  const context = loadAppFunctions();
  const markup = context.buildSettingsNavigationMarkup();

  assert.match(markup, /href="#settings"/);
  assert.match(markup, /類型設定/);
  assert.match(markup, /href="#common-items"/);
  assert.match(markup, /常用物品/);
});

test("buildItemSourceMarkup renders manual and common-item sources", () => {
  const context = loadAppFunctions();
  vm.runInNewContext(
    `state = ${JSON.stringify({
      trips: [],
      tripTypes: [],
      commonItems: [{ id: "common-passport", name: "護照" }],
    })};`,
    context,
  );

  const markup = context.buildItemSourceMarkup({
    scopeId: "trip-detail",
    manualInputClass: "js-item-name-input",
    selectClass: "js-common-item-select",
  });

  assert.match(markup, /class="[^"]*js-manual-item-input/);
  assert.match(markup, /class="[^"]*js-common-item-select/);
  assert.match(markup, /value="common-passport"/);
  assert.match(markup, /護照/);
});

test("resolveItemSource requires one source and copies the selected common item name", () => {
  const context = loadAppFunctions();
  const commonItems = [{ id: "common-passport", name: "護照" }];

  assert.match(
    context.resolveItemSource({ manualName: "", commonItemId: "" }, commonItems).error,
    /輸入物品名稱或選擇常用物品/,
  );
  assert.match(
    context.resolveItemSource(
      { manualName: "手動", commonItemId: "common-passport" },
      commonItems,
    ).error,
    /只能選一種/,
  );
  assert.deepEqual(
    JSON.parse(
      JSON.stringify(
        context.resolveItemSource(
          { manualName: "", commonItemId: "common-passport" },
          commonItems,
        ),
      ),
    ),
    { name: "護照" },
  );
});

test("bindMutuallyExclusiveItemSource disables the other source and restores it when cleared", () => {
  const context = loadAppFunctions();
  vm.runInNewContext(
    `state = ${JSON.stringify({
      trips: [],
      tripTypes: [],
      commonItems: [{ id: "common-passport", name: "護照" }],
    })};`,
    context,
  );
  const manualInput = {
    value: "",
    disabled: false,
    listeners: {},
    addEventListener(type, listener) {
      this.listeners[type] = listener;
    },
  };
  const commonSelect = {
    value: "",
    disabled: false,
    listeners: {},
    addEventListener(type, listener) {
      this.listeners[type] = listener;
    },
  };
  const form = {
    querySelector(selector) {
      if (selector === ".js-manual-item-input") return manualInput;
      if (selector === ".js-common-item-select") return commonSelect;
      return null;
    },
  };

  context.bindMutuallyExclusiveItemSource(form);

  manualInput.value = "手動物品";
  manualInput.listeners.input();
  assert.equal(commonSelect.disabled, true);
  assert.equal(commonSelect.value, "");

  manualInput.value = "";
  manualInput.listeners.input();
  assert.equal(commonSelect.disabled, false);

  commonSelect.value = "common-passport";
  commonSelect.listeners.change();
  assert.equal(manualInput.disabled, true);
  assert.equal(manualInput.value, "");

  commonSelect.value = "";
  commonSelect.listeners.change();
  assert.equal(manualInput.disabled, false);
});

test("bindTripItemForms copies a selected common item into a trip item", () => {
  const context = loadAppFunctions();
  vm.runInNewContext(
    `state = ${JSON.stringify({
      trips: [{ id: "trip-1", items: [] }],
      tripTypes: [],
      commonItems: [{ id: "common-passport", name: "護照" }],
    })}; storageAvailable = true;`,
    context,
  );
  context.localStorage = { setItem() {} };
  context.rerenderTripView = () => {};

  const manualInput = {
    value: "",
    disabled: false,
    focus() {},
    addEventListener() {},
  };
  const commonSelect = {
    value: "common-passport",
    disabled: false,
    addEventListener() {},
  };
  const qtyInput = { value: "2", focus() {} };
  const form = {
    dataset: { tripId: "trip-1", view: "detail" },
    listeners: {},
    querySelector(selector) {
      if (selector === ".js-item-name-input") return manualInput;
      if (selector === ".js-common-item-select") return commonSelect;
      if (selector === ".js-item-qty-input") return qtyInput;
      return null;
    },
    addEventListener(type, listener) {
      this.listeners[type] = listener;
    },
  };
  const errEl = {
    textContent: "",
    classList: { add() {}, remove() {} },
  };
  const app = {
    querySelectorAll(selector) {
      return selector === ".js-add-item-form" ? [form] : [];
    },
    querySelector(selector) {
      return selector.startsWith('.js-item-error[data-trip-id="trip-1"]')
        ? errEl
        : null;
    },
  };

  context.bindTripItemForms(app);
  form.listeners.submit({ preventDefault() {} });

  const trip = JSON.parse(vm.runInNewContext("JSON.stringify(state.trips[0])", context));
  assert.equal(trip.items.length, 1);
  assert.equal(trip.items[0].name, "護照");
  assert.equal(trip.items[0].qty, 2);
  assert.equal("commonItemId" in trip.items[0], false);
  assert.notEqual(trip.items[0].id, "common-passport");
});

test("bindSettingsActions copies a selected common item into a preset item", () => {
  const context = loadAppFunctions();
  vm.runInNewContext(
    `state = ${JSON.stringify({
      trips: [],
      tripTypes: [{ id: "type-1", name: "旅行", presetItems: [] }],
      commonItems: [{ id: "common-passport", name: "護照" }],
    })}; storageAvailable = true;`,
    context,
  );
  context.localStorage = { setItem() {} };
  context.renderSettings = () => {};

  const makeForm = (dataset, fields) => ({
    dataset,
    listeners: {},
    querySelector(selector) {
      return fields[selector] || null;
    },
    addEventListener(type, listener) {
      this.listeners[type] = listener;
    },
  });
  const presetNameInput = {
    value: "",
    disabled: false,
    focus() {},
    addEventListener() {},
  };
  const presetCommonSelect = {
    value: "common-passport",
    disabled: false,
    addEventListener() {},
  };
  const presetQtyInput = { value: "3", focus() {} };
  const presetForm = makeForm(
    { typeId: "type-1" },
    {
      ".js-preset-name-input": presetNameInput,
      ".js-preset-common-item-select": presetCommonSelect,
      ".js-preset-qty-input": presetQtyInput,
    },
  );
  const typeJumpForm = makeForm({}, {});
  const addTypeForm = makeForm({}, {});
  const errEl = {
    textContent: "",
    classList: { add() {}, remove() {} },
  };
  const app = {
    querySelectorAll(selector) {
      return selector === ".js-add-preset-form" ? [presetForm] : [];
    },
    querySelector(selector) {
      return selector.startsWith('.js-preset-error[data-type-id="type-1"]')
        ? errEl
        : null;
    },
  };
  context.document = {
    getElementById(id) {
      if (id === "form-type-jump") return typeJumpForm;
      if (id === "form-add-trip-type") return addTypeForm;
      if (id === "app") return app;
      return null;
    },
  };

  context.bindSettingsActions(app);
  presetForm.listeners.submit({ preventDefault() {} });

  const type = JSON.parse(vm.runInNewContext("JSON.stringify(state.tripTypes[0])", context));
  assert.equal(type.presetItems.length, 1);
  assert.equal(type.presetItems[0].name, "護照");
  assert.equal(type.presetItems[0].qty, 3);
  assert.equal("commonItemId" in type.presetItems[0], false);
  assert.notEqual(type.presetItems[0].id, "common-passport");
});

test("manual trip item entry does not create a common item", () => {
  const context = loadAppFunctions();
  vm.runInNewContext(
    `state = ${JSON.stringify({
      trips: [{ id: "trip-1", items: [] }],
      tripTypes: [],
      commonItems: [{ id: "common-passport", name: "護照" }],
    })}; storageAvailable = true;`,
    context,
  );
  context.localStorage = { setItem() {} };
  context.rerenderTripView = () => {};

  const listeners = {};
  const manualInput = {
    value: "手動雨衣",
    disabled: false,
    focus() {},
    addEventListener(type, listener) {
      listeners[`manual:${type}`] = listener;
    },
  };
  const commonSelect = {
    value: "",
    disabled: false,
    addEventListener(type, listener) {
      listeners[`common:${type}`] = listener;
    },
  };
  const qtyInput = { value: "1", focus() {} };
  const form = {
    dataset: { tripId: "trip-1", view: "detail" },
    querySelector(selector) {
      if (selector === ".js-item-name-input") return manualInput;
      if (selector === ".js-common-item-select") return commonSelect;
      if (selector === ".js-item-qty-input") return qtyInput;
      return null;
    },
    addEventListener(type, listener) {
      listeners[`form:${type}`] = listener;
    },
  };
  const errEl = { textContent: "", classList: { add() {}, remove() {} } };
  const app = {
    querySelectorAll(selector) {
      return selector === ".js-add-item-form" ? [form] : [];
    },
    querySelector(selector) {
      return selector.includes(".js-item-error") ? errEl : null;
    },
  };

  context.bindTripItemForms(app);
  listeners["form:submit"]({ preventDefault() {} });

  const snapshot = JSON.parse(vm.runInNewContext("JSON.stringify(state)", context));
  assert.deepEqual(snapshot.commonItems, [{ id: "common-passport", name: "護照" }]);
  assert.equal(snapshot.trips[0].items[0].name, "手動雨衣");
});

test("mergePresetItems deduplicates Chinese names after trimming", () => {
  const context = loadAppFunctions();
  vm.runInNewContext(
    `state = ${JSON.stringify({
      trips: [],
      commonItems: [],
      tripTypes: [
        { id: "type-1", name: "A", presetItems: [{ id: "preset-1", name: "護照", qty: 1 }] },
        { id: "type-2", name: "B", presetItems: [{ id: "preset-2", name: "  護照  ", qty: 2 }] },
      ],
    })};`,
    context,
  );

  assert.equal(context.mergePresetItems(["type-1", "type-2"]).length, 1);
});

test("buildExportPayload uses version 2 for common item portability", () => {
  const context = loadAppFunctions();
  const payload = context.buildExportPayload({
    trips: [],
    tripTypes: [],
    commonItems: [{ id: "common-passport", name: "護照" }],
  });

  assert.equal(payload.version, 2);
  assert.deepEqual(
    JSON.parse(JSON.stringify(payload.data.commonItems)),
    [{ id: "common-passport", name: "護照" }],
  );
});

test("parseImportPayload normalizes version 1 without commonItems", () => {
  const context = loadAppFunctions();
  const parsed = context.parseImportPayload(JSON.stringify(validPayload()), {
    trips: [],
    tripTypes: [],
    commonItems: [],
  });

  assert.equal(parsed.version, 1);
  assert.deepEqual(
    JSON.parse(JSON.stringify(parsed.data.commonItems)),
    [],
  );
});

test("parseImportPayload accepts version 2 commonItems", () => {
  const context = loadAppFunctions();
  const payload = validPayload({
    version: 2,
    data: {
      ...validPayload().data,
      commonItems: [{ id: "common-passport", name: "護照" }],
    },
  });

  const parsed = context.parseImportPayload(JSON.stringify(payload), {
    trips: [],
    tripTypes: [],
    commonItems: [],
  });

  assert.deepEqual(
    JSON.parse(JSON.stringify(parsed.data.commonItems)),
    [{ id: "common-passport", name: "護照" }],
  );
});

test("parseImportPayload rejects duplicate common item IDs", () => {
  const context = loadAppFunctions();
  const base = validPayload();
  const payload = {
    ...base,
    version: 2,
    data: {
      ...base.data,
      commonItems: [
        { id: "common-duplicate", name: "護照" },
        { id: "common-duplicate", name: "雨衣" },
      ],
    },
  };

  assert.throws(
    () => context.parseImportPayload(JSON.stringify(payload), { trips: [], tripTypes: [], commonItems: [] }),
    /commonItems.*重複.*id/,
  );
});

test("parseImportPayload rejects duplicate normalized common item names", () => {
  const context = loadAppFunctions();
  const base = validPayload();
  const payload = {
    ...base,
    version: 2,
    data: {
      ...base.data,
      commonItems: [
        { id: "common-passport", name: "Passport" },
        { id: "common-passport-2", name: " passport " },
      ],
    },
  };

  assert.throws(
    () => context.parseImportPayload(JSON.stringify(payload), { trips: [], tripTypes: [], commonItems: [] }),
    /commonItems.*重複的名稱/,
  );
});

test("parseImportPayload rejects common items with missing required fields", () => {
  const context = loadAppFunctions();
  const base = validPayload();
  const payload = {
    ...base,
    version: 2,
    data: {
      ...base.data,
      commonItems: [{ id: "common-passport" }],
    },
  };

  assert.throws(
    () => context.parseImportPayload(JSON.stringify(payload), { trips: [], tripTypes: [], commonItems: [] }),
    /commonItems.*name/,
  );
});

test("mergeImportedState keeps local common items on ID or normalized-name conflicts", () => {
  const context = loadAppFunctions();
  const base = validPayload();
  const payload = {
    ...base,
    version: 2,
    data: {
      ...base.data,
      commonItems: [
        { id: "local-item", name: "Imported replacement" },
        { id: "imported-item-same-name", name: " passport " },
        { id: "new-item", name: "雨衣" },
      ],
    },
  };
  const localState = {
    trips: [],
    tripTypes: [],
    commonItems: [
      { id: "local-item", name: "Local item" },
      { id: "local-passport", name: "Passport" },
    ],
  };
  const parsed = context.parseImportPayload(JSON.stringify(payload), localState);

  const result = context.mergeImportedState(localState, parsed);
  const mergedCommonItems = JSON.parse(JSON.stringify(result.state.commonItems));

  assert.equal(result.addedCommonItems, 1);
  assert.equal(result.skippedCommonItems, 2);
  assert.deepEqual(mergedCommonItems, [
    { id: "local-item", name: "Local item" },
    { id: "local-passport", name: "Passport" },
    { id: "new-item", name: "雨衣" },
  ]);
});

test("mergeImportedState preserves common item identity without adding relationships", () => {
  const context = loadAppFunctions();
  const base = validPayload();
  const payload = {
    ...base,
    version: 2,
    data: {
      ...base.data,
      commonItems: [{ id: "shared-item", name: "Passport" }],
    },
  };
  const parsed = context.parseImportPayload(JSON.stringify(payload), {
    trips: [],
    tripTypes: [],
    commonItems: [],
  });

  const result = context.mergeImportedState(
    { trips: [], tripTypes: [], commonItems: [] },
    parsed,
  );
  const importedCommonItem = JSON.parse(
    JSON.stringify(result.state.commonItems[0]),
  );
  const importedItem = result.state.trips[0].items[0];

  assert.deepEqual(importedCommonItem, { id: "shared-item", name: "Passport" });
  assert.equal("commonItemId" in importedItem, false);
  assert.equal(importedItem.departureChecked, true);
  assert.equal(importedItem.returnChecked, false);
});

test("importDataFile persists common items and reports common-item counts", async () => {
  const context = loadAppFunctions();
  const fixture = transferAppFixture();
  const base = validPayload();
  const payload = {
    ...base,
    version: 2,
    data: {
      ...base.data,
      commonItems: [{ id: "shared-item", name: "Passport" }],
    },
  };
  let savedValue = null;
  context.localStorage = {
    setItem(key, value) {
      assert.equal(key, "packcheck_data");
      savedValue = value;
    },
  };
  context.renderTripList = () => {};
  vm.runInNewContext(
    `state = ${JSON.stringify({ trips: [], tripTypes: [], commonItems: [] })}; storageAvailable = true;`,
    context,
  );

  await context.importDataFile(
    { text: async () => JSON.stringify(payload) },
    fixture.app,
  );

  const savedState = JSON.parse(savedValue);
  assert.deepEqual(savedState.commonItems, [{ id: "shared-item", name: "Passport" }]);
  assert.match(fixture.status.textContent, /1 個常用物品/);
  assert.match(fixture.status.textContent, /0 個重複常用物品/);
});
