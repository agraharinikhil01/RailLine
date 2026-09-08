# 🚆 RailLine — Railway Journey Intelligence Platform

> A premium railway tracking and journey intelligence platform combining real-time train movement, interactive dark-themed navigation maps, station halts, ETA calculations, and journey progress.

---

## Architecture Overview

```
railline/
│
├── apps/
│   ├── web/                     # React 18 + Vite + Tailwind + MapLibre GL
│   │   ├── src/
│   │   │   ├── components/      # UI components (Button, Badge, Skeleton, ErrorState)
│   │   │   ├── components/map/  # JourneyMap with MapLibre & animated train marker
│   │   │   ├── components/journey/ # TrainHeader, StatusBadge, NextStation, Timeline
│   │   │   ├── features/        # Train search, live tracking
│   │   │   ├── hooks/           # useLiveStatus, useTrainSearch, useRouteGeometry
│   │   │   ├── pages/           # Home, Journey Dashboard
│   │   │   └── services/        # API client & trainService
│   │   └── tailwind.config.js   # Design system tokens (Apple Maps × Linear × Stripe)
│   │
│   └── api/                     # Fastify + TypeScript backend
│       ├── src/
│       │   ├── config/          # Zod environment validation
│       │   ├── providers/       # TrainProvider abstraction & MockTrainProvider
│       │   ├── services/        # trainService, liveStatusService
│       │   ├── routes/          # /api/v1/trains/*
│       │   └── utils/           # Error contract & custom AppErrors
│       └── test/                # Automated integration tests
│
├── packages/
│   └── types/                   # Shared TypeScript domain contracts
│
├── design.md                    # RailLine design system specification
└── package.json                 # npm workspaces configuration
```

---

## Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

### 2. Installation
```bash
npm install
npm run build
```

### 3. Run Development Servers
To run both backend and frontend concurrently:
```bash
# Terminal 1 (Backend API on http://localhost:3001)
npm run dev:api

# Terminal 2 (Frontend on http://localhost:5173)
npm run dev:web
```

Open `http://localhost:5173` in your browser.

---

## Running Automated Tests

```bash
npm test
```
Runs 9 comprehensive backend integration tests covering:
- Health check
- Number and name search with debouncing logic
- 400 validation error contracts
- Full train details and route stations
- Live telemetry calculation, progress percentage, distance covered
- Route GeoJSON LineString segments (completed vs remaining)
- Station timeline halts
- 404 error contract for non-existent trains

---

## Key Features in Phase 1

1. **Instant Search:** Search by train number (e.g., `12951`) or name (e.g., `Shatabdi`), with recent searches stored locally.
2. **Flagship Journey Dashboard:**
   - Train identity, running status badge (`ON TIME`, `DELAYED`, `ARRIVED`), and live radar telemetry indicator.
   - Current halt card with platform and arrival time.
   - Next station card with ETA, remaining distance, and delay.
   - Route-aware progress bar with percentage and km traveled.
   - Live telemetry cards: Speed (km/h), delay trend, final destination ETA, and track heading.
3. **Interactive Navigation Map:**
   - Powered by MapLibre GL JS with low-noise dark theme.
   - Real-time animated train marker with bearing orientation and radar pulse.
   - Glowing electric cyan line for completed route and muted slate line for remaining route.
   - Interactive station halt markers.
   - Camera follow mode toggle, north reset, and fullscreen view.
4. **Station Timeline:** Complete halts with arrival history, scheduled vs actual timings, and platform numbers.
5. **Auto-refresh Telemetry:** 30-second polling interval with "Updated X seconds ago" counter and manual refresh trigger.
