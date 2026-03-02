/**
 * Operating and Financial Leverage Utilities
 *
 * DOL (Degree of Operating Leverage):
 *   - Measures how sensitive EBIT is to changes in revenue
 *   - Higher DOL = more fixed costs = more profit sensitivity
 *
 * DFL (Degree of Financial Leverage):
 *   - Measures how sensitive EPS/Net Income is to changes in EBIT
 *   - Higher DFL = more debt = more earnings volatility
 *
 * DTL (Degree of Total Leverage):
 *   - Combined effect of operating and financial leverage
 *   - DTL = DOL × DFL
 */

import type { FinancialData } from '../types';

// ============================================================================
// DOL (Degree of Operating Leverage)
// ============================================================================

/**
 * Calculate DOL using point-in-time approximation
 *
 * DOL ≈ (Revenue - Variable Costs) / EBIT
 *     ≈ Gross Profit / Operating Income
 *
 * This approximation assumes COGS is mostly variable and SG&A is mostly fixed.
 *
 * Interpretation:
 * - DOL of 2.0 means a 10% increase in revenue leads to ~20% increase in EBIT
 * - Higher DOL = more operating leverage = more profit sensitivity to sales
 */
export function computeDOLPointInTime(data: FinancialData): number | null {
  const { grossProfit, operatingIncome } = data;

  // Avoid division by zero or near-zero
  if (Math.abs(operatingIncome) < 0.001) {
    return null;
  }

  // If operating income is negative, DOL interpretation becomes complex
  if (operatingIncome < 0) {
    return null;
  }

  const dol = grossProfit / operatingIncome;

  // Sanity check: DOL should typically be > 1 and < 10
  if (dol < 0 || dol > 20) {
    return null; // Likely anomalous data
  }

  return dol;
}

/**
 * Calculate DOL using Year-over-Year changes
 *
 * DOL = % Change in EBIT / % Change in Revenue
 *
 * This is the "true" DOL based on actual observed changes.
 * More accurate but requires two years of data.
 */
export function computeDOLYoY(data: FinancialData): number | null {
  const { ebit, ebitPrior, revenue, revenuePrior } = data;

  if (ebitPrior == null || revenuePrior == null) {
    return null;
  }

  // Avoid division by zero
  if (ebitPrior === 0 || revenuePrior === 0) {
    return null;
  }

  const pctChangeEBIT = (ebit - ebitPrior) / Math.abs(ebitPrior);
  const pctChangeRevenue = (revenue - revenuePrior) / Math.abs(revenuePrior);

  // If revenue didn't change, can't calculate DOL
  if (Math.abs(pctChangeRevenue) < 0.001) {
    return null;
  }

  const dol = pctChangeEBIT / pctChangeRevenue;

  // Sanity check: extreme values likely indicate anomalous data
  if (Math.abs(dol) > 20) {
    return null;
  }

  return dol;
}

// ============================================================================
// DFL (Degree of Financial Leverage)
// ============================================================================

/**
 * Calculate DFL using point-in-time formula
 *
 * DFL = EBIT / EBT
 *     = EBIT / (EBIT - Interest Expense)
 *
 * Interpretation:
 * - DFL of 1.0 means no financial leverage (no debt/interest)
 * - DFL of 1.5 means a 10% increase in EBIT leads to ~15% increase in Net Income
 * - Higher DFL = more financial leverage = more earnings volatility
 */
export function computeDFLPointInTime(data: FinancialData): number | null {
  const { ebit, incomeBeforeTax } = data;

  if (incomeBeforeTax == null) {
    return null;
  }

  // Avoid division by zero or near-zero
  if (Math.abs(incomeBeforeTax) < 0.001) {
    return null;
  }

  // If EBT is negative, DFL interpretation becomes complex
  if (incomeBeforeTax < 0) {
    return null;
  }

  // If EBIT is negative, DFL doesn't make sense
  if (ebit < 0) {
    return null;
  }

  const dfl = ebit / incomeBeforeTax;

  // DFL should be >= 1 (1 means no leverage)
  // Values > 5 are extreme and might indicate data issues
  if (dfl < 0.5 || dfl > 10) {
    return null;
  }

  return dfl;
}

/**
 * Calculate DFL using Year-over-Year changes
 *
 * DFL = % Change in Net Income / % Change in EBIT
 *
 * This is the "true" DFL based on actual observed changes.
 */
export function computeDFLYoY(data: FinancialData): number | null {
  const { netIncome, netIncomePrior, ebit, ebitPrior } = data;

  if (netIncomePrior == null || ebitPrior == null) {
    return null;
  }

  // Avoid division by zero
  if (netIncomePrior === 0 || ebitPrior === 0) {
    return null;
  }

  const pctChangeNetIncome =
    (netIncome - netIncomePrior) / Math.abs(netIncomePrior);
  const pctChangeEBIT = (ebit - ebitPrior) / Math.abs(ebitPrior);

  // If EBIT didn't change, can't calculate DFL
  if (Math.abs(pctChangeEBIT) < 0.001) {
    return null;
  }

  const dfl = pctChangeNetIncome / pctChangeEBIT;

  // Sanity check
  if (Math.abs(dfl) > 20) {
    return null;
  }

  return dfl;
}

// ============================================================================
// DTL (Degree of Total Leverage)
// ============================================================================

/**
 * Calculate DTL (Degree of Total Leverage)
 *
 * DTL = DOL × DFL
 *
 * This measures the combined effect of operating and financial leverage.
 * Shows how sensitive Net Income is to changes in Revenue.
 */
export function computeDTL(
  dolPointInTime: number | null,
  dflPointInTime: number | null
): number | null {
  if (dolPointInTime == null || dflPointInTime == null) {
    return null;
  }

  return dolPointInTime * dflPointInTime;
}
