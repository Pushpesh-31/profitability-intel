import type { Company } from '../../types';
import { fmt, fmtPct, fmtDelta } from '../../utils/formatters';
import { cn } from '../../utils/cn';

interface DuPontWaterfallProps {
  company: Company;
}

export function DuPontWaterfall({ company }: DuPontWaterfallProps) {
  const { metrics, color } = company;

  const steps = [
    { label: 'ROS', value: fmtPct(metrics.ros), sublabel: 'Return on Sales' },
    { label: '×', isOperator: true },
    { label: 'TATO', value: fmt(metrics.tato), sublabel: 'Asset Turnover' },
    { label: '×', isOperator: true },
    { label: 'Leverage', value: fmt(metrics.leverage), sublabel: 'Financial Leverage' },
    { label: '=', isOperator: true },
    { label: 'ROA', value: fmtPct(metrics.roa), sublabel: 'Return on Assets' },
    { label: '×', isOperator: true },
    { label: 'ROE', value: fmtPct(metrics.roe), sublabel: 'Return on Equity', isHighlight: true },
  ];

  // Determine ROE color based on value
  const getRoeColor = (roe: number) => {
    if (roe >= 0.15) return 'text-customer';
    if (roe >= 0.08) return 'text-reference';
    return 'text-competitor';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-4">
        DuPont Decomposition
      </h3>

      {/* Main Chain */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-4">
        {steps.map((step, index) => {
          if (step.isOperator) {
            return (
              <span
                key={index}
                className="text-muted text-xl font-light px-1 flex-shrink-0"
              >
                {step.label}
              </span>
            );
          }

          return (
            <div
              key={index}
              className={cn(
                'flex-1 min-w-[80px] bg-bg border rounded-lg p-3 text-center',
                step.isHighlight
                  ? 'border-2'
                  : 'border-border'
              )}
              style={step.isHighlight ? { borderColor: color } : undefined}
            >
              <div className="text-xs text-muted uppercase tracking-wider mb-1">
                {step.label}
              </div>
              <div
                className={cn(
                  'font-mono text-lg font-medium',
                  step.isHighlight ? getRoeColor(metrics.roe) : 'text-text'
                )}
              >
                {step.value}
              </div>
              {step.sublabel && (
                <div className="text-xs text-muted mt-1 hidden sm:block">
                  {step.sublabel}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Abnormal ROE Section */}
      {metrics.abnormalRoe != null && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-muted">Cost of Equity:</span>
              <span className="font-mono text-text">
                {metrics.effectiveCoe != null ? fmtPct(metrics.effectiveCoe) : '—'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted">Abnormal ROE:</span>
              <span
                className={cn(
                  'font-mono font-medium',
                  metrics.abnormalRoe >= 0 ? 'text-customer' : 'text-competitor'
                )}
              >
                {fmtDelta(metrics.abnormalRoe)}
                {metrics.abnormalRoe >= 0 ? ' ▲' : ' ▼'}
              </span>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded',
                  metrics.abnormalRoe >= 0
                    ? 'bg-customer/10 text-customer'
                    : 'bg-competitor/10 text-competitor'
                )}
              >
                {metrics.abnormalRoe >= 0 ? 'Value Creating' : 'Value Destroying'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
