import { useAppStore } from '../../store/useAppStore';

interface GlossaryEntry {
  term: string;
  formula?: string;
  description: string;
}

interface GlossarySection {
  title: string;
  intro?: string;
  entries: GlossaryEntry[];
}

const SECTIONS: GlossarySection[] = [
  {
    title: 'DuPont Decomposition',
    intro:
      'ROE broken into profitability (ROS), efficiency (TATO), and leverage. Balance-sheet items use current/prior averages because they are point-in-time stocks while revenue and income are period flows.',
    entries: [
      {
        term: 'ROS — Return on Sales',
        formula: 'Net Income / Revenue',
        description: 'Share of each revenue dollar that reaches the bottom line.',
      },
      {
        term: 'TATO — Total Asset Turnover',
        formula: 'Revenue / Avg Assets',
        description: 'How efficiently the asset base generates sales.',
      },
      {
        term: 'Leverage — Financial Leverage Multiplier',
        formula: 'Avg Assets / Avg Equity',
        description: 'Amplification of returns from debt financing.',
      },
      {
        term: 'ROA — Return on Assets',
        formula: 'ROS × TATO = Net Income / Avg Assets',
        description: 'Pre-leverage return the business earns on its asset base.',
      },
      {
        term: 'ROE — Return on Equity',
        formula: 'ROA × Leverage = Net Income / Avg Equity',
        description: 'What shareholders earn on book equity after leverage.',
      },
      {
        term: 'Gross Margin',
        formula: 'Gross Profit / Revenue',
        description: 'Pricing power after variable cost of goods sold.',
      },
      {
        term: 'Operating Margin',
        formula: 'Operating Income / Revenue',
        description: 'Core operating profitability before interest and taxes.',
      },
    ],
  },
  {
    title: 'Cost of Equity (CAPM)',
    intro:
      'Priority order when resolving CoE for a company: user override → CAPM using Yahoo beta → pre-stored estimate → "—". Risk-Free Rate and Equity Risk Premium are adjustable from the Assumptions panel.',
    entries: [
      {
        term: 'CoE — Cost of Equity',
        formula: 'CoE = Rf + β × ERP',
        description:
          'Example: β = 1.2, Rf = 4.5%, ERP = 5.5% → CoE = 4.5% + 1.2 × 5.5% = 11.1%.',
      },
      {
        term: 'Rf — Risk-Free Rate',
        description: 'Default 4.5% (US 10Y Treasury). User-adjustable.',
      },
      {
        term: 'β — Beta',
        description:
          'Sensitivity of the stock to market moves. From Yahoo Finance (5-year monthly regression vs S&P 500).',
      },
      {
        term: 'ERP — Equity Risk Premium',
        description:
          'Expected excess return of equities over risk-free. Default 5.5% (Damodaran historical). User-adjustable.',
      },
      {
        term: 'Abnormal ROE',
        formula: 'ROE − CoE',
        description:
          'Positive → creating shareholder value. Negative → destroying. Zero → earning exactly the cost of capital.',
      },
    ],
  },
  {
    title: 'ROIC — Return on Invested Capital',
    intro:
      'Measures returns on all capital deployed in operations, independent of capital structure. If ROIC is blank, the company is either in a loss year or its effective tax rate falls outside the 0–60% sanity band.',
    entries: [
      {
        term: 'ROIC',
        formula: 'NOPAT / Invested Capital',
        description:
          'Operating return on the capital used to fund operations.',
      },
      {
        term: 'NOPAT — Net Operating Profit After Tax',
        formula: 'EBIT × (1 − Effective Tax Rate)',
        description:
          'Profit as if the company had no debt (strips out the interest tax shield).',
      },
      {
        term: 'Effective Tax Rate',
        formula: 'Income Tax / Pre-tax Income',
        description:
          'Bounded to [0, 60%]; returns null on loss years. User override available.',
      },
      {
        term: 'Invested Capital',
        formula: 'Equity + Total Debt − Cash',
        description:
          'Capital deployed in operations only. Cash is excluded because it is not an operating asset.',
      },
    ],
  },
  {
    title: 'WACC — Weighted Average Cost of Capital',
    intro:
      'Blended cost of funding operations. If debt data is missing, WACC falls back to CoE alone. If CoE is null, WACC is null and EVA cannot be computed.',
    entries: [
      {
        term: 'WACC',
        formula: '(E/V × Re) + (D/V × Rd × (1 − T))',
        description:
          'E = book equity, D = book debt, V = E + D. Re = CoE, Rd = cost of debt, T = effective tax rate.',
      },
      {
        term: 'Rd — Cost of Debt',
        formula: '|Interest Expense| / Total Debt',
        description:
          'Estimated from financials. User override available. Guarded to ≤ 25%.',
      },
      {
        term: 'Debt / Equity Weight',
        formula: 'D/V  and  E/V',
        description:
          'Capital structure mix. User override available for debt weight.',
      },
      {
        term: 'Tax Shield',
        formula: '(1 − T)',
        description:
          'Interest is tax-deductible, so debt is cheaper after tax. Defaults to 21% if tax data missing.',
      },
    ],
  },
  {
    title: 'EVA — Economic Value Added',
    intro:
      'True economic profit after charging for the full cost of capital (both debt and equity).',
    entries: [
      {
        term: 'EVA',
        formula: 'NOPAT − (Invested Capital × WACC)',
        description:
          'Positive → earning more than the full cost of capital. Negative → destroying economic value.',
      },
      {
        term: 'EVA (spread form)',
        formula: 'Invested Capital × (ROIC − WACC)',
        description:
          'Algebraically equivalent. Shows EVA as the dollar product of scale × spread.',
      },
      {
        term: 'EVA Margin',
        formula: 'EVA / Revenue',
        description: 'Size-normalized for cross-company comparison.',
      },
      {
        term: 'EVA Spread',
        formula: 'ROIC − WACC',
        description: 'Percentage-point gap between return and cost of capital.',
      },
    ],
  },
  {
    title: 'Operating & Financial Leverage',
    intro:
      'How sensitive profit is to changes further up the income statement.',
    entries: [
      {
        term: 'DOL — Degree of Operating Leverage',
        formula: '%Δ EBIT / %Δ Revenue   (proxy: Contribution Margin / EBIT)',
        description:
          'How much operating profit swings when revenue moves. High DOL = high fixed costs.',
      },
      {
        term: 'DFL — Degree of Financial Leverage',
        formula: '%Δ Net Income / %Δ EBIT   (proxy: EBIT / (EBIT − Interest))',
        description:
          'How much net income swings when EBIT moves. High DFL = lots of debt service.',
      },
      {
        term: 'DTL — Degree of Total Leverage',
        formula: 'DOL × DFL',
        description:
          'Combined sensitivity of net income to a change in revenue.',
      },
    ],
  },
];

