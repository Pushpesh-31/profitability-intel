/**
 * Yahoo Finance Data Transformer
 *
 * Transforms raw Yahoo Finance quoteSummary response into our FinancialData shape.
 *
 * Key transformations:
 * - Divide all monetary values by 1,000,000 (Yahoo returns raw values)
 * - Extract current and prior year balance sheet items
 * - Map field names to our interface
 * - Handle null/missing values gracefully
 */

import type { QuoteSummaryResult } from 'yahoo-finance2/dist/esm/src/modules/quoteSummary-iface';
import type { FinancialData, CompanyCategory } from '../../src/types';

/**
 * Safely get a numeric value, converting to millions
 */
function toMillions(value: number | undefined | null): number {
  if (value == null || !isFinite(value)) return 0;
  return value / 1_000_000;
}

/**
 * Safely get a numeric value (no conversion)
 */
function safeNumber(value: number | undefined | null): number | null {
  if (value == null || !isFinite(value)) return null;
  return value;
}

/**
 * Transform Yahoo Finance quoteSummary to FinancialData
 */
export function transformYahooData(
  result: QuoteSummaryResult,
  ticker: string,
  category: CompanyCategory
): FinancialData {
  const income = result.incomeStatementHistory?.incomeStatementHistory;
  const balance = result.balanceSheetHistory?.balanceSheetStatements;
  const keyStats = result.defaultKeyStatistics;
  const profile = result.summaryProfile;
  const price = result.price;

  // Current year income statement (index 0 is most recent)
  const currentIncome = income?.[0];
  const priorIncome = income?.[1];

  // Current and prior year balance sheet
  const currentBalance = balance?.[0];
  const priorBalance = balance?.[1];

  // Determine fiscal year from the income statement date
  const fiscalYearEnd = currentIncome?.endDate;
  const fiscalYear = fiscalYearEnd
    ? `FY ${new Date(fiscalYearEnd).getFullYear()}`
    : 'FY Unknown';

  // Determine currency (default to USD)
  const currency = price?.currency || 'USD';

  // Company name
  const name =
    profile?.longName ||
    price?.longName ||
    price?.shortName ||
    ticker;

  // Sector
  const sector = profile?.sector || 'Unknown';

  // =========================================================================
  // Build FinancialData object
  // =========================================================================

  return {
    // Identifiers
    name,
    ticker,
    fiscalYear,
    currency,
    category,
    sector,
    dataNote: 'Yahoo Finance API',

    // Income Statement - Current Year
    revenue: toMillions(currentIncome?.totalRevenue),
    netIncome: toMillions(currentIncome?.netIncome),
    costOfSales: toMillions(currentIncome?.costOfRevenue),
    grossProfit: toMillions(currentIncome?.grossProfit),
    operatingIncome: toMillions(currentIncome?.operatingIncome),
    ebit: toMillions(currentIncome?.ebit ?? currentIncome?.operatingIncome),
    rdExpense: currentIncome?.researchDevelopment
      ? toMillions(currentIncome.researchDevelopment)
      : null,
    sgaExpense: toMillions(currentIncome?.sellingGeneralAdministrative),
    interestExpense: currentIncome?.interestExpense
      ? toMillions(currentIncome.interestExpense)
      : null,
    incomeTaxExpense: currentIncome?.incomeTaxExpense
      ? toMillions(currentIncome.incomeTaxExpense)
      : null,
    incomeBeforeTax: currentIncome?.incomeBeforeTax
      ? toMillions(currentIncome.incomeBeforeTax)
      : null,

    // Balance Sheet - Current Year
    totalAssetsCurrent: toMillions(currentBalance?.totalAssets),
    equityCurrent: toMillions(currentBalance?.totalStockholderEquity),
    totalDebt: toMillions(
      (currentBalance?.longTermDebt ?? 0) + (currentBalance?.shortLongTermDebt ?? 0)
    ),
    cash: toMillions(currentBalance?.cash),
    goodwill: currentBalance?.goodWill
      ? toMillions(currentBalance.goodWill)
      : null,

    // Balance Sheet - Prior Year
    totalAssetsPrior: toMillions(priorBalance?.totalAssets),
    equityPrior: toMillions(priorBalance?.totalStockholderEquity),

    // Income Statement - Prior Year (for YoY calculations)
    revenuePrior: priorIncome?.totalRevenue
      ? toMillions(priorIncome.totalRevenue)
      : null,
    ebitPrior: priorIncome?.ebit
      ? toMillions(priorIncome.ebit)
      : priorIncome?.operatingIncome
        ? toMillions(priorIncome.operatingIncome)
        : null,
    netIncomePrior: priorIncome?.netIncome
      ? toMillions(priorIncome.netIncome)
      : null,

    // Cost of Equity estimate
    coeEstimate: null, // Will be calculated via CAPM using beta
    beta: safeNumber(keyStats?.beta),
  };
}
