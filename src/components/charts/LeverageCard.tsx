import type { ExtendedMetrics } from '../../types';
import { fmt } from '../../utils/formatters';
import { cn } from '../../utils/cn';

interface LeverageCardProps {
  type: 'operating' | 'financial';
  metrics: ExtendedMetrics;
}

export function LeverageCard({ type, metrics }: LeverageCardProps) {
  const isOperating = type === 'operating';

  const title = isOperating
    ? 'Degree of Operating Leverage (DOL)'
    : 'Degree of Financial Leverage (DFL)';

  const pointInTime = isOperating
    ? metrics.dolPointInTime
    : metrics.dflPointInTime;

  const yoy = isOperating ? metrics.dolYoY : metrics.dflYoY;

  const description = isOperating
    ? 'Measures sensitivity of EBIT to revenue changes'
    : 'Measures sensitivity of Net Income to EBIT changes';

  const formula = isOperating
    ? 'Gross Profit / Operating Income'
    : 'EBIT / EBT';

  const yoyFormula = isOperating
    ? '%Δ EBIT / %Δ Revenue'
    : '%Δ Net Income / %Δ EBIT';

  // Interpretation thresholds
  const getInterpretation = (value: number | null) => {
    if (value == null) return { label: 'N/A', color: 'text-muted' };
    if (isOperating) {
      if (value > 3) return { label: 'High', color: 'text-competitor' };
      if (value > 2) return { label: 'Moderate', color: 'text-reference' };
      return { label: 'Low', color: 'text-customer' };
    } else {
      if (value > 2) return { label: 'High', color: 'text-competitor' };
      if (value > 1.5) return { label: 'Moderate', color: 'text-reference' };
      return { label: 'Low', color: 'text-customer' };
    }
  };

  const interpretation = getInterpretation(pointInTime);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h4 className="text-xs font-medium text-muted uppercase tracking-wider mb-1">
        {title}
      </h4>
      <p className="text-xs text-muted mb-3">{description}</p>

      {/* Main Value */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-mono text-3xl font-medium text-text">
          {pointInTime != null ? fmt(pointInTime) : '—'}
        </span>
        <span
          className={cn(
            'text-sm px-2 py-0.5 rounded',
            interpretation.color,
            interpretation.color === 'text-customer' && 'bg-customer/10',
            interpretation.color === 'text-reference' && 'bg-reference/10',
            interpretation.color === 'text-competitor' && 'bg-competitor/10',
            interpretation.color === 'text-muted' && 'bg-border'
          )}
        >
          {interpretation.label} Leverage
        </span>
      </div>

      {/* Methods */}
      <div className="space-y-3 text-sm">
        {/* Point-in-Time */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-muted">Point-in-Time</span>
            <div className="text-xs text-muted/70">{formula}</div>
          </div>
          <span className="font-mono text-text">
            {pointInTime != null ? fmt(pointInTime) : '—'}
          </span>
        </div>

        {/* YoY Change */}
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <div>
            <span className="text-muted">Year-over-Year</span>
            <div className="text-xs text-muted/70">{yoyFormula}</div>
          </div>
          <span
            className={cn(
              'font-mono',
              yoy != null ? 'text-text' : 'text-muted'
            )}
          >
            {yoy != null ? fmt(yoy) : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
