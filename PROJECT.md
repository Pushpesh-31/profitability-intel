# PROJECT.md — Profitability Intelligence Dashboard

**Version:** 1.1
**Last Updated:** February 2026
**Status:** 🟡 In Development

---

## Problem Statement

Industrial automation and process simulation software companies (Honeywell, Schneider Electric, ABB, Rockwell, SLB, Emerson, and others) compete in a complex market. Understanding the financial health, profitability drivers, and value creation of these peers — and of key customers — is essential for:

- Pricing strategy decisions
- Partnership and acquisition conversations (e.g. NVIDIA)
- Board-level competitive positioning
- Customer financial health assessment (are they investing or cutting?)
- SPE and AI4Energy industry benchmarking

Currently this analysis lives in a static Excel spreadsheet (Profitability_Analysis.xlsx) that requires manual updating. This app replaces it with a live, interactive dashboard that pulls real financial data by ticker.

---

## Company Categories

Companies are tagged as one of three types. The category affects filtering, badge colors, and how comparisons are framed.

```
COMPETITOR  —  Direct or adjacent software/automation competitors
CUSTOMER    —  Energy, O&G, chemicals companies that buy industrial software
REFERENCE   —  Benchmark companies (user's own company)
```

---

## Phases & Roadmap

### ✅ Phase 0 — Prototype (Done in claude.ai)
- Single-file React artifact with seed data
- DuPont decomposition computed correctly
- Radar, bar, and comparison table charts

### 🔨 Phase 1 — Local MVP (Current Sprint)
- Vite + React + TypeScript + Tailwind scaffold
- Express proxy server for Yahoo Finance API
- Ticker input + category selector → fetch real financials → compute DuPont
- Dashboard UI matching the prototype aesthetic:
  - Header with category selector (Competitor / Customer / Reference) + ticker input
  - Filter tabs: All | Competitors | Customers | Reference (with count badges)
  - Company pill tabs (filtered by active tab, with category dot)
  - KPI cards: Revenue, Net Income, ROE, ROA, Gross Margin, Leverage
  - DuPont decomposition chain: ROS × TATO × Leverage = ROE
  - Abnormal ROE indicator (value creating vs destroying)
  - Peer comparison table with category badges and spark bars
  - Radar chart (normalized, respects active filter)
  - Margin bar chart
  - **Assumptions panel** (collapsible — see below)
- Seed data pre-loaded: Schneider Electric, Honeywell, Emerson Automation, SLB
- In-memory caching (1 hour TTL on proxy)

### Assumptions Panel (Phase 1 — user-adjustable)
All values live in the Zustand store. Changing any value instantly recomputes all metrics.

| Setting | Default | Range | Control |
|---|---|---|---|
| Risk-Free Rate | 4.50% | 0% – 10% | Slider, step 0.1% |
| Equity Risk Premium | 5.50% | 3% – 9% | Slider, step 0.1% |
| COE per company | CAPM computed | any % | Number input per row, with Reset |

The per-company override table shows: Ticker | Category | CAPM COE | Override | Reset

### 🔮 Phase 2 — Intelligence Layer
- Claude API generates 3-sentence strategic narrative comparing selected peers
- Year-over-year trend toggle (FY2022 / FY2023 / FY2024)
- localStorage persistence (watchlist + assumption overrides between sessions)
- Export to PDF (one-page competitive snapshot)

### 🚀 Phase 3 — Team Deployment
- Deploy frontend to Vercel
- Deploy backend proxy to Railway or Render
- Simple shared-token password protection
- Mobile-responsive layout

---

## Key Financial Concepts

### DuPont ROE Decomposition
```
ROE  = Net Income / Avg. Stockholders Equity
ROA  = Net Income / Avg. Total Assets
ROS  = Net Income / Revenue
TATO = Revenue / Avg. Total Assets
LEVG = Avg. Total Assets / Avg. Equity
ROE  = ROS × TATO × LEVG
```

### Abnormal ROE
```
Abnormal ROE = ROE − Cost of Equity (COE)
Positive → value creating  |  Negative → value destroying
COE = Risk-Free Rate + Beta × Equity Risk Premium   (all user-adjustable)
```

### COE Priority Order (per company)
1. User manual override (highest priority)
2. KPMG-sourced estimate in seed data
3. CAPM via Yahoo Finance beta
4. null → show "—", no crash

### Seed Company Results (FY2024)

| Company            | Category   | ROE   | ROS   | TATO  | Leverage | Abnormal ROE |
|--------------------|------------|-------|-------|-------|----------|--------------|
| Schneider Electric | Competitor | 15.2% | 11.6% | 0.61x | 2.14x    | +5.4% ✅    |
| Honeywell          | Competitor | 32.1% | 14.8% | 0.56x | 3.84x    | n/a          |
| Emerson Automation | Competitor | 7.2%  | 11.2% | 0.40x | 1.61x    | -1.3% ❌    |
| SLB                | Competitor | ~17%  | ~12%  | ~0.78x| ~1.8x    | TBD          |

Key insights:
- Honeywell's ROE is leverage-driven (3.84x), not operational excellence
- Emerson is destroying value vs its 8.5% COE hurdle
- SLB has higher asset turnover than pure automation peers (oilfield services model)

---

## Watchlists

### Competitor Watchlist
| Company             | Ticker  | Notes                          |
|---------------------|---------|--------------------------------|
| Schneider Electric  | SU.PA   | Pre-loaded                     |
| Honeywell           | HON     | Pre-loaded                     |
| Emerson Electric    | EMR     | Pre-loaded                     |
| SLB (Schlumberger)  | SLB     | Pre-loaded                     |
| ABB Ltd             | ABB     | Swiss industrial peer          |
| Rockwell Automation | ROK     | Direct process automation      |
| Siemens AG          | SIEGY   | German industrial conglomerate |
| PTC Inc             | PTC     | IIoT/PLM software peer         |
| Aspen Technology    | AZPN    | Process simulation software    |

### Customer Watchlist (suggested starting point)
| Company             | Ticker   | Notes                          |
|---------------------|----------|--------------------------------|
| ExxonMobil          | XOM      | Largest O&G customer segment   |
| Shell               | SHEL     | Major downstream customer      |
| Chevron             | CVX      | US integrated major            |
| LyondellBasell      | LYB      | Chemicals / refining           |
| Air Liquide         | AI.PA    | Industrial gases               |
| BASF                | BASFY    | Chemicals conglomerate         |
| SABIC               | 2010.SR  | Chemicals — Saudi Arabia       |

---

## Design Reference

- Background: `#0B0E14` (non-negotiable)
- Accent: `#C8F04A` acid green for CTAs and highlights
- Numbers: Space Mono font everywhere
- UI text: DM Sans font
- Cards: 1px `#1E2530` border on `#12161F` background
- ROE color coding: green ≥15% | yellow 8–15% | red <8%
- Abnormal ROE: `+x.x% ▲ Value Creating` green / `-x.x% ▼ Value Destroying` red
- Category badges: competitor `#F04A8C` | customer `#4AF0C8` | reference `#F0C84A`

---

## Out of Scope (v1)

- User authentication
- Historical price charts (this is not a trading app)
- Segment-level breakdown (e.g. Honeywell Industrial Automation vs ESS)
- Currency normalization (show native currency, flag it visually)
- Real-time streaming data
