# 筑览 ZhuLan — Atlas of Ancient Chinese Architecture

An interactive web application for exploring China's pre-1911 architectural heritage. Built for the **2026 (19th) Chinese Collegiate Computing Competition (4C)**, Category 6: AI + Information Visualization Design.

**Live demo:** https://farhankk360.github.io/zhulan/

---

## Features

- **Interactive Map** — explore 50–100+ historical structures across China, filtered by type and dynasty, powered by Tianditu (天地图)
- **Dynasty Timeline** — D3.js charts visualizing architectural output across Chinese history
- **Rich Detail Panels** — curated entries with descriptions, key features, and AI-generated illustrations
- **Scan & Discover (筑览识图)** — photograph or upload an image of a historical structure; Tongyi Qwen-VL identifies it, locates it on the map, and presents historical context

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Map | Leaflet.js + react-leaflet + Tianditu tiles |
| Charts | D3.js v7 |
| Styling | Tailwind CSS v3 |
| AI Feature | Tongyi Qwen-VL via Dashscope API |
| Data | Static JSON + Wikidata SPARQL |
| Deployment | GitHub Pages |

## AI Tools Used

| Purpose | Tool |
|---|---|
| Historical research & Chinese text | DeepSeek |
| Literature review & fact-checking | Kimi |
| Structure illustrations | Tongyi (image generation) |
| **Runtime photo identification** | **Tongyi Qwen-VL (Dashscope API)** |
| Bulk architectural data | Wikidata SPARQL |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Install
```bash
git clone https://github.com/farhankk360/zhulan.git
cd zhulan
npm install
```

### Environment variables
Copy `env.example` to `.env` and fill in your API keys:
```bash
cp env.example .env
```

```
VITE_TIANDITU_KEY=    # Get from https://console.tianditu.gov.cn/
VITE_DASHSCOPE_KEY=   # Get from https://dashscope.console.aliyun.com/
```

> Without `VITE_TIANDITU_KEY`, the map falls back to OpenStreetMap (fine for local dev).
> Without `VITE_DASHSCOPE_KEY`, the Scan & Discover feature will be disabled.

### Run locally
```bash
npm run dev
# → http://localhost:5173
```

### Available commands
```bash
npm run dev          # Dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run fetch-data   # Refresh data from Wikidata → writes src/data/structures.json
npm run deploy       # Build + deploy to GitHub Pages
```

---

## Data

The dataset combines two tiers:

- **Curated entries** (`src/data/curated.json`) — hand-researched featured structures with full descriptions, key features, and AI-generated illustrations
- **Wikidata entries** — bulk-fetched via SPARQL at build time; provides 50–100+ data points for the map and charts

Run `npm run fetch-data` to refresh Wikidata entries. The merged output is written to `src/data/structures.json` (committed to the repo).

Structure types covered: **palace (皇宫)**, **residence (民居)**, **government building (官府)**, **bridge (桥梁)** — all pre-1911.

---

## Deployment (GitHub Pages)

```bash
npm run deploy
```

This runs `vite build` then pushes `/dist` to the `gh-pages` branch. Enable GitHub Pages in your repo settings, set source to the `gh-pages` branch.

The app uses `HashRouter` for client-side routing compatibility with GitHub Pages.

> Set API keys as repository secrets and inject them at build time via a GitHub Actions workflow if you don't want to commit them.

---

## Project Structure

```
src/
├── components/
│   ├── Map/           # Leaflet map, Tianditu tiles, markers
│   ├── Charts/        # D3 timeline and dynasty charts
│   ├── InfoPanel/     # Structure detail panel
│   ├── Filters/       # Type/dynasty/province filters
│   └── ScanDiscover/  # 筑览识图 — camera capture + AI identification
├── views/             # MapView, TimelineView, AboutView
├── services/
│   └── qwenVL.ts      # Dashscope API client
├── data/              # JSON datasets
└── types/             # TypeScript interfaces
```

---

## Competition

**2026 (19th) Chinese Collegiate Computing Competition (4C)**
Category 6: AI + Information Visualization Design
Sub-tracks: Interactive Information Design + Data Visualization
