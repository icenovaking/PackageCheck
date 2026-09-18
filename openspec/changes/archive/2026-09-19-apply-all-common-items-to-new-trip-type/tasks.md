<!--
Each task description MUST state:
- the behavior or contract being delivered (what is observably true when the
  task is complete), and
- the verification target that proves completion (test, CLI invocation,
  analyzer check, manual assertion, or content review).

File paths are supporting context for locating the work, never the task
itself. "Edit file X" is not a valid task — it is missing both behavior and
verification.
-->

## 1. 先以測試固定行為

- [x] 1.1 在 `tests/trip-data-portability.test.js` 為 `Define a trip type` 與 `Bulk-copy common items into a new trip type` 增加 RED 測試：預設勾選須依順序複製全部名稱、每項 `qty` 為 1 且 ID 獨立，取消勾選須建立空清單，後續新增、改名或刪除常用物品不得回寫快照；執行 `node --test tests/trip-data-portability.test.js` 並確認新增案例在實作前因缺少行為而失敗。
- [x] 1.2 [after: 1.1] 在同一測試檔加入 `Bulk-apply option remains operable across supported viewports` 的 RED 契約測試，驗證 checkbox 有可連結的 label、非空目錄時預設勾選、空或無效 `commonItems` 時 disabled 且未勾選、輔助文字明確，以及樣式提供至少 44 px 選項列與可見焦點；執行 `node --test tests/trip-data-portability.test.js` 並確認新增案例在 UI 實作前失敗。

## 2. 實作建立類型的一鍵套用

- [x] 2.1 [after: 1.2] 依「在建立類型時採一次性快照複製」與「保持現有資料結構與儲存流程」在 `app.js` 完成建立類型邏輯：送出時讀取 checkbox，將當下有效的 `state.commonItems` 轉為 `{ id, name, qty: 1 }` 快照或空陣列，不新增持久化欄位且沿用 `saveState()`；執行 `node --test tests/trip-data-portability.test.js`，確認 1.1 的案例轉為通過且既有匯入匯出案例仍通過。
- [x] 2.2 [after: 2.1] 依「用原生核取方塊呈現預設啟用選項」與「空常用物品時顯示停用狀態」在新增類型表單與 `style.css` 加入整列可點擊的原生 checkbox、項目數量或空狀態輔助文字、鍵盤焦點與手機單欄樣式；執行 `node --test tests/trip-data-portability.test.js`，確認 1.2 的標記與樣式契約案例轉為通過。

## 3. 驗證完整使用流程

- [x] 3.1 [after: 2.2] 以 `node --test tests/trip-data-portability.test.js` 驗證全部 Node 測試通過，並從 `F:\Website\PackageCheck` 執行 `python -m http.server 4173`，在 320 px 與 390 px 瀏覽器寬度手動確認預設套用、取消套用、空常用物品、整列點擊、鍵盤切換與焦點、無水平溢位，以及建立後刪減預設物品的流程；記錄實際檢查結果後才完成此任務。
