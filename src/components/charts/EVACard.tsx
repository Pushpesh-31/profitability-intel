import type { ExtendedMetrics } from '../../types';
import { fmtPct, fmtMillions, fmtDelta } from '../../utils/formatters';
import { cn } from '../../utils/cn';

interface EVACardProps {
  metrics: ExtendedMetrics;
  currency?: string;
}

export function EVACard({ metrics, currency = 'USD' }: EVACardProps) {
  const currencySymbol = currency === 'EUR' ? '€' : '$';
  const isPositive = metrics.eva != null && metrics.eva > 0;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h4 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
        Economic Value Added
      </h4>

      {/* Main EVA Value */}
      <div className="flex items-baseline gap-2 mb-4">
        <span
          className={cn(
            'font-mono text-3xl font-medium',
            metrics.eva != null
              ? isPositive
                ? 'text-customer'
                : 'text-competitor'
              : 'text-muted'
          )}
        >
          {metrics.eva != null
            ? fmtMillions(metrics.eva, currencySymbol)
            : '—'}
        </span>
        {metrics.eva != null && (
          <span
            className={cn(
              'text-sm px-2 py-0.5 rounded',
              isPositive
                ? 'bg-customer/10 text-customer'
                : 'bg-competitor/10 text-competitor'
            )}
          >
            {isPositive ? 'Value Creating' : 'Value Destroying'}
          </span>
        )}
      </div>

      {/* Breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">WACC</span>
          <span className="font-mono text-text">
            {metrics.wacc != null ? fmtPct(metrics.wacc) : '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Capital Charge</span>
          <span className="font-mono text-text">
            {metrics.wacc != null
              ? fmtMillions(
                  metrics.investedCapital * metrics.wacc,
                  currencySymbol
                )
              : '—'}
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t border-border">
          <span className="text-muted">EVA Margin</span>
          <span
            className={cn(
              'font-mono',
              metrics.evaNormalized != null
                ? metrics.evaNormalized > 0
                  ? 'text-customer'
                  : 'text-competitor'
                : 'text-text'
            )}
          >
            {metrics.evaNormalized != null
              ? fmtDelta(metrics.evaNormalized)
              : '—'}
          </span>
        </div>
      </div>

      {/* WACC Components */}
      <div className="mt-3 pt-3 border-t border-border space-y-1 text-xs">
        <div className="flex justify-between text-muted">
          <span>Equity Weight</span>
          <span className="font-mono">{fmtPct(metrics.equityWeight)}</span>
        </div>
        <div className="flex justify-between text-muted">
          <span>Debt Weight</span>
          <span className="font-mono">{fmtPct(metrics.debtWeight)}</span>
        </div>
        <div className="flex justify-between text-muted">
          <span>Cost of Debt</span>
          <span className="font-mono">
            {metrics.costOfDebt != null ? fmtPct(metrics.costOfDebt) : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
