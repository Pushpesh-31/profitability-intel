# CLAUDE.md — Profitability Intelligence Dashboard

> This file is read by Claude Code at the start of every session.
> Follow all conventions here precisely. Never deviate without updating this file first.

---

## Project Identity

**Name:** Profitability Intelligence Dashboard
**Purpose:** Competitive intelligence tool for benchmarking industrial automation & energy sector companies — both competitors and customers — using DuPont ROE decomposition analysis. Personal use — not public-facing.
**Created:** February 2026
**Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Recharts + Yahoo Finance API (via proxy backend)

---

## What This App Does

Users enter a stock ticker + category (Competitor / Customer / Reference) and the app:

1. Fetches real financial statement data from Yahoo Finance (Income Statement + Balance Sheet)
2. Computes full DuPont ROE decomposition: `ROE = ROS × TATO × Leverage`
3. Computes Abnormal ROE = `ROE − Cost of Equity (COE)` using user-adjustable CAPM assumptions
4. Displays a competitive intelligence dashboard with:
   - Filter tabs: All | Competitors | Customers | Reference
   - Per-company KPI cards + DuPont waterfall
   - Multi-company comparison table with category badges and spark bars
   - Radar chart (normalized multi-metric, filtered by category)
   - Margin comparison bar chart
   - Assumptions panel (collapsible — exposes Risk-Free Rate, ERP, per-company COE overrides)
5. Pre-loaded with seed data: Schneider Electric, Honeywell, Emerson Automation, SLB (all Competitors, FY2024)

**Target users:** Personal use. Desktop-only. No auth required initially.

---

## Company Categories

Every company has a `category` field. This drives filtering and badge colors throughout the UI.

```
competitor  →  Direct or adjacent software/automation competitors
customer    →  Energy, O&G, chemicals companies that buy industrial software
reference   →  Benchmark companies (user's own company, pure-play SaaS)
```

Category badge colors — use these consistently everywhere:
```
competitor  →  #F04A8C
customer    →  #4AF0C8
reference   →  #F0C84A
```

---

## Aesthetic Direction

Inspired by the dark-mode dashboard already prototyped. Keep this aesthetic DNA:

- **Theme:** Dark industrial — `#0B0E14` background, `#12161F` cards, `#1E2530` borders
- **Accent:** Acid green `#C8F04A` as the primary call-to-action / highlight color
- **Secondary accents:** `#4AF0C8`, `#F04A8C`, `#F0C84A`, `#8C4AF0` for multi-series charts
- **Typography:** `DM Sans` for body/UI, `Space Mono` for all numbers and financial data
- **Vibe:** Bloomberg Terminal meets Figma — dense data, zero clutter, high precision
- **No gradients on backgrounds.** Flat dark. Subtle 1px borders. Monospace numbers everywhere.

---

## Tech Stack & Versions

```
React          18.x
TypeScript     5.x
Vite           5.x
Tailwind CSS   3.x
Recharts       2.x
Zustand        4.x       (global state — companies, filter, assumptions)
React Query    5.x       (data fetching + caching)
Axios          1.x       (HTTP client)
date-fns       3.x       (date formatting)
Node.js        20.x      (backend proxy)
Express        4.x       (thin proxy server to avoid CORS on Yahoo Finance)
node-cache     5.x       (in-memory TTL cache on the server)
```

---

## Project Structure

