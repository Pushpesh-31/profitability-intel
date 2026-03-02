/**
 * Zustand Store for Application State
 *
 * This is the single source of truth for:
 * - Company data and computed metrics
 * - UI state (selected ticker, filters, view tab)
 * - User-adjustable assumptions (CAPM inputs, overrides)
 *
 * Metrics are recomputed automatically whenever assumptions change.
 */

import { create } from 'zustand';
import type {
  AppState,
  FinancialData,
  Company,
  Assumptions,
  CompanyCategory,
  ViewTab,
} from '../types';
import { CHART_PALETTE } from '../types';
import { computeMetrics } from '../utils/dupont';

// ============================================================================
// Seed Data (pre-loaded companies)
// ============================================================================

const SEED_DATA: FinancialData[] = [
  // Emerson Electric (Reference company)
  {
    name: 'Emerson Electric',
    ticker: 'EMR',
    fiscalYear: 'FY 2024',
    currency: 'USD',
    category: 'reference',
    sector: 'Industrial Automation',
    dataNote: 'Seed data FY2024',
    revenue: 17492,
    netIncome: 1955,
    costOfSales: 8607,
    grossProfit: 8885,
    operatingIncome: 2020,
    ebit: 2020,
    rdExpense: 523,
    sgaExpense: 5142,
    interestExpense: 250,
    incomeTaxExpense: 489,
    incomeBeforeTax: 2444,
    totalAssetsCurrent: 44246,
    equityCurrent: 21636,
    totalDebt: 7155,
    cash: 3588,
    goodwill: 18067,
    totalAssetsPrior: 42746,
    equityPrior: 20689,
    revenuePrior: 15166,
    ebitPrior: 1780,
    netIncomePrior: 1800,
    coeEstimate: 0.085,
    beta: 1.15,
  },
  // Schneider Electric (Competitor)
  {
    name: 'Schneider Electric',
    ticker: 'SU.PA',
    fiscalYear: 'FY 2024',
    currency: 'EUR',
    category: 'competitor',
    sector: 'Industrial Automation',
    dataNote: 'Seed data FY2024',
    revenue: 38153,
    netIncome: 4439,
    costOfSales: 21885,
    grossProfit: 16268,
    operatingIncome: 6449,
    ebit: 6449,
    rdExpense: 1308,
    sgaExpense: 7877,
    interestExpense: 450,
    incomeTaxExpense: 1200,
    incomeBeforeTax: 5999,
    totalAssetsCurrent: 65943,
    equityCurrent: 31280,
    totalDebt: 12000,
    cash: 6887,
    goodwill: 26281,
    totalAssetsPrior: 58899,
    equityPrior: 27168,
    revenuePrior: 35902,
    ebitPrior: 5800,
    netIncomePrior: 3900,
    coeEstimate: 0.098,
    beta: 1.05,
  },
  // Honeywell (Competitor)
  {
    name: 'Honeywell International',
    ticker: 'HON',
    fiscalYear: 'FY 2024',
    currency: 'USD',
    category: 'competitor',
    sector: 'Industrial Automation',
    dataNote: 'Seed data FY2024',
    revenue: 38498,
    netIncome: 5705,
    costOfSales: 23836,
    grossProfit: 14662,
    operatingIncome: 7213,
    ebit: 7213,
    rdExpense: 1536,
    sgaExpense: 5466,
    interestExpense: 680,
    incomeTaxExpense: 1400,
    incomeBeforeTax: 7105,
    totalAssetsCurrent: 75196,
    equityCurrent: 17776,
    totalDebt: 25479,
    cash: 10567,
    goodwill: 21825,
    totalAssetsPrior: 61525,
    equityPrior: 14600,
    revenuePrior: 36662,
    ebitPrior: 6900,
    netIncomePrior: 5100,
    coeEstimate: null,
    beta: 1.08,
  },
  // SLB (Competitor)
  {
    name: 'SLB',
    ticker: 'SLB',
    fiscalYear: 'FY 2024',
    currency: 'USD',
    category: 'competitor',
    sector: 'Energy Technology',
    dataNote: 'Seed data FY2024',
    revenue: 36289,
    netIncome: 4468,
    costOfSales: 26209,
    grossProfit: 10080,
    operatingIncome: 5695,
    ebit: 5695,
    rdExpense: null,
    sgaExpense: 1671,
    interestExpense: 380,
    incomeTaxExpense: 950,
    incomeBeforeTax: 5418,
    totalAssetsCurrent: 46364,
    equityCurrent: 16283,
    totalDebt: 11283,
    cash: 3036,
    goodwill: 14736,
    totalAssetsPrior: 43954,
    equityPrior: 15498,
    revenuePrior: 33135,
    ebitPrior: 5100,
    netIncomePrior: 4000,
    coeEstimate: null,
    beta: 1.45,
  },
];

