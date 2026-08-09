## Context

PackCheck 是以 app.js、style.css 與 index.html 組成的瀏覽器端單頁應用程式，狀態保存於 localStorage。現有狀態包含 trips 與 tripTypes；旅程類型的 presetItems 會在建立旅程時複製成旅程自己的 items，不會與設定資料建立即時關聯。

目前有兩個新增物品流程：

- 實際旅程透過 buildTripManager 與 bindTripItemForms 新增 items。
- 旅程類型設定透過 buildTripTypeCard 與 bindSettingsActions 新增 presetItems。

匯出、匯入與合併集中於 buildExportPayload、parseImportPayload 與 mergeImportedState，現有匯入合併以 ID 保留本機資料並略過相同 ID 的匯入記錄。這次變更需要在不破壞既有旅程快照行為的前提下，加入可被兩個新增流程共用的常用物品目錄。

## Goals / Non-Goals

**Goals:**

- 新增頂層 commonItems 目錄，提供常用物品設定頁面的 CRUD。
- 在實際旅程與旅程類型預設物品表單中提供相同的常用物品下拉選單。
- 讓手動名稱與下拉選取互斥，且在送出時阻擋空值、雙重輸入與同一目標清單中的重複名稱。
- 讓常用物品只提供名稱來源，數量仍由目前表單輸入。
- 將 commonItems 納入匯出與匯入，並支援舊版沒有 commonItems 的資料。
- 以穩定、可測試的名稱正規化規則處理常用物品與目標清單內的重複。

**Non-Goals:**

- 不為 trip.items 或 tripTypes[].presetItems 保存 commonItemId。
- 不因常用物品改名或刪除而同步修改既有旅程或旅程類型。
- 不將手動輸入的單次物品自動加入 commonItems。
- 不為常用物品保存預設數量。
- 不新增後端、資料庫、外部套件或新的持久化層。

## Decisions

### Top-level catalog with copy-on-select

State 增加 commonItems: Array<{ id: string, name: string }>。常用物品設定頁負責管理這個目錄；選取下拉選項後，目標表單以自己的新 ID 與目前輸入的數量建立一筆 presetItem 或 trip item，只複製名稱，不保存 commonItemId。

這延續旅程類型預設物品的快照模式。即使常用物品之後被改名或刪除，既有旅程與旅程類型仍保持不變。選項來源共用與資料生命週期關聯分離，可提供重複使用性而不引入斷鏈或同步副作用。

替代方案是讓每筆目標物品只保存 commonItemId，或同時保存 ID 與即時名稱。前者會讓刪除與匯入需要處理斷鏈；後者仍需定義改名同步與快照優先順序，因此不採用。

### Shared mutually-exclusive source input

實際旅程新增物品與旅程類型新增預設物品都使用相同的輸入契約：手動名稱、常用物品選擇、數量。手動名稱經 trim 後非空時，常用物品 select 必須停用；select 有選值時，手動輸入必須停用；清空作用中的欄位後，另一個來源重新啟用。

表單送出時只接受一個非空來源。兩者皆空、兩者同時有值、或數量不是正整數，都必須顯示欄位錯誤且不得修改狀態。常用物品目錄為空時，select 顯示無可用選項並保持停用，但手動輸入仍可使用。手動輸入不會建立或修改 commonItems。

這項行為可由共用的 markup/binding helper 或等價的共用驗證函式實作，避免兩個表單出現不同的互斥規則。

### Name-based uniqueness with ID-based import identity

新建或編輯常用物品時，名稱經過 trim 與 toLocaleLowerCase 正規化後，必須在 commonItems 內唯一。相同正規化名稱不得出現在同一旅程或同一旅程類型的 presetItems 中；不同旅程或不同旅程類型可以使用相同名稱。重複時顯示可理解的欄位錯誤，且不得新增或覆蓋資料。

ID 是資料記錄的技術身份，名稱是使用者可見目錄的業務唯一性：

- 同一份匯入檔內的 commonItems 必須有唯一 ID 與唯一正規化名稱。
- 合併匯入資料時，先檢查本機是否已有相同 ID，再檢查是否已有相同正規化名稱。
- 任一條件衝突時略過匯入項目並保留本機項目；只有 ID 與名稱都沒有衝突時才新增。
- 匯入的 trips 與 tripTypes 仍沿用既有 ID 合併規則，且不需要解析 commonItemId。

這比只用 ID 更能避免新產生 ID 的同名常用物品污染下拉選單，也比只用名稱更能保留既有匯入的記錄身份。

### Versioned portability with backward-compatible imports

新匯出 payload 的 data 必須包含 trips、tripTypes 與 commonItems。新格式使用 version 2；匯入 parser 必須接受 version 1 與 version 2。version 1 缺少 data.commonItems 時，正規化為空陣列；version 2 必須驗證 commonItems 是有效陣列。

