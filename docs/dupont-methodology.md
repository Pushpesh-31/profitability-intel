# DuPont Methodology Reference

## Formula Chain

```
ROE = ROS × TATO × Leverage

Where:
  ROS      = Net Income / Revenue                    (Return on Sales / Profit Margin)
  TATO     = Revenue / Average Total Assets          (Total Asset Turnover)
  Leverage = Average Total Assets / Average Equity   (Financial Leverage Multiplier)

Equivalently:
  ROA = ROS × TATO    = Net Income / Average Total Assets
  ROE = ROA × Leverage
```

## Why Average Assets / Equity?

Balance sheet items are **stock** values (a snapshot at a point in time), while income statement items are **flow** values (accumulated over the year). To make the ratio meaningful, we average the beginning and end of year balance sheet values.

```
Average Total Assets = (Total Assets_t + Total Assets_t-1) / 2
Average Equity       = (Equity_t + Equity_t-1) / 2
```

## Abnormal ROE

```
Abnormal ROE = ROE − Cost of Equity (COE)
```

- **Positive** → Company earns above its cost of capital → creating shareholder value
- **Negative** → Company earns below its cost of capital → destroying shareholder value
- **Zero** → Company earns exactly its cost of capital (competitive equilibrium)

## CAPM Cost of Equity

```
COE = Risk-Free Rate + Beta × Equity Risk Premium
    = 4.5% + Beta × 5.5%
```

Assumptions used (as of 2025):
- Risk-free rate: 4.5% (US 10-year Treasury)
- Equity risk premium: 5.5% (Damodaran historical average)
- Beta: sourced from Yahoo Finance (5-year monthly regression vs S&P 500)

For non-US companies (e.g. Schneider Electric), the KPMG COE analysis from the spreadsheet is used directly (9.8% for Schneider, 8.5% for Emerson).

## Interpretation Guide

| Metric | Low | Medium | High |
|---|---|---|---|
| ROE | <8% (concerning) | 8–15% (adequate) | >15% (strong) |
| ROS | <10% | 10–15% | >15% |
| TATO | <0.4x | 0.4–0.7x | >0.7x |
| Leverage | <1.5x (conservative) | 1.5–3x (normal) | >3x (aggressive) |

## Common Distortions to Watch

1. **Discontinued operations** — Emerson FY2023 ROE was inflated to 61.5% due to the Copeland divestiture gain. Always check if net income includes extraordinary items.

2. **High leverage** — Honeywell's 3.84x leverage amplifies ROE significantly. High ROE driven by leverage ≠ operational excellence.

3. **Goodwill-heavy balance sheets** — Large M&A activity inflates assets, suppressing TATO and ROA. Note goodwill as % of total assets.

4. **Currency effects** — Comparing EUR (Schneider) and USD (Honeywell, Emerson) companies requires awareness of FX impact on translated financials.

5. **Fiscal year differences** — Emerson's fiscal year ends September 30 vs calendar year for others.
