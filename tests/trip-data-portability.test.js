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

test("buildExportPayload includes complete canonical state", () => {
  const { buildExportPayload } = loadAppFunctions();
  const state = {
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
  assert.equal(payload.version, 1);
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
  const payload = validPayload({ version: 2 });

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
    skippedTrips: 1,
    skippedTripTypes: 3,
  });

  assert.equal(
    message,
    "匯入完成：新增 2 個旅程、1 個旅程類型；略過 1 個重複旅程、3 個重複旅程類型。",
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
    `state = ${JSON.stringify({ trips: [], tripTypes: [] })}; storageAvailable = true;`,
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
  });
  assert.match(fixture.status.textContent, /無法儲存/);
  assert.equal(fixture.importInput.value, "");
});
