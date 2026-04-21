/**
 * Yahoo Finance Data Transformer
 *
 * Transforms raw Yahoo Finance fundamentalsTimeSeries + quoteSummary response
 * into our FinancialData shape.
 *
 * Updated for Yahoo Finance API changes (Nov 2024):
 * - Uses fundamentalsTimeSeries for financial statements
 * - Uses quoteSummary only for basic info (name, sector, beta)
 *
 * Key transformations:
 * - Divide all monetary values by 1,000,000 (API returns raw values)
 * - Extract current and prior year data for average calculations
 * - Map field names to our interface
 * - Handle null/missing values gracefully
 */

import type { QuoteSummaryResult } from 'yahoo-finance2/modules/quoteSummary-iface';

// Local type definitions matching src/types
export type CompanyCategory = 'competitor' | 'customer' | 'reference';
export type DataQuality = 'complete' | 'partial' | 'limited';

export interface FinancialData {
  name: string;
  ticker: string;
  fiscalYear: string;
  currency: string;
  category: CompanyCategory;
  sector: string;
  dataNote: string;
  dataQuality?: DataQuality;
  dataWarnings?: string[];
  revenue: number;
  netIncome: number;
  costOfSales: number;
  grossProfit: number;
  operatingIncome: number;
  ebit: number;
  rdExpense: number | null;
  sgaExpense: number;
  interestExpense: number | null;
  incomeTaxExpense: number | null;
  incomeBeforeTax: number | null;
  totalAssetsCurrent: number;
  equityCurrent: number;
  totalDebt: number;
  cash: number;
  goodwill: number | null;
  totalAssetsPrior: number;
  equityPrior: number;
  revenuePrior: number | null;
  ebitPrior: number | null;
  netIncomePrior: number | null;
  coeEstimate: number | null;
  beta: number | null;
}

// Types for fundamentalsTimeSeries response
interface FundamentalsTimeSeriesEntry {
  date: Date;
  totalRevenue?: number;
  operatingRevenue?: number;
  costOfRevenue?: number;
  grossProfit?: number;
  sellingGeneralAndAdministration?: number;
  researchAndDevelopment?: number;
  operatingIncome?: number;
  operatingExpense?: number;
  netIncome?: number;
  ebit?: number;
  ebitda?: number;
  interestExpense?: number;
  taxProvision?: number;
  pretaxIncome?: number;
  // Balance sheet items
  totalAssets?: number;
  stockholdersEquity?: number;
  totalStockholdersEquity?: number;
  commonStockEquity?: number;
  totalEquityGrossMinorityInterest?: number;
  totalDebt?: number;
  longTermDebt?: number;
  currentDebt?: number;
  cashAndCashEquivalents?: number;
  cash?: number;
  goodwill?: number;
  goodwillAndOtherIntangibleAssets?: number;
}

/**
 * Validation result for transformed financial data
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate that transformed financial data has required fields for DuPont analysis
 * Also sets data quality and warnings on the data object
 */
export function validateFinancialData(data: FinancialData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Critical fields that would cause DuPont calculation failures
  if (data.revenue === 0) {
    errors.push('Revenue is zero or missing');
  }
  if (data.totalAssetsCurrent === 0) {
    errors.push('Current year total assets are zero or missing');
  }
  if (data.equityCurrent === 0) {
    errors.push('Current year equity is zero or missing');
  }
  if (data.totalAssetsPrior === 0) {
    errors.push('Prior year total assets are zero or missing (needed for average)');
  }
  if (data.equityPrior === 0) {
    errors.push('Prior year equity is zero or missing (needed for average)');
  }

  // Non-critical but notable missing data
  if (data.netIncome === 0) {
    warnings.push('Net income is zero - DuPont ratios will show zero profitability');
  }
  if (data.fiscalYear === 'FY Unknown') {
    warnings.push('Could not determine fiscal year from data');
  }
  if (data.beta === null) {
    warnings.push('Beta unavailable - CAPM cost of equity cannot be calculated');
  }
  if (data.rdExpense === null) {
    warnings.push('R&D expense not reported');
  }
  if (data.interestExpense === null) {
    warnings.push('Interest expense unavailable - WACC estimate may be less accurate');
  }
  if (data.revenuePrior === null) {
    warnings.push('Prior year revenue unavailable - YoY growth cannot be calculated');
  }

  // Calculate data quality
  let dataQuality: DataQuality = 'complete';
  if (errors.length > 0) {
    dataQuality = 'limited';
  } else if (warnings.length > 3) {
    dataQuality = 'partial';
  } else if (warnings.length > 0) {
    dataQuality = 'complete'; // Minor warnings don't affect quality
  }

  // Add quality and warnings to data object
  data.dataQuality = dataQuality;
  data.dataWarnings = warnings;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

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
 * Filter out entries with no meaningful financial data and sort by date descending
 */
function filterAndSortEntries(
  entries: FundamentalsTimeSeriesEntry[],
  type: 'financials' | 'balance-sheet'
): FundamentalsTimeSeriesEntry[] {
  // Filter out entries with no meaningful data
  const filtered = entries.filter((entry) => {
    if (type === 'financials') {
      // Must have revenue data
      return (entry.totalRevenue ?? entry.operatingRevenue) != null;
    } else {
      // Must have total assets data
      return entry.totalAssets != null;
    }
  });

  // Sort by date descending (most recent first)
  return filtered.sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime();
    const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime();
    return dateB - dateA;
  });
}

/**
 * Transform Yahoo Finance fundamentalsTimeSeries + quoteSummary to FinancialData
 */
