## 1. 測試契約

- [x] 1.1 在 `tests/trip-data-portability.test.js` 擴充 Item row actions retain consistent geometry across modes 的回歸斷言，涵蓋共用操作欄可容納兩個 44 × 44 px 觸控目標、間距與儲存格內距，且旅程物品、常用物品及預設物品均使用相同規則；從專案根目錄執行 `node --test tests/trip-data-portability.test.js`，確認新增測試在修正前能偵測目前的寬度衝突。

## 2. 響應式版面修正

- [x] 2.1 在 `style.css` 調整手機版 `.col-actions`、`.action-group` 與 `.btn-icon` 的寬度預算及縮放行為，使編輯／刪除和儲存／取消在 320、375、390、430 px 視窗內均完整顯示，同時維持粗略指標下至少 44 × 44 px 的觸控目標；從專案根目錄執行 `node --test tests/trip-data-portability.test.js`，確認 CSS 契約測試全部通過。
- [x] 2.2 確認長物品名稱只在名稱欄換行，且數量、出發、回程與操作欄不被擠出表格；使用瀏覽器檢查旅程物品、常用物品及預設物品的一般與編輯狀態，確認 `document.documentElement.scrollWidth` 不大於 `document.documentElement.clientWidth`。

## 3. 跨尺寸驗收

- [x] 3.1 從專案根目錄執行 `python -m http.server 4173`，在 320、375、390、430 px 手機直向視窗逐一驗證三種表格的編輯／刪除與儲存／取消按鈕完整位於容器內、相鄰點擊區不重疊，並在至少 1024 px 桌面視窗確認既有表格配置未改變。
- [x] 3.2 從專案根目錄執行 `node --test tests/trip-data-portability.test.js` 與 `spectra validate fix-mobile-action-button-clipping`，確認完整測試套件與 Spectra 規格驗證皆成功。

## 驗收備註

- 2026-09-18：本機沒有可連線的瀏覽器；依使用者指示，2.2 與 3.1 的實際 viewport／手機驗收延後至 GitHub Pages 部署後進行，不阻擋本次 apply 完成。
