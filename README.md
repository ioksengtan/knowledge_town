# 科技知識苑

以「收集 + 建設」為核心迴圈的科技知識吸收平台。完整產品規格見對話中上傳的 v7.2 規格書；本次實作留下的補充文件：

- `docs/implementation-decisions.md` — 規格書列為「待定案」的數值/規則，這次實作暫定的選擇與理由
- `docs/art-spec.md` — Last War 寫實軍事風主題的美術資產規格（4 分類 × 5 階段建築 + 總部 + 世界地圖島嶼），目前程式碼用簡化色塊佔位

## 技術棧

React + TypeScript + Vite，Zustand（含 localStorage persist）做狀態管理，react-router-dom 做路由。純前端、無後端，存檔在瀏覽器本機。

## 開發

```bash
npm install
npm run dev       # 開發伺服器
npm run build     # 型別檢查 + 產出 build
npm run lint       # oxlint
```

## 畫面

- 世界地圖（`/`）：多張城鎮地圖總覽，可隨時新增地圖
- 城鎮（`/map/:mapId`）：總部 + 一整塊開放可建地，升級總部／建築、擴地、新建領域
- 建築詳情（`/map/:mapId/domain/:domainId`）：領域內的知識卡片（問答／閱讀）
- 圖鑑（`/compendium`）：依地圖分組的全部卡片總覽