export function transformFundamentalsData(
  financialsData: FundamentalsTimeSeriesEntry[] | null,
  balanceSheetData: FundamentalsTimeSeriesEntry[] | null,
  quoteSummaryData: QuoteSummaryResult | null,
  ticker: string,
  category: CompanyCategory
): FinancialData {
  // Filter out entries with no data and sort by date descending
  const financials = financialsData
    ? filterAndSortEntries(financialsData, 'financials')
    : [];
  const balanceSheet = balanceSheetData
    ? filterAndSortEntries(balanceSheetData, 'balance-sheet')
    : [];

  const keyStats = quoteSummaryData?.defaultKeyStatistics;
  const profile = quoteSummaryData?.summaryProfile;
  const price = quoteSummaryData?.price;

  // Current year financials (index 0 is most recent)
  const currentFinancials = financials[0];
  const priorFinancials = financials[1];

  // Current and prior year balance sheet
  const currentBalance = balanceSheet[0];
  const priorBalance = balanceSheet[1];

  // Determine fiscal year from the financials date
  const fiscalYearEnd = currentFinancials?.date;
  const fiscalYear = fiscalYearEnd
    ? `FY ${new Date(fiscalYearEnd).getFullYear()}`
    : 'FY Unknown';

  // Determine currency (default to USD)
  const currency = price?.currency || 'USD';

  // Company name - ensure string type (can sometimes be {} from API)
  const rawName =
    profile?.longName ||
    price?.longName ||
    price?.shortName ||
    ticker;
  const name = typeof rawName === 'string' ? rawName : ticker;

  // Sector
  const sector = profile?.sector || 'Unknown';

  // =========================================================================
  // Build FinancialData object
  // =========================================================================

  // Get equity value - try different field names
  // Yahoo Finance returns equity under various fields depending on the company
  const getEquity = (entry: FundamentalsTimeSeriesEntry | undefined): number => {
    if (!entry) return 0;
    return toMillions(
      entry.stockholdersEquity ??
      entry.commonStockEquity ??
      entry.totalEquityGrossMinorityInterest ??
      entry.totalStockholdersEquity ??
      0
    );
  };

  // Get total debt - try different combinations
  const getTotalDebt = (entry: FundamentalsTimeSeriesEntry | undefined): number => {
    if (!entry) return 0;
    if (entry.totalDebt != null) return toMillions(entry.totalDebt);
    const longTerm = entry.longTermDebt ?? 0;
    const current = entry.currentDebt ?? 0;
    return toMillions(longTerm + current);
  };

  // Get cash value
  const getCash = (entry: FundamentalsTimeSeriesEntry | undefined): number => {
    if (!entry) return 0;
    return toMillions(entry.cashAndCashEquivalents ?? entry.cash ?? 0);
  };

  // Get goodwill
  const getGoodwill = (entry: FundamentalsTimeSeriesEntry | undefined): number | null => {
    if (!entry) return null;
    const value = entry.goodwill ?? entry.goodwillAndOtherIntangibleAssets;
    return value != null ? toMillions(value) : null;
  };

  return {
    // Identifiers
    name,
    ticker,
    fiscalYear,
    currency,
    category,
    sector,
    dataNote: 'Yahoo Finance API (fundamentalsTimeSeries)',

    // Income Statement - Current Year
    revenue: toMillions(currentFinancials?.totalRevenue ?? currentFinancials?.operatingRevenue),
    netIncome: toMillions(currentFinancials?.netIncome),
    costOfSales: toMillions(currentFinancials?.costOfRevenue),
    grossProfit: toMillions(currentFinancials?.grossProfit),
    operatingIncome: toMillions(currentFinancials?.operatingIncome),
    ebit: toMillions(currentFinancials?.ebit ?? currentFinancials?.operatingIncome),
    rdExpense: currentFinancials?.researchAndDevelopment
      ? toMillions(currentFinancials.researchAndDevelopment)
      : null,
    sgaExpense: toMillions(currentFinancials?.sellingGeneralAndAdministration),
    interestExpense: currentFinancials?.interestExpense != null
      ? toMillions(currentFinancials.interestExpense)
      : null,
    incomeTaxExpense: currentFinancials?.taxProvision != null
      ? toMillions(currentFinancials.taxProvision)
      : null,
    incomeBeforeTax: currentFinancials?.pretaxIncome != null
      ? toMillions(currentFinancials.pretaxIncome)
      : null,

    // Balance Sheet - Current Year
    totalAssetsCurrent: toMillions(currentBalance?.totalAssets),
    equityCurrent: getEquity(currentBalance),
    totalDebt: getTotalDebt(currentBalance),
    cash: getCash(currentBalance),
    goodwill: getGoodwill(currentBalance),

    // Balance Sheet - Prior Year
    totalAssetsPrior: toMillions(priorBalance?.totalAssets),
    equityPrior: getEquity(priorBalance),

    // Income Statement - Prior Year (for YoY calculations)
    revenuePrior: priorFinancials?.totalRevenue
      ? toMillions(priorFinancials.totalRevenue)
      : null,
    ebitPrior: priorFinancials?.ebit
      ? toMillions(priorFinancials.ebit)
      : priorFinancials?.operatingIncome
        ? toMillions(priorFinancials.operatingIncome)
        : null,
    netIncomePrior: priorFinancials?.netIncome
      ? toMillions(priorFinancials.netIncome)
      : null,

    // Cost of Equity estimate
    coeEstimate: null, // Will be calculated via CAPM using beta
    beta: safeNumber(keyStats?.beta),
  };
}

// Keep old export name for backwards compatibility
export const transformYahooData = transformFundamentalsData;