```
profitability-intel/
├── CLAUDE.md                        ← YOU ARE HERE
├── PROJECT.md                       ← Product spec & roadmap
├── TODO.md                          ← Active task list (update as you go)
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
│
├── server/                          ← Express proxy backend
│   ├── index.ts                     ← Entry point (port 3001)
│   ├── routes/
│   │   └── finance.ts               ← Yahoo Finance proxy routes
│   └── utils/
│       └── transformer.ts           ← Raw Yahoo → FinancialData shape
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   │
│   ├── types/
│   │   └── index.ts                 ← All TypeScript interfaces
│   │
│   ├── utils/
│   │   ├── dupont.ts                ← DuPont computation (pure functions)
│   │   ├── formatters.ts            ← fmt(), fmtPct(), fmtMillions(), fmtDelta()
│   │   └── capm.ts                  ← estimateCOE(beta, assumptions)
│   │
│   ├── services/
│   │   └── financeApi.ts            ← React Query hooks wrapping proxy API
│   │
│   ├── store/
│   │   └── useAppStore.ts           ← Zustand store
│   │
│   ├── hooks/
│   │   └── useCompanyMetrics.ts     ← Derived hook: company + computed metrics
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx           ← Title, category selector, ticker input
│   │   │   ├── PageShell.tsx        ← Outer wrapper
│   │   │   └── AssumptionsPanel.tsx ← Collapsible assumptions drawer
│   │   │
│   │   ├── ui/
│   │   │   ├── MetricCard.tsx
│   │   │   ├── MiniBar.tsx
│   │   │   ├── TickerInput.tsx
│   │   │   ├── CompanyPillTabs.tsx  ← Shows category dot on each pill
│   │   │   ├── FilterTabs.tsx       ← All | Competitors | Customers | Reference
│   │   │   ├── CategoryBadge.tsx    ← Colored pill badge
│   │   │   └── StatusBanner.tsx
│   │   │
│   │   └── charts/
│   │       ├── DuPontWaterfall.tsx
│   │       ├── PeerComparisonTable.tsx
│   │       ├── RadarChart.tsx
│   │       └── MarginBarChart.tsx
│   │
│   └── pages/
│       └── Dashboard.tsx
│
├── docs/
│   ├── dupont-methodology.md
│   └── data-sources.md
│
└── public/
    └── favicon.svg
```

---

## Core Data Types

Always use these interfaces from `src/types/index.ts`. Never redefine inline.

```typescript
export type CompanyCategory = 'competitor' | 'customer' | 'reference';

export interface FinancialData {
  name: string;
  ticker: string;
  fiscalYear: string;
  currency: string;
  category: CompanyCategory;             // competitor | customer | reference
  revenue: number;                       // in millions
  netIncome: number;
  totalAssetsCurrent: number;
  totalAssetsPrior: number;
  equityCurrent: number;
  equityPrior: number;
  costOfSales: number;
  grossProfit: number;
  operatingIncome: number;
  rdExpense: number | null;
  sgaExpense: number;
  totalDebt: number;
  cash: number;
  goodwill: number | null;
  coeEstimate: number | null;            // from KPMG or CAPM via beta — before user overrides
  sector: string;
  dataNote: string;
}

export interface DuPontMetrics {
  ros: number;                           // Net Income / Revenue
  tato: number;                          // Revenue / Avg Assets
  leverage: number;                      // Avg Assets / Avg Equity
  roa: number;                           // ROS × TATO
  roe: number;                           // ROA × Leverage
  grossMargin: number;
  opMargin: number;
  abnormalRoe: number | null;            // ROE − COE (null if no COE available)
  avgAssets: number;
  avgEquity: number;
}

export interface Company {
  data: FinancialData;
  metrics: DuPontMetrics;
  color: string;                         // From PALETTE, assigned on add
}

export interface Assumptions {
  riskFreeRate: number;                  // default 0.045 (4.5%)
  equityRiskPremium: number;             // default 0.055 (5.5%)
  coeOverrides: Record<string, number>;  // ticker → manual COE override
}
```

---

## DuPont Computation Rules

All logic lives in `src/utils/dupont.ts`. Pure functions only — no side effects.
The `assumptions` object is always passed in so metrics recompute reactively.

```typescript
// Always use AVERAGE assets and equity
const avgAssets = (totalAssetsCurrent + totalAssetsPrior) / 2;
const avgEquity = (equityCurrent + equityPrior) / 2;

const ros       = netIncome / revenue;
const tato      = revenue / avgAssets;
const leverage  = avgAssets / avgEquity;
const roa       = ros * tato;
const roe       = roa * leverage;

// COE priority order:
// 1. assumptions.coeOverrides[ticker]  — user manual override (highest priority)
// 2. data.coeEstimate                  — from KPMG or CAPM via Yahoo beta
// 3. null                              — show "—" for Abnormal ROE, don't crash
const effectiveCoe = assumptions.coeOverrides[ticker] ?? data.coeEstimate ?? null;
const abnormalRoe  = effectiveCoe != null ? roe - effectiveCoe : null;
```

CAPM formula in `src/utils/capm.ts`:
```typescript
export function estimateCOE(beta: number, assumptions: Assumptions): number {
  return assumptions.riskFreeRate + beta * assumptions.equityRiskPremium;
}
```

---

## Assumptions Panel (AssumptionsPanel.tsx)

Collapsible panel at the bottom of the dashboard. Toggled by a button in the Header.

