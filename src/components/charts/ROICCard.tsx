import type { ExtendedMetrics } from '../../types';
import { fmtPct, fmtMillions } from '../../utils/formatters';
import { cn } from '../../utils/cn';

interface ROICCardProps {
  metrics: ExtendedMetrics;
  currency?: string;
}

export function ROICCard({ metrics, currency = 'USD' }: ROICCardProps) {
  const currencySymbol = currency === 'EUR' ? '€' : '$';

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h4 className="text-xs font-medium text-muted uppercase tracking-wider mb-3">
        Return on Invested Capital
      </h4>

      {/* Main ROIC Value */}
      <div className="flex items-baseline gap-2 mb-4">
        <span
          className={cn(
            'font-mono text-3xl font-medium',
            metrics.roic != null && metrics.roic > 0.10
              ? 'text-customer'
              : metrics.roic != null && metrics.roic > 0.05
                ? 'text-text'
                : 'text-competitor'
          )}
        >
          {metrics.roic != null ? fmtPct(metrics.roic) : '—'}
        </span>
        <span className="text-muted text-sm">ROIC</span>
      </div>

      {/* Breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">NOPAT</span>
          <span className="font-mono text-text">
            {metrics.nopat != null
              ? fmtMillions(metrics.nopat, currencySymbol)
              : '—'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Invested Capital</span>
          <span className="font-mono text-text">
            {fmtMillions(metrics.investedCapital, currencySymbol)}
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t border-border">
          <span className="text-muted">Effective Tax Rate</span>
          <span className="font-mono text-text">
            {metrics.effectiveTaxRate != null
              ? fmtPct(metrics.effectiveTaxRate)
              : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
