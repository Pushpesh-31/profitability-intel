/**
 * CAPM (Capital Asset Pricing Model) Utilities
 *
 * Cost of Equity = Risk-Free Rate + Beta × Equity Risk Premium
 */

import type { Assumptions } from '../types';

/**
 * Calculate Cost of Equity using CAPM formula
 *
 * @param beta - Company beta (sensitivity to market movements)
 * @param assumptions - Contains risk-free rate and equity risk premium
 * @returns Cost of equity as a decimal (e.g., 0.095 for 9.5%)
 */
export function estimateCOE(beta: number, assumptions: Assumptions): number {
  return assumptions.riskFreeRate + beta * assumptions.equityRiskPremium;
}

/**
 * Get effective COE for a company, considering overrides
 *
 * Priority order:
 * 1. User manual override (from assumptions.coeOverrides)
 * 2. CAPM calculation using beta (if available)
 * 3. Pre-stored estimate (from data.coeEstimate)
 * 4. null (show "—" in UI)
 */
export function getEffectiveCOE(
  ticker: string,
  beta: number | null,
  coeEstimate: number | null,
  assumptions: Assumptions
): number | null {
  // Priority 1: User override
  const override = assumptions.coeOverrides[ticker];
  if (override != null) {
    return override;
  }

  // Priority 2: CAPM calculation
  if (beta != null && isFinite(beta)) {
    return estimateCOE(beta, assumptions);
  }

  // Priority 3: Pre-stored estimate
  if (coeEstimate != null) {
    return coeEstimate;
  }

  // No COE available
  return null;
}