export function GlossaryPanel() {
  const glossaryPanelOpen = useAppStore((state) => state.glossaryPanelOpen);

  if (!glossaryPanelOpen) return null;

  return (
    <div className="mb-6 bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-text uppercase tracking-wider">
          Glossary &amp; Methodology
        </h3>
        <p className="text-muted text-xs mt-1">
          Every metric shown in this dashboard, with the exact formula used in
          computation.
        </p>
      </div>

      <div className="p-4 space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h4 className="text-xs font-medium text-accent uppercase tracking-wider mb-2">
              {section.title}
            </h4>
            {section.intro && (
              <p className="text-muted text-xs leading-relaxed mb-4 max-w-3xl">
                {section.intro}
              </p>
            )}
            <div className="space-y-3">
              {section.entries.map((entry) => (
                <div
                  key={entry.term}
                  className="grid grid-cols-1 md:grid-cols-[minmax(0,14rem)_minmax(0,20rem)_1fr] gap-x-6 gap-y-1 md:items-baseline"
                >
                  <div className="text-sm text-text font-medium">
                    {entry.term}
                  </div>
                  <div className="font-mono text-xs text-accent">
                    {entry.formula ?? ''}
                  </div>
                  <div className="text-xs text-muted leading-relaxed">
                    {entry.description}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
