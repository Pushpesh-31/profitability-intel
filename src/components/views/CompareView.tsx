import type { Company, ExtendedMetrics } from '../../types';
import { fmtPct, fmtMillions, fmt, fmtDelta } from '../../utils/formatters';
import { CategoryBadge } from '../ui/CategoryBadge';
import { cn } from '../../utils/cn';

interface CompareViewProps {
  selected: Company;
  reference: Company;
}

interface MetricRow {
  label: string;
  key: keyof ExtendedMetrics;
  format: (v: number | null) => string;
  higherIsBetter?: boolean;
  category?: string;
}

const METRIC_ROWS: MetricRow[] = [
  // Profitability
  { label: 'Return on Equity (ROE)', key: 'roe', format: fmtPct, higherIsBetter: true, category: 'Profitability' },
  { label: 'Return on Assets (ROA)', key: 'roa', format: fmtPct, higherIsBetter: true },
  { label: 'Return on Sales (ROS)', key: 'ros', format: fmtPct, higherIsBetter: true },
  { label: 'Gross Margin', key: 'grossMargin', format: fmtPct, higherIsBetter: true },
  { label: 'Operating Margin', key: 'opMargin', format: fmtPct, higherIsBetter: true },

  // Value Creation
  { label: 'ROIC', key: 'roic', format: fmtPct, higherIsBetter: true, category: 'Value Creation' },
  { label: 'WACC', key: 'wacc', format: fmtPct, higherIsBetter: false },
  { label: 'Abnormal ROE', key: 'abnormalRoe', format: fmtDelta, higherIsBetter: true },
  { label: 'EVA Margin', key: 'evaNormalized', format: fmtDelta, higherIsBetter: true },

  // Efficiency
  { label: 'Asset Turnover (TATO)', key: 'tato', format: (v) => fmt(v, 2), higherIsBetter: true, category: 'Efficiency' },
  { label: 'Financial Leverage', key: 'leverage', format: (v) => fmt(v, 2), higherIsBetter: false },

  // Risk
  { label: 'DOL (Operating Leverage)', key: 'dolPointInTime', format: (v) => fmt(v, 2), higherIsBetter: false, category: 'Risk' },
  { label: 'DFL (Financial Leverage)', key: 'dflPointInTime', format: (v) => fmt(v, 2), higherIsBetter: false },
  { label: 'DTL (Total Leverage)', key: 'dtl', format: (v) => fmt(v, 2), higherIsBetter: false },
];

