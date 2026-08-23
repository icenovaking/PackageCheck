## 1. 建立旅程列印輸出

- [x] 1.1 依據 Decision: 使用瀏覽器原生列印流程、Requirement: Trip detail SHALL expose a checklist print action 與 Requirement: The print action SHALL use the browser print flow，在 app.js 的旅程詳情標題右側加入非提交型「匯出 PDF」按鈕，並綁定安全呼叫 window.print() 的事件；驗證 Node VM 測試可攔截 window.print 呼叫，且瀏覽器手動檢查桌面版按鈕位於標題右側、窄螢幕仍可操作。
- [x] 1.2 依據 Decision: 建立獨立的列印版 manifest markup、Requirement: The printable manifest SHALL contain the trip checklist fields 與 Requirement: An empty trip SHALL have a printable empty state，在 app.js 建立獨立列印 manifest markup，輸出旅程名稱、依目前順序排列的物品名稱與數量、出發欄及回程欄；無物品時輸出旅程名稱與空清單訊息，不帶入新增表單；驗證 Node VM 測試檢查欄位順序、兩筆物品資料與空清單輸出。
- [x] 1.3 依據 Decision: 不新增持久化資料或 API、Requirement: Printable checkboxes SHALL always be blank 與 Requirement: Printing SHALL NOT modify trip data，讓列印版每筆資料使用固定的兩個靜態空白框，且產生 markup 與呼叫 window.print() 都不讀寫 checked 狀態、不呼叫 saveState()；驗證以 departureChecked=true、returnChecked=true 的 fixture 檢查輸出仍為兩個空白框，並比較列印前後 state JSON 完全相同。

## 2. 建立紙本版面與列印邊界

- [x] 2.1 依據 Decision: 使用 print media CSS 切換列印範圍、Requirement: Print output SHALL exclude interactive controls 與 Requirement: Trip detail SHALL expose a checklist print action，在 style.css 加入螢幕／列印顯示規則：螢幕隱藏列印 manifest，列印隱藏返回連結、App header、新增表單、互動 checkbox 與編輯／刪除欄，並保留旅程名稱、表頭、物品列與空白框；驗證瀏覽器列印預覽只顯示清單內容，且桌面與 320 px 寬度畫面沒有新的水平溢位。
- [x] 2.2 依據 Requirement: Long manifests SHALL remain printable across pages，為列印表格設定紙本邊距、可讀的欄寬與跨頁表頭，並避免單筆物品列在支援該 CSS 的瀏覽器中被切開；驗證以至少 20 筆物品開啟列印預覽，確認所有資料都存在且第二頁仍有表頭。
- [x] 2.3 依據 Requirement: An empty trip SHALL have a printable empty state，確認空旅程的列印 manifest 不顯示互動式空表單、不產生無意義的 checkbox input，且空清單訊息在列印版面中清楚可見；驗證以沒有 items 的旅程進行瀏覽器列印預覽與 Node VM markup assertion。

## 3. 測試、審查與驗證

- [x] 3.1 依據 Observable behavior 與 Interface and data shape，在 tests/trip-data-portability.test.js 補充列印 manifest、按鈕 markup、window.print stub、空白框與 state 不變的 Node VM 測試；驗證每個測試以具名 test case 通過，並覆蓋至少一個已勾選物品與一個空旅程。
- [x] 3.2 依據 Failure behavior，為 window.print 不可用與列印對話框取消的退化路徑加入測試或手動檢查，確認操作不拋出未捕捉例外、不修改旅程資料，無效旅程仍遵循既有 router 導向旅程列表；驗證以 stub 移除 window.print 並檢查 state snapshot，另以瀏覽器取消列印後重新勾選物品確認互動正常。
- [x] 3.3 依據 Acceptance criteria，執行 node --test tests/trip-data-portability.test.js、spectra analyze print-trip-checklist-pdf --json 與 spectra validate print-trip-checklist-pdf；驗證測試、Critical／Warning analyzer findings 與 Spectra validation 都沒有失敗。
- [x] 3.4 依據 Scope boundaries，審查變更只涉及 app.js、style.css 與既有 Node VM 測試，不新增 PDF 套件、API、localStorage 欄位或 binary file download；驗證檢查 package／index 依賴、git diff 與 proposal、design、spec、tasks 的路徑及行為描述一致。
