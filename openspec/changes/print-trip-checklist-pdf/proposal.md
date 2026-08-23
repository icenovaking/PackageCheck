## Why

旅程詳情頁目前只有瀏覽器畫面中的行李清單，使用者無法快速取得適合分享或影印的清單版本。新增 PDF 列印輸出後，可以把同一趟旅程的物品名稱、數量與去程／回程檢查欄位交給同行者使用，同時保留原本旅程資料不變。

## What Changes

- 在旅程詳情頁的旅程標題右側新增「匯出 PDF」操作。
- 點擊操作後開啟瀏覽器列印流程，讓使用者選擇另存為 PDF 或直接列印。
- 列印內容以旅程名稱作為識別，輸出物品名稱、數量、出發空白勾選框與回程空白勾選框。
- PDF 每次都輸出空白勾選框，不帶入畫面目前已儲存的 departureChecked 或 returnChecked 狀態。
- 列印版本隱藏返回旅程、新增物品表單、編輯／刪除操作，以及不需要分享的應用程式裝飾。
- 不新增第三方 PDF 套件、不修改 localStorage 資料格式，也不改變畫面中原本的勾選與儲存行為。

## Capabilities

### New Capabilities

- trip-checklist-pdf: 從旅程詳情頁列印或另存一份含空白檢查欄位的旅程物品清單。

### Modified Capabilities

- (none)

## Impact

- Affected specs: trip-checklist-pdf (new)
- Affected code:
  - New: (none)
  - Modified: app.js, style.css, tests/trip-data-portability.test.js
  - Removed: (none)
- Dependencies: 瀏覽器原生列印功能與 print media CSS；不引入外部 PDF 產生器。