Contents:
- **Risk-Free Rate** — range slider 0–10%, step 0.1%, live value display
- **Equity Risk Premium** — range slider 3–9%, step 0.1%, live value display
- **Per-company COE override table** — one row per company:
  - Columns: Ticker | Category | CAPM COE (read-only) | Override input | Reset button
  - Override input: number field, shown as %, placeholder = computed CAPM value
  - Reset button: clears override, reverts to CAPM

All changes call `updateAssumptions()` or `setCoeOverride()` on the Zustand store.
Metrics recompute instantly — no submit button needed.

---

## Backend Proxy (server/)

Yahoo Finance blocks direct browser requests. Express server at port `3001`.

Key routes:
```
GET /api/finance/:ticker/full  →  combined + transformed to FinancialData shape
```

Use `yahoo-finance2` npm package. Cache all responses in-memory for 1 hour using `node-cache`.

---

## State Management (Zustand)

```typescript
interface AppState {
  companies: Company[];
  selectedTicker: string | null;
  activeFilter: 'all' | CompanyCategory;
  assumptions: Assumptions;
  palette: string[];

  addCompany: (data: FinancialData) => void;
  removeCompany: (ticker: string) => void;
  selectCompany: (ticker: string) => void;
  setFilter: (filter: 'all' | CompanyCategory) => void;
  updateAssumptions: (patch: Partial<Assumptions>) => void;
  setCoeOverride: (ticker: string, value: number | null) => void;
}
```

Assumptions reactivity flow:
1. User drags Risk-Free Rate slider → `updateAssumptions({ riskFreeRate: 0.05 })`
2. Store updates `assumptions`
3. All components reading `metrics` recompute via `computeMetrics(data, assumptions)`
4. Charts, table, DuPont waterfall all update — no page reload

---

## Coding Conventions

### TypeScript
- Strict mode on. No `any`. Use `unknown` + type guards if needed.
- All props interfaces named `[ComponentName]Props`
- No default exports from `utils/` or `types/` — named exports only
- Always handle `null` / `undefined` in financial data

### React
- Functional components only
- Custom hooks for all data logic — no business logic in components
- `useCallback` and `useMemo` for chart data computations
- No prop drilling beyond 2 levels — use Zustand

### CSS / Tailwind
- Tailwind utility classes for layout and spacing
- CSS variables in `index.css`:
  ```css
  --color-bg: #0B0E14;
  --color-card: #12161F;
  --color-border: #1E2530;
  --color-accent: #C8F04A;
  --color-text: #E8EDF5;
  --color-muted: #5A6478;
  --color-competitor: #F04A8C;
  --color-customer: #4AF0C8;
  --color-reference: #F0C84A;
  ```
- All number displays use `font-mono` (Space Mono)
- No inline styles unless necessary for dynamic chart values

### Number Formatting
Always use helpers from `src/utils/formatters.ts`:
```typescript
fmt(value, decimals)        // "2.14x"
fmtPct(value, decimals)     // "15.2%"
fmtMillions(value)          // "$38.2B" or "$412M"
fmtDelta(value)             // "+5.4%" or "-1.3%" with sign
```

---

## Chart Library Rules (Recharts)

- All charts wrapped in `ResponsiveContainer` — no fixed pixel widths
- Tooltip styles match dark theme (bg `#12161F`, border `#1E2530`)
- Axes: no axis lines, no tick lines, muted text `#5A6478`
- Colors always from company's `color` field — never hardcoded in chart components

---

## Environment Variables

```
VITE_API_BASE_URL=http://localhost:3001
VITE_ANTHROPIC_API_KEY=your_key_here    # Phase 2 — AI narrative insights
```

---

## What Claude Code Should NOT Do

- Do not use Create React App — use Vite
- Do not install moment.js — use date-fns
- Do not use Redux — use Zustand
- Do not use class components
- Do not write separate CSS files — Tailwind only (except index.css)
- Do not fetch Yahoo Finance from the browser — always via proxy
- Do not skip TypeScript types — no implicit `any`
- Do not hardcode assumption values (rfr, erp) in components — always read from store
- Do not recompute metrics outside of `dupont.ts` — single source of truth

---

## Session Startup Checklist

1. Read `CLAUDE.md` (this file) ✓
2. Read `TODO.md` to see what's in progress
3. Run `npm run dev` to check current state
4. Run `npm run type-check` to check for TypeScript errors
5. Ask before making architectural changes
