## 1. 匯出資料封裝

- [x] 1.1 依 design.md 的 Decision: Use a versioned JSON package 與 Requirement: Export the complete current data set，實作可從目前 state 建立 format=packcheck-data、version=1、exportedAt 與 data.trips/data.tripTypes 的匯出封裝；驗證方式：以包含旅程、勾選項目、旅程類型與預設項目的實際 state 觸發 匯出設定，解析下載檔並逐欄核對內容。
- [x] 1.2 依 design.md 的 Decision: Use native browser file APIs，完成 Blob、object URL、download link 與具時間戳檔名的瀏覽器下載流程；驗證方式：在支援下載的瀏覽器中點擊 匯出設定，確認恰好下載一個可解析的 JSON 檔且匯出前後畫面資料相同。

## 2. 匯入驗證與合併

- [x] 2.1 依 design.md 的 Decision: Validate and merge atomically 與 Requirement: Accept only a supported data package，建立純資料驗證流程，檢查 format、version、陣列、必要欄位、正整數數量、布林勾選狀態與未解析的 typeIds；驗證方式：分別送入有效套件、格式錯誤 JSON、錯誤 version、缺少陣列、負數 qty 與未解析 typeIds，確認只有有效套件通過且失敗案例不改變 state。
- [x] 2.2 依 design.md 的 Decision: Merge by ID with local records taking precedence 與 Requirement: Merge imported records by ID，將不存在的 tripTypes 與 trips 加入目前 state，並讓現有相同 ID 的本機記錄保持不變；驗證方式：匯入包含一筆重複旅程、一筆新旅程與一筆新類型的套件，確認新增數量為一筆旅程與一筆類型，且重複記錄內容仍以本機版本為準。
- [x] 2.3 依 design.md 的 Merge behavior 與 Requirement: Preserve imported relationships and item state，保留新旅程的 typeIds、typeDisplay、item IDs、名稱、數量、createdAt、departureChecked 與 returnChecked，並確認每個 typeIds 都指向合併後可用的類型；驗證方式：匯入帶有 checked item 與關聯類型的固定資料，檢查畫面與 localStorage 逐欄一致。
- [x] 2.4 依 design.md 的 Data shape，將匯入處理限制在 version 1 的 canonical state shape，並避免把未知欄位當成應用程式行為；驗證方式：以包含額外未知欄位但其他欄位有效的套件測試，確認核心資料可匯入且未建立未定義的狀態分支。

## 3. 首頁轉移介面

- [x] 3.1 依 design.md 的 Observable behavior 與 Requirement: Keep transfer controls usable from the header，在 trip list header 顯示 匯出設定 與 匯入設定，加入可由鍵盤操作的 JSON file input，並在處理完成後重設 input value；驗證方式：以滑鼠與鍵盤分別啟動兩個控制項，確認匯出可下載、匯入可開啟 JSON file picker，並可再次選取同一檔案。
- [x] 3.2 依 design.md 的 Decision: Report transfer results in the existing UI，顯示匯出成功、匯入新增旅程／類型數量、跳過重複數量與失敗原因；驗證方式：分別完成成功匯出、首次匯入、重複匯入與錯誤檔案匯入，確認每一種結果都有對應可讀訊息。
- [x] 3.3 調整 app.js、index.html 與 style.css，使轉移控制項符合現有 header 的視覺與 responsive layout，並保持既有返回、設定與旅程操作入口可用；驗證方式：在桌面與窄視窗檢查 header 不溢出，並逐一點擊既有旅程、類型設定、編輯與刪除操作。

## 4. 持久化與完整驗證

- [x] 4.1 依 Requirement: Persist successful imports and report the result，將成功合併以單次 localStorage 寫入並重新渲染 trip list；驗證方式：匯入新資料後重新整理頁面，確認新增旅程與類型仍存在，且 localStorage 的 packcheck_data 包含合併結果。
- [x] 4.2 依 design.md 的 Failure modes 與 Acceptance criteria，確保檔案讀取、JSON parse、欄位驗證、localStorage 寫入失敗都不會宣稱錯誤操作成功，並確認錯誤匯入不會部分套用；驗證方式：執行完整手動案例矩陣，包含空檔、非 JSON、錯誤 schema、重複匯入、有效匯入與儲存不可用情境。
- [x] 4.3 依 design.md 的 Scope boundaries，執行既有旅程建立、物品新增／編輯／勾選、旅程類型管理、hash 路由與 localStorage reload 回歸檢查；驗證方式：直接在瀏覽器開啟 index.html 完成回歸流程，並以 node --check app.js 檢查 JavaScript 語法。
