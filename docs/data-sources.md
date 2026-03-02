# Data Sources Reference

## Yahoo Finance API (via yahoo-finance2)

We use the `quoteSummary` method with the following modules:

```typescript
const result = await yahooFinance.quoteSummary(ticker, {
  modules: [
    'incomeStatementHistory',    // Annual income statements (4 years)
    'balanceSheetHistory',       // Annual balance sheets (4 years)
    'defaultKeyStatistics',      // Beta, market cap, fiscal year end
    'summaryProfile',            // Sector, industry, description
    'financialData',             // Current ratios (ROE, ROA from Yahoo)
  ]
});
```

## Field Mapping: Yahoo → FinancialData

```
FinancialData.revenue
  ← incomeStatementHistory.incomeStatementHistory[0].totalRevenue.raw

FinancialData.netIncome
  ← incomeStatementHistory.incomeStatementHistory[0].netIncome.raw

FinancialData.totalAssetsCurrent
  ← balanceSheetHistory.balanceSheetStatements[0].totalAssets.raw

FinancialData.totalAssetsPrior
  ← balanceSheetHistory.balanceSheetStatements[1].totalAssets.raw

FinancialData.equityCurrent
  ← balanceSheetHistory.balanceSheetStatements[0].totalStockholderEquity.raw

FinancialData.equityPrior
  ← balanceSheetHistory.balanceSheetStatements[1].totalStockholderEquity.raw

FinancialData.costOfSales
  ← incomeStatementHistory.incomeStatementHistory[0].costOfRevenue.raw

FinancialData.grossProfit
  ← incomeStatementHistory.incomeStatementHistory[0].grossProfit.raw

FinancialData.operatingIncome
  ← incomeStatementHistory.incomeStatementHistory[0].ebit.raw

FinancialData.rdExpense
  ← incomeStatementHistory.incomeStatementHistory[0].researchDevelopment?.raw ?? null

FinancialData.sgaExpense
  ← incomeStatementHistory.incomeStatementHistory[0].sellingGeneralAdministrative.raw

FinancialData.cash
  ← balanceSheetHistory.balanceSheetStatements[0].cash.raw

FinancialData.goodwill
  ← balanceSheetHistory.balanceSheetStatements[0].goodWill?.raw ?? null

FinancialData.totalDebt
  ← balanceSheetHistory.balanceSheetStatements[0].longTermDebt.raw

FinancialData.coeEstimate
  ← computed via CAPM using defaultKeyStatistics.beta.raw

FinancialData.name
  ← summaryProfile.longName  (or price.longName)

FinancialData.sector
  ← summaryProfile.sector

FinancialData.fiscalYear
  ← "FY " + new Date(defaultKeyStatistics.mostRecentQuarter.raw * 1000).getFullYear()
```

## Notes on Data Quality

- Yahoo Finance reports values in **raw units** (not millions) — divide by 1,000,000
- Some fields may be `null` for non-US companies or smaller firms
- `balanceSheetStatements[0]` is the most recent year, `[1]` is prior year
- For companies like Schneider Electric (SU.PA), Yahoo Finance data is available but sometimes delayed
- The `yahoo-finance2` library handles cookie authentication automatically

## Fallback Strategy

If a field is missing from Yahoo Finance:
1. Log a warning in the server console
2. Set the field to `null` in `FinancialData`
3. Handle `null` gracefully in `computeMetrics()` and formatters
4. Show "—" in the UI wherever data is unavailable

## Rate Limiting

Yahoo Finance (unofficial) has soft rate limits. Our in-memory cache (1 hour TTL) prevents repeated calls for the same ticker within a session. If you hit rate limits, add a 1-second delay between calls using `setTimeout`.