// ============================================================================
// Default Assumptions
// ============================================================================

const DEFAULT_ASSUMPTIONS: Assumptions = {
  riskFreeRate: 0.045, // 4.5%
  equityRiskPremium: 0.055, // 5.5%
  coeOverrides: {},
  costOfDebtOverrides: {},
  debtWeightOverrides: {},
  taxRateOverrides: {},
};

// ============================================================================
// Store Creation
// ============================================================================

/**
 * Initialize companies from seed data
 */
function initializeCompanies(assumptions: Assumptions): Company[] {
  return SEED_DATA.map((data, index) => ({
    data,
    metrics: computeMetrics(data, assumptions),
    color: CHART_PALETTE[index % CHART_PALETTE.length] ?? '#C8F04A',
  }));
}

export const useAppStore = create<AppState>((set) => {
  const initialAssumptions = DEFAULT_ASSUMPTIONS;
  const initialCompanies = initializeCompanies(initialAssumptions);

  return {
    // ========================================================================
    // State
    // ========================================================================

    companies: initialCompanies,
    selectedTicker: 'EMR', // Default to reference company
    referenceTicker: 'EMR',
    activeFilter: 'all',
    activeViewTab: 'deep-dive',
    assumptionsPanelOpen: false,
    assumptions: initialAssumptions,
    palette: [...CHART_PALETTE],

    // ========================================================================
    // Company Actions
    // ========================================================================

    addCompany: (data: FinancialData) => {
      set((state) => {
        // Check if company already exists
        if (state.companies.some((c) => c.data.ticker === data.ticker)) {
          console.warn(`Company ${data.ticker} already exists`);
          return state;
        }

        const color =
          state.palette[state.companies.length % state.palette.length] ??
          '#C8F04A';
        const metrics = computeMetrics(data, state.assumptions);

        return {
          companies: [...state.companies, { data, metrics, color }],
          selectedTicker: data.ticker, // Select newly added company
        };
      });
    },

    removeCompany: (ticker: string) => {
      set((state) => {
        const filtered = state.companies.filter(
          (c) => c.data.ticker !== ticker
        );

        // Update selected ticker if removed
        let newSelectedTicker = state.selectedTicker;
        if (state.selectedTicker === ticker) {
          newSelectedTicker = filtered[0]?.data.ticker ?? null;
        }

        // Update reference ticker if removed
        let newReferenceTicker = state.referenceTicker;
        if (state.referenceTicker === ticker) {
          newReferenceTicker = filtered[0]?.data.ticker ?? '';
        }

        return {
          companies: filtered,
          selectedTicker: newSelectedTicker,
          referenceTicker: newReferenceTicker,
        };
      });
    },

    selectCompany: (ticker: string) => {
      set({ selectedTicker: ticker });
    },

    setReferenceTicker: (ticker: string) => {
      set({ referenceTicker: ticker });
    },

    // ========================================================================
    // UI Actions
    // ========================================================================

    setFilter: (filter: 'all' | CompanyCategory) => {
      set({ activeFilter: filter });
    },

    setViewTab: (tab: ViewTab) => {
      set({ activeViewTab: tab });
    },

    toggleAssumptionsPanel: () => {
      set((state) => ({ assumptionsPanelOpen: !state.assumptionsPanelOpen }));
    },

    // ========================================================================
    // Assumptions Actions
    // ========================================================================

    updateAssumptions: (patch: Partial<Assumptions>) => {
      set((state) => {
        const assumptions = { ...state.assumptions, ...patch };
        // Recompute all company metrics with new assumptions
        const companies = state.companies.map((c) => ({
          ...c,
          metrics: computeMetrics(c.data, assumptions),
        }));
        return { assumptions, companies };
      });
    },

    setCoeOverride: (ticker: string, value: number | null) => {
      set((state) => {
        const coeOverrides = { ...state.assumptions.coeOverrides };
        if (value === null) {
          delete coeOverrides[ticker];
        } else {
          coeOverrides[ticker] = value;
        }
        const assumptions = { ...state.assumptions, coeOverrides };
        const companies = state.companies.map((c) => ({
          ...c,
          metrics: computeMetrics(c.data, assumptions),
        }));
        return { assumptions, companies };
      });
    },

    setCostOfDebtOverride: (ticker: string, value: number | null) => {
      set((state) => {
        const costOfDebtOverrides = { ...state.assumptions.costOfDebtOverrides };
        if (value === null) {
          delete costOfDebtOverrides[ticker];
        } else {
          costOfDebtOverrides[ticker] = value;
        }
        const assumptions = { ...state.assumptions, costOfDebtOverrides };
        const companies = state.companies.map((c) => ({
          ...c,
          metrics: computeMetrics(c.data, assumptions),
        }));
        return { assumptions, companies };
      });
    },

    setDebtWeightOverride: (ticker: string, value: number | null) => {
      set((state) => {
        const debtWeightOverrides = { ...state.assumptions.debtWeightOverrides };
        if (value === null) {
          delete debtWeightOverrides[ticker];
        } else {
          debtWeightOverrides[ticker] = value;
        }
        const assumptions = { ...state.assumptions, debtWeightOverrides };
        const companies = state.companies.map((c) => ({
          ...c,
          metrics: computeMetrics(c.data, assumptions),
        }));
        return { assumptions, companies };
      });
    },

    setTaxRateOverride: (ticker: string, value: number | null) => {
      set((state) => {
        const taxRateOverrides = { ...state.assumptions.taxRateOverrides };
        if (value === null) {
          delete taxRateOverrides[ticker];
        } else {
          taxRateOverrides[ticker] = value;
        }
        const assumptions = { ...state.assumptions, taxRateOverrides };
        const companies = state.companies.map((c) => ({
          ...c,
          metrics: computeMetrics(c.data, assumptions),
        }));
        return { assumptions, companies };
      });
    },
  };
});

// ============================================================================
// Selector Hooks
// ============================================================================

/**
 * Get the currently selected company
 */
export function useSelectedCompany(): Company | undefined {
  return useAppStore((state) =>
    state.companies.find((c) => c.data.ticker === state.selectedTicker)
  );
}

/**
 * Get the reference company
 */
export function useReferenceCompany(): Company | undefined {
  return useAppStore((state) =>
    state.companies.find((c) => c.data.ticker === state.referenceTicker)
  );
}

/**
 * Get companies filtered by the active filter
 */
export function useFilteredCompanies(): Company[] {
  return useAppStore((state) => {
    if (state.activeFilter === 'all') {
      return state.companies;
    }
    return state.companies.filter(
      (c) => c.data.category === state.activeFilter
    );
  });
}

/**
 * Get count of companies by category
 */
export function useCategoryCounts(): Record<'all' | CompanyCategory, number> {
  return useAppStore((state) => ({
    all: state.companies.length,
    competitor: state.companies.filter((c) => c.data.category === 'competitor')
      .length,
    customer: state.companies.filter((c) => c.data.category === 'customer')
      .length,
    reference: state.companies.filter((c) => c.data.category === 'reference')
      .length,
  }));
}
