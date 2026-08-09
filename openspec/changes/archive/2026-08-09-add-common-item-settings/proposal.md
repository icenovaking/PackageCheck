## Why

目前 PackCheck 只有旅程類型的預設物品，常用物品無法集中管理，導致相同物品需要在不同旅程或旅程類型中重複輸入。新增共用常用物品清單可降低輸入成本，並讓旅程與旅程類型使用一致的物品選項。

## What Changes

- 新增「常用物品設定」分頁與管理介面，可新增、編輯、刪除常用物品。
- 在旅程類型的預設物品表單加入常用物品下拉選單。
- 在實際旅程的新增物品表單加入常用物品下拉選單。
- 手動輸入與常用物品選取維持二選一，互相停用並在送出時再次驗證。
- 常用物品只提供名稱來源；數量仍由目前的旅程或旅程類型表單輸入。
- 選取常用物品後複製名稱到目標清單，不建立 commonItemId 關聯。
- 同一常用物品清單、同一旅程及同一旅程類型預設清單不得建立重複名稱。
- 匯出與匯入 JSON 納入 commonItems，並兼容沒有常用物品資料的舊匯出檔。
- 匯入時同時依 ID 與正規化名稱判斷常用物品重複，保留本機資料並略過衝突項目。

## Capabilities

### New Capabilities

- common-item-settings: 管理可在旅程與旅程類型中重複使用的常用物品清單。

### Modified Capabilities

- item-management: 新增物品時支援常用物品選取、互斥輸入與同名阻擋。
- trip-type-presets: 新增預設物品時支援常用物品選取、互斥輸入與同名阻擋。
- trip-data-portability: 匯出與匯入常用物品設定，並定義 ID 與名稱衝突處理。

## Impact

- Affected specs:
  - common-item-settings
  - item-management
  - trip-type-presets
  - trip-data-portability
- Affected code:
  - New: none
  - Modified:
    - app.js
    - style.css
    - tests/trip-data-portability.test.js
  - Removed: none
