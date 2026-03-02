/**
 * Core Type Definitions for Profitability Intelligence Dashboard
 *
 * This file contains all TypeScript interfaces used throughout the application.
 * Never redefine these types inline - always import from here.
 */

// ============================================================================
// Company Categories
// ============================================================================

export type CompanyCategory = 'competitor' | 'customer' | 'reference';

export type ViewTab = 'deep-dive' | 'compare';

// ============================================================================
// Financial Data (from Yahoo Finance API)
// ============================================================================

export interface FinancialData {
  // Core identifiers
  name: string;
  ticker: string;
  fiscalYear: string;
  currency: string;
  category: CompanyCategory;
  sector: string;
  dataNote: string;

  // Income Statement - Current Year
  revenue: number;                       // in millions
  netIncome: number;
  costOfSales: number;
  grossProfit: number;
  operatingIncome: number;
  ebit: number;                          // Earnings Before Interest & Taxes
  rdExpense: number | null;
  sgaExpense: number;
  interestExpense: number | null;        // For DFL and cost of debt calculation
  incomeTaxExpense: number | null;       // For effective tax rate
  incomeBeforeTax: number | null;        // EBT for DFL calculation

  // Balance Sheet - Current Year
  totalAssetsCurrent: number;
  equityCurrent: number;
  totalDebt: number;
  cash: number;
  goodwill: number | null;

  // Balance Sheet - Prior Year (for averages)
  totalAssetsPrior: number;
  equityPrior: number;

  // Income Statement - Prior Year (for YoY calculations)
  revenuePrior: number | null;
  ebitPrior: number | null;
  netIncomePrior: number | null;

  // Cost of Equity estimate (from KPMG or CAPM via beta)
  coeEstimate: number | null;
  beta: number | null;                   // For CAPM calculation
}

// ============================================================================
// DuPont Metrics (base financial ratios)
// ============================================================================

export interface DuPontMetrics {
  // DuPont decomposition
  ros: number;                           // Return on Sales = Net Income / Revenue
  tato: number;                          // Total Asset Turnover = Revenue / Avg Assets
  leverage: number;                      // Financial Leverage = Avg Assets / Avg Equity
  roa: number;                           // Return on Assets = ROS × TATO
  roe: number;                           // Return on Equity = ROA × Leverage

  // Margin metrics
  grossMargin: number;
  opMargin: number;

  // Abnormal ROE
  abnormalRoe: number | null;            // ROE − COE (null if no COE available)

  // Supporting values
  avgAssets: number;
  avgEquity: number;
}

// ============================================================================
// Extended Metrics (ROIC, EVA, DOL, DFL)
// ============================================================================

export interface ExtendedMetrics extends DuPontMetrics {
  // ROIC (Return on Invested Capital)
  nopat: number | null;                  // Net Operating Profit After Tax
  investedCapital: number;               // Equity + Debt - Cash
  roic: number | null;                   // NOPAT / Invested Capital

  // EVA (Economic Value Added)
  wacc: number | null;                   // Weighted Average Cost of Capital
  eva: number | null;                    // NOPAT - (Invested Capital × WACC)
  evaNormalized: number | null;          // EVA / Revenue (for comparison)

  // DOL (Degree of Operating Leverage)
  dolPointInTime: number | null;         // Gross Profit / Operating Income
  dolYoY: number | null;                 // % change in EBIT / % change in Revenue

  // DFL (Degree of Financial Leverage)
  dflPointInTime: number | null;         // EBIT / EBT
  dflYoY: number | null;                 // % change in Net Income / % change in EBIT

  // Combined leverage
  dtl: number | null;                    // DOL × DFL (Degree of Total Leverage)

  // Supporting values for display
  effectiveTaxRate: number | null;
  costOfDebt: number | null;
  debtWeight: number;
  equityWeight: number;
}

// ============================================================================
// Company (combines data + computed metrics)
// ============================================================================

export interface Company {
  data: FinancialData;
  metrics: ExtendedMetrics;
  color: string;                         // From palette, assigned on add
}

// ============================================================================
// Assumptions (user-adjustable parameters)
// ============================================================================

export interface Assumptions {
  // CAPM inputs
  riskFreeRate: number;                  // Default 0.045 (4.5%)
  equityRiskPremium: number;             // Default 0.055 (5.5%)

  // Per-company overrides for Cost of Equity
  coeOverrides: Record<string, number>;  // ticker → manual COE override

  // WACC-related overrides
  costOfDebtOverrides: Record<string, number>;  // ticker → manual cost of debt
  debtWeightOverrides: Record<string, number>;  // ticker → manual debt weight (0-1)
  taxRateOverrides: Record<string, number>;     // ticker → manual tax rate
}

// ============================================================================
// App State (Zustand store shape)
// ============================================================================

export interface AppState {
  // Company data
  companies: Company[];
  selectedTicker: string | null;
  referenceTicker: string;               // Default 'EMR'

  // UI state
  activeFilter: 'all' | CompanyCategory;
  activeViewTab: ViewTab;
  assumptionsPanelOpen: boolean;

  // Assumptions
  assumptions: Assumptions;

  // Color palette for charts
  palette: string[];

  // Actions
  addCompany: (data: FinancialData) => void;
  removeCompany: (ticker: string) => void;
  selectCompany: (ticker: string) => void;
  setReferenceTicker: (ticker: string) => void;
  setFilter: (filter: 'all' | CompanyCategory) => void;
  setViewTab: (tab: ViewTab) => void;
  toggleAssumptionsPanel: () => void;
  updateAssumptions: (patch: Partial<Assumptions>) => void;
  setCoeOverride: (ticker: string, value: number | null) => void;
  setCostOfDebtOverride: (ticker: string, value: number | null) => void;
  setDebtWeightOverride: (ticker: string, value: number | null) => void;
  setTaxRateOverride: (ticker: string, value: number | null) => void;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface FinanceApiResponse {
  success: boolean;
  data?: FinancialData;
  error?: string;
}

// ============================================================================
// Chart Color Palette
// ============================================================================

export const CHART_PALETTE = [
  '#C8F04A', // Acid green (primary)
  '#4AF0C8', // Teal
  '#F04A8C', // Pink
  '#F0C84A', // Gold
  '#8C4AF0', // Purple
  '#F09B4A', // Orange
] as const;

export const CATEGORY_COLORS: Record<CompanyCategory, string> = {
  competitor: '#F04A8C',
  customer: '#4AF0C8',
  reference: '#F0C84A',
} as const;
