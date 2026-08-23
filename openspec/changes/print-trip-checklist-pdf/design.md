## Context

PackCheck 是以 app.js 為主要狀態與畫面入口的 vanilla-JS SPA。旅程詳情頁目前由 renderTripDetail 顯示旅程名稱、物品輸入表單與互動式物品表格；物品表格中的 departureChecked 與 returnChecked 會在使用者操作時寫回既有的 localStorage 狀態。

本功能的使用情境是把旅程清單分享給同行者或列印後使用，因此輸出必須是可讀、可影印的靜態清單。輸出不需要建立新的資料格式，也不需要後端服務。現有 index.html 只載入 app.js 與 style.css，專案沒有 PDF 產生器依賴。

## Goals / Non-Goals

**Goals:**

- 在旅程詳情標題右側提供清楚的「匯出 PDF」操作。
- 使用瀏覽器原生列印流程，支援另存為 PDF 與直接列印。
- 列印旅程名稱、物品名稱、數量、出發欄與回程欄。
- 每次輸出固定的空白勾選框，完全不受目前 departureChecked 或 returnChecked 值影響。
- 讓列印內容不包含返回導覽、新增表單、編輯／刪除操作與應用程式裝飾。
- 保持螢幕版面、既有勾選互動、localStorage schema 與資料匯入匯出行為不變。

**Non-Goals:**

- 不產生由應用程式直接下載的二進位 PDF 檔案。
- 不引入 jsPDF、PDFKit 或其他第三方 PDF／字型套件。
- 不建立伺服器端 PDF API、分享連結、權限控管或雲端儲存。
- 不把列印後紙本的勾選結果回寫到旅程狀態。
- 不修改既有物品新增、編輯、刪除與螢幕勾選規則。

## Decisions

### Decision: 使用瀏覽器原生列印流程

匯出按鈕 SHALL 呼叫瀏覽器的 window.print()，讓使用者在系統列印對話框選擇列印或另存為 PDF。這能直接支援瀏覽器的中文字型、紙張與印表機設定，且不需要維護新的檔案產生依賴。

替代方案是引入前端 PDF library 直接下載檔案；此方案會增加套件、中文字型嵌入與版面分頁的維護成本，且不是目前「分享或影印」需求的必要條件。伺服器端產 PDF 則需要新增後端與部署邊界，超出本次單頁功能範圍。

### Decision: 建立獨立的列印版 manifest markup

不要直接把互動式 item-table 的 checkbox 狀態改成空白再列印。應由 app.js 產生獨立的列印版 manifest，包含旅程名稱與四欄表格，並在每個出發／回程儲存格放置沒有 checked state 的靜態空白框。互動式表格保留原本的編輯、刪除與勾選行為。

這個邊界讓列印輸出明確不依賴 departureChecked 或 returnChecked，也避免列印期間短暫修改畫面或 localStorage。

### Decision: 使用 print media CSS 切換列印範圍

列印版 manifest 在螢幕上隱藏，列印時顯示；互動式頁面容器、返回連結、新增表單、操作欄與非必要的 App header 在列印時隱藏。列印樣式 SHALL 保留表頭、避免單列被任意切開，並允許多頁清單重複表頭。

螢幕版仍沿用現有 view-header flex 版面：桌面將按鈕放在標題右側，窄螢幕依既有 responsive 規則放到標題下方。列印版不依賴螢幕 viewport 寬度。

### Decision: 不新增持久化資料或 API

列印操作只讀取 renderTripDetail 當下的 trip 與 items，產生 DOM 並呼叫 window.print()。不新增 localStorage 欄位、不改變 packcheck-data JSON envelope、不新增 API。列印完成或取消後，原本的 state 與勾選狀態維持不變。

## Implementation Contract

### Observable behavior

- 在有效的旅程詳情頁，使用者 SHALL 看見位於旅程名稱右側的「匯出 PDF」按鈕。
- 按鈕 SHALL 是非提交型按鈕；點擊後 SHALL 開啟瀏覽器原生列印流程。
- 列印結果 SHALL 顯示旅程名稱與物品表格，欄位順序固定為物品、數量、出發、回程。
- 每個出發與回程欄位 SHALL 顯示空白框；即使畫面上對應物品已勾選，列印結果仍 SHALL 顯示空白框。
- 列印結果 SHALL 不顯示返回連結、新增物品表單、編輯按鈕、刪除按鈕、互動式 checkbox 與不必要的 App header。
- 沒有物品的旅程 SHALL 顯示旅程名稱與明確的空清單訊息，不得顯示操作表單。

### Interface and data shape

- app.js SHALL 提供列印版 manifest 的純 markup 產生邏輯，例如 buildTripPrintManifest(trip)，其輸出只使用 trip.name、item.name 與 item.qty；輸出不得以 item.departureChecked 或 item.returnChecked 決定框的顯示狀態。
- renderTripDetail SHALL 將列印版 manifest 與匯出 PDF 按鈕放入旅程詳情頁。
- 列印按鈕事件 SHALL 呼叫 window.print()，且不得呼叫 saveState()、改寫 state 或建立新的資料匯出 payload。
- style.css SHALL 定義螢幕隱藏與 @media print 顯示／隱藏規則，並提供適合紙本閱讀的表格、邊距與分頁樣式。

### Failure behavior

- 旅程 ID 無效時維持現有 router 行為，導向旅程列表；不得建立列印內容。
- 當瀏覽器不提供可呼叫的 window.print() 時，點擊操作不得修改旅程資料或勾選狀態；實作者 SHALL 提供不造成未捕捉例外的退化行為。
- 列印對話框取消時，頁面狀態 SHALL 與點擊前完全相同。

### Acceptance criteria

- Node VM tests verify the print manifest includes the trip name, item name, quantity, exactly two static blank check-box cells per item, and excludes persisted check values from output.
- Node VM tests verify the print action invokes a supplied window.print stub and does not invoke saveState or mutate the trip fixture.
- A browser smoke check verifies desktop right alignment, narrow-screen placement, print-only visibility, hidden interactive controls, and a multi-item printed table.
- spectra validate and the repository test command complete successfully.

### Scope boundaries

In scope: app.js markup and event binding, style.css screen/print rules, focused Node VM coverage, and manual browser print verification.

Out of scope: direct PDF binary generation, third-party dependencies, backend endpoints, cloud sharing, authentication, printer-specific configuration, and syncing paper check marks back into PackCheck.

## Risks / Trade-offs

- [Risk] Browser print dialogs and PDF filenames differ by browser and operating system → [Mitigation] Treat native print／save as PDF as the supported contract and verify the rendered page rather than asserting a binary filename.
- [Risk] Chinese text or long item names wrap differently on paper → [Mitigation] Use normal table wrapping, print-safe margins, repeated headers, and a manual check with representative Chinese names.
- [Risk] A future UI change accidentally appears in the PDF → [Mitigation] Keep a dedicated print manifest and explicit @media print visibility rules instead of printing the entire interactive screen.
- [Risk] A user expects current check progress to appear in the PDF → [Mitigation] Make the blank-box behavior explicit in the button flow, spec scenarios, and tests.

## Migration Plan

No data migration or deployment migration is required. Release the updated app.js and style.css together. Rollback consists of restoring those two files; existing localStorage data remains compatible because no persisted shape changes.

## Open Questions

None. The output intentionally uses blank boxes on every export, and native browser printing is the selected delivery mechanism.
