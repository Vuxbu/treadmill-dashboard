# 🏃‍♂️ Treadmill Dashboard Project — Developer Notes

_Last updated: **15/08/2025, 6:05:11 pm**_

## 📌 Project Summary
We are building a **React + TypeScript + Tailwind CSS** web app to display live metrics from a **Woodway treadmill** and **Garmin HRM Pro**, inspired by **Woodway consoles, Zwift, and Peloton**.

---

## ✅ Pages Status
- ✅ Home
- ✅ IntervalTraining
- ✅ ThresholdTraining
- ✅ RoadRun
- ✅ JustRun
- ✅ Settings

---

## 🗺️ Active Routes (from `src/App.tsx`)
- `/` → `Home`
- `/interval` → `IntervalTraining`
- `/threshold` → `ThresholdTraining`
- `/road` → `RoadRun`
- `/just` → `JustRun`
- `/settings` → `Settings`



---

## 🧩 Components
- Header.tsx
- HexagonButton.tsx
- MetricTile.tsx
- Modal.tsx
- icons/BluetoothIcon.tsx
- icons/CadenceIcon.tsx
- icons/GearIcon.tsx
- icons/HeartIcon.tsx
- icons/RunIcon.tsx

---

## 🧠 Context Inventory
- DummyDataContext.tsx
- WebSocketContext.tsx → exports: `socket`, `connected`, `devices`, `connectMock`, `disconnect`, `pairSingleDevice`

---

## 🎨 Tailwind Config (summary)
**Colors:** `ui`, `bg`, `panel`, `accent`, `accent2`, `warn`


**Fonts:** `display`


---

## 🖼️ Public Assets (images)
- vite.svg

---

## 📝 Recent Changes (last 5 in /src)
- src/pages/Settings.tsx — 15/08/2025, 5:33:35 pm
- src/context/WebSocketContext.tsx — 15/08/2025, 5:32:54 pm
- src/App.tsx — 15/08/2025, 4:31:52 pm
- src/pages/Home.tsx — 15/08/2025, 4:30:31 pm
- src/components/icons/GearIcon.tsx — 15/08/2025, 4:02:01 pm

---

## 🔧 TODOs Found in Code
_No TODO comments found_

---

## 📅 Next Planned Steps
1. Enhance single-category scan modal with animated device discovery (match Home SCAN modal).
2. Backend pairing simulation (Python) to simulate Bluetooth device discovery.
3. Implement workout modes UI.
4. Expand Settings with HR zone config, .fit loader, .gpx/.tcx course loader.

---

## 🛠 Development Flow
1. Edit `.tsx` page/component
2. Save — Vite hot reload refreshes instantly
3. Use `connectMock()` for UI pairing testing
4. Replace mock pairing with backend WebSocket integration