匯入結果增加新增與略過的常用物品數量。匯入驗證失敗時，整個匯入不得修改目前 state；合併或 localStorage 儲存失敗時，沿用現有回復行為。

### Reuse existing vanilla-JS views and persistence

新增 common-items 路由與設定頁，沿用現有 renderSettings、卡片、表單錯誤、inline edit、刪除確認與 pending focus 的互動模式。旅程頁在「類型設定」旁提供「常用物品設定」入口；common-items 頁提供返回旅程入口。

主要 runtime 變更集中於 app.js；style.css 只補充常用物品頁、下拉選單與兩個來源欄位的排列和響應式樣式。匯入匯出單元測試延伸既有 tests/trip-data-portability.test.js 的 Node vm 測試方式，不引入新的測試框架。

## Implementation Contract

### Observable behavior

- 使用者可從旅程頁開啟常用物品設定，建立、編輯、刪除名稱唯一的常用物品。
- 實際旅程與旅程類型預設物品新增表單都能選取 commonItems；選取後會以目標清單自己的項目 ID 與數量新增。
- 手動輸入與下拉選取不可同時送出；無效輸入不會改變 state。
- 同一目標清單中的同名物品會被阻擋；不同目標清單可各自擁有相同名稱。
- 常用物品變更不會改寫既有 trips 或 tripTypes.presetItems。

### Data shape

- State 必須包含 commonItems，舊 localStorage state 缺少此欄位時視為空陣列。
- Export payload 的 data 必須包含 commonItems。
- 新版本 export 使用 version 2；import 必須接受 version 1 和 version 2，version 1 的 commonItems 正規化為空陣列。
- commonItems record 必須包含非空 id 與 name，不包含預設 qty 或目標清單關聯 ID。

### Failure modes

- 空名稱、同一清單內的重複名稱、同時填入兩種名稱來源、或非正整數數量：顯示欄位錯誤，不保存。
- 匯入檔內 commonItems 的 ID 或正規化名稱重複：拒絕整份匯入。
- 匯入項目與本機 commonItems 的 ID 或正規化名稱衝突：略過衝突項目，保留本機資料並在結果訊息計數。
- 匯入 JSON 格式、版本、日期或既有旅程類型參照無效：沿用現有錯誤回報，不修改目前 state。
- localStorage 儲存失敗：還原匯入前 state，沿用現有儲存警告。

### Acceptance criteria

- Node tests cover export version 2 and commonItems round-trip.
- Node tests cover version 1 import defaulting commonItems to an empty array.
- Node tests cover duplicate common item IDs, duplicate normalized names, local ID/name conflicts, and merge counters.
- Manual browser verification covers common-item CRUD, both dropdown consumers, mutual disabling, empty catalog fallback, same-list duplicate blocking, and unchanged existing trip snapshots after common-item edits/deletes.
- Spectra analyze and validate complete without Critical or Warning findings.

### Scope boundaries

In scope are the common item settings route and UI, shared selection behavior in the two existing add forms, state/localStorage normalization, JSON portability, duplicate validation, responsive styling, and related tests.

Out of scope are live item relationships, automatic promotion of manual entries, default quantities, backend storage, changes to trip type selection limits, and unrelated visual redesign.

## Risks / Trade-offs

- [Risk] Existing localStorage data has no commonItems field. → [Mitigation] loadState defaults missing commonItems to an empty array and import version 1 normalizes it the same way.
- [Risk] New version 2 exports cannot preserve commonItems when opened and re-exported by an older application version. → [Mitigation] version 2 import remains explicit, old data remains readable, and the migration contract documents that commonItems require the new version for preservation.
- [Risk] Two independent forms drift in mutual-exclusion behavior. → [Mitigation] share the source-field markup and validation contract, and cover both consumers in manual acceptance checks.
- [Risk] Name normalization blocks two names users consider distinct. → [Mitigation] normalize only leading/trailing whitespace and letter case; preserve internal whitespace and punctuation.
- [Risk] Importing a same-name item with a different ID silently drops the imported definition. → [Mitigation] report skipped common item counts and keep local data authoritative, matching the existing non-destructive merge behavior.

## Migration Plan

1. Extend initial and loaded state with commonItems: [] when the field is absent.
2. Export new files as version 2 with commonItems.
3. Continue accepting version 1 imports by normalizing missing commonItems to [].
4. Preserve local records on ID or normalized-name conflicts during merge.
5. If the feature is rolled back, trips and tripTypes remain readable; commonItems are not available in the older UI and must be re-exported with the new version to preserve them.

## Open Questions

None. The discussion confirmed copy-on-select behavior, no automatic common-item creation, name-based duplicate blocking within each target list, and ID-plus-name duplicate handling during import.
