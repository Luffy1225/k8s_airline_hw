# EVA AIRWAYS VIRTUAL - 尊榮航空訂票與即時航網雷達系統

本專案為完整的航空線上訂票與全球航機即時雷達追蹤 Web 應用系統。視覺風格參考 `D:\AntiProject\EVA_VA\BRVA_Web` 之五星級奢華航空美學（未更動該專案任何程式），採用古典襯線字體 `Playfair Display` 與現代極簡字體 `Plus Jakarta Sans`，並全面導入專屬五色色卡。

---

## 🎨 專屬色卡規範 (Color Palette)

- **Deep Mocha (`#3d2c2e`)**：主色調、主要按鈕（搜尋、結帳）、標題、登機證頂部。
- **Charcoal Blue (`#424c55`)**：副文字、雷達 HUD 輔助深色、卡片標籤。
- **Lavender Blush (`#f5edf0`)**：全站主體背景、卡片溫潤柔和底色。
- **Taupe (`#886f68`)**：奢華金棕點綴色、大圓航線路徑、艙等專屬標章、選定座位高亮。
- **Lavender (`#d1ccdc`)**：卡片精緻邊框、軟性高亮底色。

---

## ✈️ 核心功能模組

1. **即時飛航雷達地圖 (Live Flight Radar)**：
   - 全球互動式地圖（CartoDB Voyager + Leaflet），即時展示長榮航空在空執飛的 18 架客機。
   - 動態計算大圓航線（Great Circle Navigation）與航機姿態角（Heading 旋轉）。
   - 點擊飛機即時開啟遙測 HUD 卡片（巡航高度、地速、航向、ETA、航程百分比）。
   - 支援北美長程、歐洲航線、亞洲區域篩選與航班號即時檢索。
   - 支援「特寫追蹤」與「一鍵預訂此航線」。

2. **航班時刻表 (Global Flight Timetable)**：
   - 支援出發地、目的地、執電機型（B787-9、B777-300ER、A350-900、A321neo）篩選。
   - 顯示執飛週期、準點率、起降時間（附當地時區）、單程預估票價，並可一鍵直達預約流程。

3. **完整線上預訂流程 (Booking Engine)**：
   - **Step 1 方案選擇**：輕省 (Basic)、標準 (Standard - 推薦)、尊榮暢行 (Flex) 票價與行李權益比價。
   - **Step 2 旅客資料**：支援多位成人旅客資料填寫、特殊餐點偏好（素食、水果餐、潔食等）與聯絡人資料。
   - **Step 3 互動客艙選位 (Interactive Seat Map)**：擬真呈現波音客機客艙剖面，支援皇璽商務艙 (1-2-1 反魚骨) 與經濟艙 (3-3-3)，每位旅客獨立劃位與即時座位狀態更新。
   - **Step 4 確認開票**：即時發行專屬 6 碼訂位代號 (PNR，如 `BR5LW6`)。

4. **精品電子登機證 (Luxury Electronic Boarding Pass)**：
   - 擬真登機證排版（撕票齒孔邊緣、條碼與電子機票號碼、登機門、登機時間、座位號）。
   - 支援一鍵列印或另存 PDF。

5. **行程管理 (Manage Booking)**：
   - 輸入 6 碼訂位代號 (PNR) 與旅客英文姓氏即可隨時調閱行程並補印登機證。
   - 內建一鍵填入測試訂單按鈕 (`BR5LW6` / `WANG`) 方便評測。

6. **先進機隊與極致客艙 (Fleet & Cabins)**：
   - 介紹波音 787-9、波音 777-300ER、A350-900、A321neo 之載客量、航程、巡航速度與客艙特色。

---

## 🚀 啟動方式

### 方法 A：一鍵啟動（推薦）
在專案根目錄雙擊執行：
```powershell
.\run.bat
```
或在終端機中執行：
```powershell
cd backend
..\venv\Scripts\python.exe app.py
```
啟動後打開瀏覽器訪問：**http://127.0.0.1:5000** 即可使用完整功能！

### 方法 B：前後端熱重載開發模式 (Hot-Reload)
1. **後端 (Terminal 1)**：
   ```powershell
   cd backend
   ..\venv\Scripts\python.exe app.py
   ```
2. **前端 (Terminal 2)**：
   ```powershell
   cd frontend
   pnpm run dev
   ```
   瀏覽器訪問：**http://localhost:5173**
