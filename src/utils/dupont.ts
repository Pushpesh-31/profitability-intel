/**
 * DuPont Analysis & Extended Metrics Computation
 *
 * This is the main orchestration module that computes all financial metrics.
 * All metric computation flows through computeMetrics() to ensure consistency.
 *
 * DuPont Decomposition:
 *   ROE = ROS × TATO × Leverage
 *
 * Extended Metrics:
 *   - ROIC (Return on Invested Capital)
 *   - EVA (Economic Value Added)
 *   - DOL/DFL (Operating/Financial Leverage)
 */

import type { FinancialData, Assumptions, ExtendedMetrics } from '../types';
import { getEffectiveCOE } from './capm';
import {
  computeNOPAT,
  computeInvestedCapital,
  computeROIC,
  getEffectiveTaxRate,
} from './roic';
import {
  computeWACC,
  getEffectiveCostOfDebt,
  getEffectiveCapitalWeights,
} from './wacc';
import { computeEVA, computeEVANormalized } from './eva';
import {
  computeDOLPointInTime,
  computeDOLYoY,
  computeDFLPointInTime,
  computeDFLYoY,
  computeDTL,
} from './leverage';

/**
 * Compute all financial metrics for a company
 *
 * This is the single source of truth for all metric calculations.
 * Called whenever:
 * - A company is added
 * - Assumptions change (risk-free rate, ERP, overrides)
 *
 * @param data - Raw financial data for the company
 * @param assumptions - User-adjustable assumptions (rates, overrides)
 * @returns Complete ExtendedMetrics object
 */
export function computeMetrics(
  data: FinancialData,
  assumptions: Assumptions
): ExtendedMetrics {
  // ==========================================================================
  // DuPont Decomposition
  // ==========================================================================

  // Calculate averages for stock values (balance sheet items)
  const avgAssets = (data.totalAssetsCurrent + data.totalAssetsPrior) / 2;
  const avgEquity = (data.equityCurrent + data.equityPrior) / 2;

  // Core DuPont ratios
  const ros = data.revenue > 0 ? data.netIncome / data.revenue : 0;
  const tato = avgAssets > 0 ? data.revenue / avgAssets : 0;
  const leverage = avgEquity > 0 ? avgAssets / avgEquity : 0;

  // Derived ratios
  const roa = ros * tato;
  const roe = roa * leverage;

  // Margin metrics
  const grossMargin = data.revenue > 0 ? data.grossProfit / data.revenue : 0;
  const opMargin = data.revenue > 0 ? data.operatingIncome / data.revenue : 0;

  // ==========================================================================
  // Abnormal ROE
  // ==========================================================================

  const effectiveCoe = getEffectiveCOE(
    data.ticker,
    data.beta,
    data.coeEstimate,
    assumptions
  );

  const abnormalRoe = effectiveCoe != null ? roe - effectiveCoe : null;

  // ==========================================================================
  // ROIC (Return on Invested Capital)
  // ==========================================================================

  const nopat = computeNOPAT(data, assumptions);
  const investedCapital = computeInvestedCapital(data);
  const roic = computeROIC(data, assumptions);

  // ==========================================================================
  // WACC & EVA
  // ==========================================================================

  const wacc = computeWACC(data, assumptions);
  const eva = computeEVA(data, assumptions);
  const evaNormalized = computeEVANormalized(data, assumptions);

  // ==========================================================================
  // Operating & Financial Leverage
  // ==========================================================================

  const dolPointInTime = computeDOLPointInTime(data);
  const dolYoY = computeDOLYoY(data);
  const dflPointInTime = computeDFLPointInTime(data);
  const dflYoY = computeDFLYoY(data);
  const dtl = computeDTL(dolPointInTime, dflPointInTime);

  // ==========================================================================
  // Supporting Values
  // ==========================================================================

  const effectiveTaxRate = getEffectiveTaxRate(data, assumptions);
  const costOfDebt = getEffectiveCostOfDebt(data, assumptions);
  const { debtWeight, equityWeight } = getEffectiveCapitalWeights(
    data,
    assumptions
  );

  // ==========================================================================
  // Return Complete Metrics Object
  // ==========================================================================

  return {
    // DuPont
    ros,
    tato,
    leverage,
    roa,
    roe,
    grossMargin,
    opMargin,
    abnormalRoe,
    avgAssets,
    avgEquity,

    // ROIC
    nopat,
    investedCapital,
    roic,

    // EVA
    wacc,
    eva,
    evaNormalized,

    // Leverage
    dolPointInTime,
    dolYoY,
    dflPointInTime,
    dflYoY,
    dtl,

    // Supporting
    effectiveTaxRate,
    costOfDebt,
    debtWeight,
    equityWeight,
  };
}
