/**
 * EVA (Economic Value Added) Utilities
 *
 * EVA = NOPAT - (Invested Capital × WACC)
 *
 * EVA measures the true economic profit after accounting for the full cost
 * of all capital employed in the business.
 *
 * - Positive EVA = Creating value above cost of capital
 * - Negative EVA = Destroying value vs cost of capital
 * - Zero EVA = Earning exactly the cost of capital (competitive equilibrium)
 */

import type { FinancialData, Assumptions } from '../types';
import { computeNOPAT, computeInvestedCapital } from './roic';
import { computeWACC } from './wacc';

/**
 * Calculate EVA (Economic Value Added)
 *
 * EVA = NOPAT - (Invested Capital × WACC)
 *
 * @returns EVA in millions (same unit as input data)
 */
export function computeEVA(
  data: FinancialData,
  assumptions: Assumptions
): number | null {
  const nopat = computeNOPAT(data, assumptions);
  const investedCapital = computeInvestedCapital(data);
  const wacc = computeWACC(data, assumptions);

  if (nopat == null || wacc == null) {
    return null;
  }

  return nopat - investedCapital * wacc;
}

/**
 * Calculate Normalized EVA for cross-company comparison
 *
 * EVA Margin = EVA / Revenue
 *
 * This allows comparison of value creation across companies of different sizes.
 */
export function computeEVANormalized(
  data: FinancialData,
  assumptions: Assumptions
): number | null {
  const eva = computeEVA(data, assumptions);

  if (eva == null || data.revenue <= 0) {
    return null;
  }

  return eva / data.revenue;
}

/**
 * Calculate EVA Spread (ROIC - WACC)
 *
 * This shows the percentage spread between what the company earns
 * on invested capital vs what it costs to fund that capital.
 *
 * EVA = Invested Capital × (ROIC - WACC)
 */
export function computeEVASpread(
  data: FinancialData,
  assumptions: Assumptions
): number | null {
  const nopat = computeNOPAT(data, assumptions);
  const investedCapital = computeInvestedCapital(data);
  const wacc = computeWACC(data, assumptions);

  if (nopat == null || investedCapital <= 0 || wacc == null) {
    return null;
  }

  const roic = nopat / investedCapital;
  return roic - wacc;
}
