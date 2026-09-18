## 1. 測試契約

- [x] 1.1 先在 `tests/trip-data-portability.test.js` 加入失敗測試，覆蓋 **Add an item to a trip**、**Edit an item**、**Add a preset item to a trip type**、**Edit a preset item** 的 1、10、預設 1、既有 12 保留與非法竄改值拒絕；以專案根目錄執行 `node --test tests/trip-data-portability.test.js`，確認新測試在實作前能指出缺少的 select 與相容選項行為。

## 2. 數量選擇控制

- [x] 2.1 依「**共用數量選項產生器與原生 select**」在 `app.js` 建立共用選項產生邏輯，讓新增入口只產生 1 至 10 且預設 1，編輯入口對既有大於 10 的正整數只額外產生目前值；以 Node 測試驗證選項順序、唯一性、selected 狀態與不接受未渲染值。
- [x] 2.2 將旅程物品與預設物品的新增／編輯數量控制改接原生 select，完成 **Item quantity selectors adapt without opening a keyboard**，並保留既有 selector hook、正整數解析與錯誤阻擋；以 Node 測試確認四個入口的標記、提交、取消編輯及只改名稱時的數量持久化。

## 3. 勾選框與列動作一致性

- [x] 3.1 依「**勾勾以容器中心而非 margin 定位**」調整 `style.css`，完成 **Item checkbox indicators remain optically centered**：移除方向性 margin、從可見方框中心定位勾勾，並分離視覺框與至少 44 px coarse-pointer 命中區；以 320 px、390 px、1024 px 的未勾選／已勾選截圖檢查中心、focus ring 與無溢位。
- [x] 3.2 依「**動作儲存格維持 table-cell 並共用 action group**」調整 `app.js` 與 `style.css`，完成 **Item row actions retain consistent geometry across modes**：一般及編輯狀態均由儲存格內共用容器排列按鈕，且 Edit/Delete 與 Save/Cancel 共用外框、圖示、gap、focus 與命中區 token；以 trip item 與 preset item 的模式切換截圖確認欄位中心及按鈕位置不跳動。

## 4. 響應式整合與驗證

- [x] 4.1 依「**內容驅動的響應式尺寸與欄寬**」整合 quantity select、checkbox 與 action group 的 CSS custom properties、`clamp()`、百分比欄寬及 pointer media query；在 320 px、390 px 與至少 1024 px 手動確認表格無水平溢位、select 字級至少 16 px、coarse-pointer 命中區至少 44 px 且相鄰命中區不重疊。
- [x] 4.2 在專案根目錄執行 `node --check app.js`、`node --test tests/trip-data-portability.test.js` 與 `git diff --check`，並以手機瀏覽器確認 quantity select 開啟原生選擇介面而非數字鍵盤；所有命令通過且手機、桌機驗證紀錄涵蓋新增、編輯、儲存、取消、勾選與既有數量 12 後才完成本變更。

