## Summary

改善旅程物品表格的勾選、數量選擇與編輯動作控制，使手機觸控操作更容易，同時維持桌機版的表格一致性。

## Motivation

目前自訂勾勾以固定邊距定位，縮放後無法穩定置中；數量必須手動輸入，在手機上會叫出鍵盤；編輯狀態的儲存與取消按鈕又使用不同的圖示尺寸及表格配置，導致按鈕大小和位置與一般狀態不一致。這些問題會降低行李清單在手機上的操作效率，也讓相同功能在不同 viewport 呈現不一致。

## Proposed Solution

- 將自訂勾選框改為以容器中心定位勾勾，視覺尺寸與觸控區域分離，並讓比例能隨既有響應式規則調整。
- 將新增與編輯物品時的主要數量輸入改為 1 至 10 的原生下拉選擇，避免手機鍵盤介入。
- 對既有或匯入後大於 10 的正整數數量維持可顯示、可保留且可重新儲存，不因新選單範圍而被截斷或改值。
- 讓一般狀態的編輯／刪除與編輯狀態的儲存／取消共用相同按鈕、圖示、間距及欄位對齊規則。
- 使用內容驅動的響應式欄寬與 pointer 能力調整觸控區域，避免只針對單一手機尺寸寫死。

## Alternatives Considered

- 在數量欄放置減號、數值與加號：狹窄表格無法同時容納三個足夠大的觸控目標，會壓縮物品名稱與勾選欄。
- 保留數字鍵盤輸入並只加上 inputmode：仍要求使用者手動輸入，未解決主要操作負擔。
- 為手機建立獨立版面：會造成手機與桌機兩套行為及維護成本，本次改用同一份語意標記搭配響應式樣式。

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `item-management`: 新增與編輯物品的數量選擇改為 1 至 10 的原生選單，並定義大於 10 的既有有效數量之相容行為。
- `trip-type-presets`: 新增與編輯預設物品時採用相同的數量選擇及既有大於 10 數量相容行為。
- `responsive-layout`: 定義勾選框中心對齊、表格動作按鈕一致性及手機／桌機共用的響應式控制規則。

## Impact

- Affected specs: item-management, trip-type-presets, responsive-layout
- Affected code:
  - Modified: app.js
  - Modified: style.css
  - Modified: tests/trip-data-portability.test.js
  - New: none
  - Removed: none
- APIs and dependencies: 不新增外部套件、不變更 localStorage 結構，也不變更匯出／匯入資料格式。