export function CompareView({ selected, reference }: CompareViewProps) {
  const currencySymbol = selected.data.currency === 'EUR' ? '€' : '$';

  // Group metrics by category
  let currentCategory = '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: selected.color }}
          />
          <span className="text-lg font-semibold text-text">
            {selected.data.name}
          </span>
          <CategoryBadge category={selected.data.category} size="sm" />
        </div>

        <span className="text-muted text-lg">vs</span>

        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: reference.color }}
          />
          <span className="text-lg font-semibold text-text">
            {reference.data.name}
          </span>
          <CategoryBadge category={reference.data.category} size="sm" />
          <span className="text-xs text-muted bg-border px-2 py-0.5 rounded">
            Reference
          </span>
        </div>
      </div>

      {/* Key Figures */}
      <div className="grid grid-cols-2 gap-4">
        {/* Selected Company */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-muted text-xs uppercase tracking-wider mb-3">
            {selected.data.ticker}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted mb-1">Revenue</div>
              <div className="font-mono text-text">
                {fmtMillions(selected.data.revenue, currencySymbol)}
              </div>
            </div>
            <div>
              <div className="text-muted mb-1">Net Income</div>
              <div className="font-mono text-text">
                {fmtMillions(selected.data.netIncome, currencySymbol)}
              </div>
            </div>
            <div>
              <div className="text-muted mb-1">EVA</div>
              <div
                className={cn(
                  'font-mono',
                  selected.metrics.eva != null && selected.metrics.eva > 0
                    ? 'text-customer'
                    : 'text-competitor'
                )}
              >
                {selected.metrics.eva != null
                  ? fmtMillions(selected.metrics.eva, currencySymbol)
                  : '—'}
              </div>
            </div>
            <div>
              <div className="text-muted mb-1">Invested Capital</div>
              <div className="font-mono text-text">
                {fmtMillions(selected.metrics.investedCapital, currencySymbol)}
              </div>
            </div>
          </div>
        </div>

        {/* Reference Company */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-muted text-xs uppercase tracking-wider mb-3">
            {reference.data.ticker} (Reference)
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted mb-1">Revenue</div>
              <div className="font-mono text-text">
                {fmtMillions(
                  reference.data.revenue,
                  reference.data.currency === 'EUR' ? '€' : '$'
                )}
              </div>
            </div>
            <div>
              <div className="text-muted mb-1">Net Income</div>
              <div className="font-mono text-text">
                {fmtMillions(
                  reference.data.netIncome,
                  reference.data.currency === 'EUR' ? '€' : '$'
                )}
              </div>
            </div>
            <div>
              <div className="text-muted mb-1">EVA</div>
              <div
                className={cn(
                  'font-mono',
                  reference.metrics.eva != null && reference.metrics.eva > 0
                    ? 'text-customer'
                    : 'text-competitor'
                )}
              >
                {reference.metrics.eva != null
                  ? fmtMillions(
                      reference.metrics.eva,
                      reference.data.currency === 'EUR' ? '€' : '$'
                    )
                  : '—'}
              </div>
            </div>
            <div>
              <div className="text-muted mb-1">Invested Capital</div>
              <div className="font-mono text-text">
                {fmtMillions(
                  reference.metrics.investedCapital,
                  reference.data.currency === 'EUR' ? '€' : '$'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-bg">
              <th className="text-left p-4 text-muted text-xs uppercase tracking-wider">
                Metric
              </th>
              <th className="text-right p-4 text-muted text-xs uppercase tracking-wider">
                {selected.data.ticker}
              </th>
              <th className="text-right p-4 text-muted text-xs uppercase tracking-wider">
                {reference.data.ticker}
              </th>
              <th className="text-right p-4 text-muted text-xs uppercase tracking-wider">
                Delta
              </th>
              <th className="text-center p-4 text-muted text-xs uppercase tracking-wider w-24">
                vs Ref
              </th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {METRIC_ROWS.map((row) => {
              const selVal = selected.metrics[row.key] as number | null;
              const refVal = reference.metrics[row.key] as number | null;
              const delta =
                selVal != null && refVal != null ? selVal - refVal : null;

              // Check if we need a category header
              const showCategory = row.category && row.category !== currentCategory;
              if (row.category) {
                currentCategory = row.category;
              }

              const isBetter =
                delta != null && row.higherIsBetter != null
                  ? row.higherIsBetter
                    ? delta > 0
                    : delta < 0
                  : null;

              return (
                <>
                  {showCategory && (
                    <tr key={`cat-${row.category}`}>
                      <td
                        colSpan={5}
                        className="px-4 py-2 bg-bg text-muted text-xs uppercase tracking-wider font-medium"
                      >
                        {row.category}
                      </td>
                    </tr>
                  )}
                  <tr key={row.key} className="border-t border-border">
                    <td className="p-4 text-text">{row.label}</td>
                    <td className="p-4 text-right font-mono text-text">
                      {selVal != null ? row.format(selVal) : '—'}
                    </td>
                    <td className="p-4 text-right font-mono text-muted">
                      {refVal != null ? row.format(refVal) : '—'}
                    </td>
                    <td
                      className={cn(
                        'p-4 text-right font-mono',
                        delta != null
                          ? isBetter
                            ? 'text-customer'
                            : isBetter === false
                              ? 'text-competitor'
                              : 'text-muted'
                          : 'text-muted'
                      )}
                    >
                      {delta != null ? fmtDelta(delta) : '—'}
                    </td>
                    <td className="p-4 text-center">
                      {isBetter != null && (
                        <span
                          className={cn(
                            'inline-block w-6 h-6 rounded-full text-xs leading-6',
                            isBetter
                              ? 'bg-customer/10 text-customer'
                              : 'bg-competitor/10 text-competitor'
                          )}
                        >
                          {isBetter ? '▲' : '▼'}
                        </span>
                      )}
                    </td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="text-sm font-medium text-muted uppercase tracking-wider mb-3">
          Comparison Summary
        </h4>
        <div className="text-sm text-text">
          <span className="font-semibold">{selected.data.name}</span>
          {selected.metrics.roe > reference.metrics.roe ? (
            <span className="text-customer"> outperforms </span>
          ) : (
            <span className="text-competitor"> underperforms </span>
          )}
          <span className="font-semibold">{reference.data.name}</span>
          {' on ROE by '}
          <span className="font-mono">
            {fmtDelta(selected.metrics.roe - reference.metrics.roe)}
          </span>
          {'.'}
          {selected.metrics.roic != null &&
            reference.metrics.roic != null && (
              <>
                {' ROIC is '}
                <span className="font-mono">{fmtPct(selected.metrics.roic)}</span>
                {' vs '}
                <span className="font-mono">{fmtPct(reference.metrics.roic)}</span>
                {' for the reference.'}
              </>
            )}
        </div>
      </div>
    </div>
  );
}
