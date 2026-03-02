/**
 * WACC (Weighted Average Cost of Capital) Utilities
 *
 * WACC = (E/V × Re) + (D/V × Rd × (1 - T))
 *
 * Where:
 *   E = Market value of equity (we use book value)
 *   D = Market value of debt (we use book value)
 *   V = E + D (total capital)
 *   Re = Cost of equity
 *   Rd = Cost of debt
 *   T = Tax rate
 */

import type { FinancialData, Assumptions } from '../types';
import { getEffectiveCOE } from './capm';
import { getEffectiveTaxRate } from './roic';

/**
 * Estimate Cost of Debt from financial statements
 *
 * Cost of Debt ≈ Interest Expense / Total Debt
 *
 * This is a rough estimate. Actual cost may differ due to:
 * - Timing of debt issuances during the year
 * - Mix of fixed vs floating rate debt
 * - Off-balance-sheet obligations
 */
export function estimateCostOfDebt(data: FinancialData): number | null {
  const { interestExpense, totalDebt } = data;

  if (interestExpense == null || totalDebt <= 0) {
    return null;
  }

  // Interest expense is typically negative in financial statements
  const absoluteInterest = Math.abs(interestExpense);

  const costOfDebt = absoluteInterest / totalDebt;

  // Sanity check: cost of debt should typically be between 0% and 20%
  if (costOfDebt > 0.25) {
    return null; // Likely anomalous data
  }

  return costOfDebt;
}

/**
 * Get effective cost of debt, considering user overrides
 */
export function getEffectiveCostOfDebt(
  data: FinancialData,
  assumptions: Assumptions
): number | null {
  // Priority 1: User override
  const override = assumptions.costOfDebtOverrides[data.ticker];
  if (override != null) {
    return override;
  }

  // Priority 2: Estimated from financials
  return estimateCostOfDebt(data);
}

/**
 * Calculate capital structure weights
 */
export function computeCapitalWeights(data: FinancialData): {
  debtWeight: number;
  equityWeight: number;
} {
  const { equityCurrent, totalDebt } = data;
  const totalCapital = equityCurrent + totalDebt;

  if (totalCapital <= 0) {
    return { debtWeight: 0, equityWeight: 1 };
  }

  return {
    debtWeight: totalDebt / totalCapital,
    equityWeight: equityCurrent / totalCapital,
  };
}

/**
 * Get effective capital weights, considering user overrides
 */
export function getEffectiveCapitalWeights(
  data: FinancialData,
  assumptions: Assumptions
): { debtWeight: number; equityWeight: number } {
  // Check for debt weight override
  const debtWeightOverride = assumptions.debtWeightOverrides[data.ticker];

  if (debtWeightOverride != null) {
    return {
      debtWeight: debtWeightOverride,
      equityWeight: 1 - debtWeightOverride,
    };
  }

  // Use computed weights
  return computeCapitalWeights(data);
}

/**
 * Calculate WACC (Weighted Average Cost of Capital)
 *
 * WACC = (E/V × Re) + (D/V × Rd × (1 - T))
 *
 * Returns null if required inputs are not available.
 */
export function computeWACC(
  data: FinancialData,
  assumptions: Assumptions
): number | null {
  // Get cost of equity
  const costOfEquity = getEffectiveCOE(
    data.ticker,
    data.beta,
    data.coeEstimate,
    assumptions
  );

  if (costOfEquity == null) {
    return null;
  }

  // Get cost of debt
  const costOfDebt = getEffectiveCostOfDebt(data, assumptions);

  // Get capital weights
  const { debtWeight, equityWeight } = getEffectiveCapitalWeights(
    data,
    assumptions
  );

  // If no debt, WACC = COE
  if (debtWeight === 0 || costOfDebt == null) {
    return costOfEquity;
  }

  // Get tax rate for interest tax shield
  const taxRate = getEffectiveTaxRate(data, assumptions) ?? 0.21; // Default to 21% corporate rate

  // WACC formula
  const wacc =
    equityWeight * costOfEquity + debtWeight * costOfDebt * (1 - taxRate);

  return wacc;
}
