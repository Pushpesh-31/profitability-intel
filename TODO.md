# TODO.md — Active Task List

> Claude Code reads this every session. Update tasks as they complete.
> - [ ] open   - [x] done   - [~] in progress

---

## ✅ Phase 1 — Extended Local MVP (Completed)

### Step 1: Project Scaffold
- [x] Vite + React + TypeScript setup
- [x] Install dependencies (recharts, zustand, react-query, axios, date-fns)
- [x] Tailwind CSS configuration with custom colors
- [x] CSS variables + Google Fonts (DM Sans, Space Mono)
- [x] Vite proxy configuration for API

### Step 2: Backend Proxy Server
- [x] Express server on port 3001
- [x] Yahoo Finance integration via yahoo-finance2
- [x] GET /api/finance/:ticker/full endpoint
- [x] Data transformation to FinancialData shape
- [x] 1-hour cache using node-cache
- [x] Extended field mappings for new metrics

### Step 3: Core Types & Utils
- [x] FinancialData interface (extended with interestExpense, incomeTaxExpense, etc.)
- [x] ExtendedMetrics interface (DuPont + ROIC + EVA + DOL/DFL)
- [x] Assumptions interface (CAPM + WACC overrides)
- [x] src/utils/dupont.ts - Main computation orchestrator
- [x] src/utils/roic.ts - NOPAT, Invested Capital, ROIC
- [x] src/utils/wacc.ts - Cost of Debt, Capital Weights, WACC
- [x] src/utils/eva.ts - EVA, EVA Normalized
- [x] src/utils/leverage.ts - DOL, DFL, DTL
- [x] src/utils/capm.ts - CAPM COE calculation
- [x] src/utils/formatters.ts - Number formatting utilities

### Step 4: State Management
- [x] Zustand store with extended state
- [x] Seed companies: EMR (reference), SU.PA, HON, SLB (competitors)
- [x] CAPM assumption actions
- [x] WACC override actions (costOfDebt, debtWeight, taxRate)
- [x] View tab state (deep-dive / compare)
- [x] Reference ticker state

### Step 5: Services Layer
- [x] React Query hooks for API calls
- [x] useAddCompany mutation
- [x] useValidateTicker query

### Step 6: UI Components
- [x] PageShell, Header, AssumptionsPanel
- [x] FilterTabs, ViewTabToggle, ReferenceSelector
- [x] CategoryBadge, CompanyPillTabs, MetricCard
- [x] DuPontWaterfall chart
- [x] ROICCard, EVACard, LeverageCard

### Step 7: Views
- [x] DeepDiveView - Single company detailed analysis
- [x] CompareView - Side-by-side comparison with reference

### Step 8: Dashboard Integration
- [x] Tabbed view routing
- [x] Filter integration
- [x] Reference company selection

---

## 🔨 Phase 1.1 — Polish & Enhancement (Current)

### UI Improvements
- [ ] Add RadarChart for multi-company comparison
- [ ] Add PeerComparisonTable with all metrics
- [ ] Add MarginBarChart for visual comparison
- [ ] Add loading states/spinners
- [ ] Add error boundary

### Functionality
- [ ] Test Yahoo Finance API with real tickers (XOM, ABB, etc.)
- [ ] Verify calculation accuracy vs spreadsheet
- [ ] Add tooltip explanations for metrics

### QA Checklist
- [ ] npm run type-check → zero errors ✅
- [ ] Both servers start successfully ✅
- [ ] Seed data displays correctly
- [ ] Assumptions panel updates metrics reactively
- [ ] WACC overrides work correctly
- [ ] Compare view shows delta calculations
- [ ] Filter tabs work correctly

---

## 🔮 Phase 2 — Intelligence Layer (Future)

- [ ] Claude API narrative insight panel
- [ ] Year-over-year trend toggle
- [ ] localStorage persistence
- [ ] PDF export

---

## 🚀 Phase 3 — Deployment (Future)

- [ ] Vercel deployment (frontend)
- [ ] Railway/Render deployment (backend)
- [ ] Token-based authentication
- [ ] Mobile-responsive improvements

---

## Decisions Log

| Date     | Decision                                           | Reason                                        |
|----------|----------------------------------------------------|-----------------------------------------------|
| Feb 2026 | Yahoo Finance via proxy                            | Live data, avoid CORS                         |
| Feb 2026 | Seed data hardcoded                                | Instant load, no API dependency               |
| Feb 2026 | Extended metrics (ROIC, EVA, DOL, DFL)             | Comprehensive profitability analysis          |
| Feb 2026 | EMR as default reference                           | User requirement, can be changed              |
| Feb 2026 | Tabbed Deep Dive / Compare views                   | User requirement for flexibility              |
| Feb 2026 | WACC user-adjustable                               | Allows scenario analysis                      |
| Feb 2026 | DOL/DFL both methods (point-in-time + YoY)         | User requirement for comparison               |
