/**
 * ROIC (Return on Invested Capital) Utilities
 *
 * ROIC = NOPAT / Invested Capital
 *
 * This measures how efficiently a company generates returns on all capital
 * invested in the business, regardless of how it's financed.
 */

import type { FinancialData, Assumptions } from '../types';

/**
 * Calculate Effective Tax Rate
 * Tax Rate = Income Tax Expense / Income Before Tax
 */
export function computeEffectiveTaxRate(data: FinancialData): number | null {
  const { incomeTaxExpense, incomeBeforeTax } = data;

  if (
    incomeBeforeTax == null ||
    incomeBeforeTax === 0 ||
    incomeTaxExpense == null
  ) {
    return null;
  }

  // Handle negative pre-tax income (loss years)
  if (incomeBeforeTax < 0) {
    return null;
  }

  const taxRate = incomeTaxExpense / incomeBeforeTax;

  // Sanity check: tax rate should be between 0 and 1 (or slightly negative for refunds)
  if (taxRate < -0.1 || taxRate > 0.6) {
    return null; // Likely anomalous data
  }

  return Math.max(0, taxRate); // Floor at 0
}

/**
 * Get effective tax rate, considering user overrides
 */
export function getEffectiveTaxRate(
  data: FinancialData,
  assumptions: Assumptions
): number | null {
  // Priority 1: User override
  const override = assumptions.taxRateOverrides[data.ticker];
  if (override != null) {
    return override;
  }

  // Priority 2: Computed from financials
  return computeEffectiveTaxRate(data);
}

/**
 * Calculate NOPAT (Net Operating Profit After Tax)
 *
 * NOPAT = EBIT × (1 - Effective Tax Rate)
 *
 * This represents the profit a company would generate if it had no debt
 * (i.e., no interest expense tax shield).
 */
export function computeNOPAT(
  data: FinancialData,
  assumptions: Assumptions
): number | null {
  const taxRate = getEffectiveTaxRate(data, assumptions);

  if (taxRate == null) {
    return null;
  }

  return data.ebit * (1 - taxRate);
}

/**
 * Calculate Invested Capital
 *
 * Invested Capital = Total Equity + Total Debt - Cash
 *
 * This represents the total capital deployed in the business operations.
 * We subtract cash because it's not invested in operations.
 */
export function computeInvestedCapital(data: FinancialData): number {
  const { equityCurrent, totalDebt, cash } = data;
  return equityCurrent + totalDebt - cash;
}

/**
 * Calculate ROIC (Return on Invested Capital)
 *
 * ROIC = NOPAT / Invested Capital
 *
 * Note: Ideally should use average invested capital, but we use current year
 * for simplicity since prior year components may not be available.
 */
export function computeROIC(
  data: FinancialData,
  assumptions: Assumptions
): number | null {
  const nopat = computeNOPAT(data, assumptions);
  const investedCapital = computeInvestedCapital(data);

  if (nopat == null || investedCapital <= 0) {
    return null;
  }

  return nopat / investedCapital;
}
