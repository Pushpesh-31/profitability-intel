import type { Company } from '../../types';
import { fmtPct, fmtMillions, fmt } from '../../utils/formatters';
import { CategoryBadge } from '../ui/CategoryBadge';
import { MetricCard } from '../ui/MetricCard';
import { DuPontWaterfall } from '../charts/DuPontWaterfall';
import { ROICCard } from '../charts/ROICCard';
import { EVACard } from '../charts/EVACard';
import { LeverageCard } from '../charts/LeverageCard';

interface DeepDiveViewProps {
  company: Company;
}

export function DeepDiveView({ company }: DeepDiveViewProps) {
  const { data, metrics, color } = company;

  return (
    <div className="space-y-6">
      {/* Company Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <h2 className="text-xl font-semibold text-text">{data.name}</h2>
        <CategoryBadge category={data.category} />
        <span className="text-muted font-mono text-sm">
          {data.ticker} · {data.fiscalYear} · {data.currency}
        </span>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          label="Revenue"
          value={fmtMillions(data.revenue, data.currency === 'EUR' ? '€' : '$')}
          size="sm"
        />
        <MetricCard
          label="Net Income"
          value={fmtMillions(data.netIncome, data.currency === 'EUR' ? '€' : '$')}
          size="sm"
        />
        <MetricCard
          label="ROE"
          value={fmtPct(metrics.roe)}
          size="sm"
          valueColor={metrics.roe >= 0.15 ? 'positive' : metrics.roe >= 0.08 ? 'default' : 'negative'}
        />
        <MetricCard
          label="ROA"
          value={fmtPct(metrics.roa)}
          size="sm"
        />
        <MetricCard
          label="Gross Margin"
          value={fmtPct(metrics.grossMargin)}
          size="sm"
        />
        <MetricCard
          label="Leverage"
          value={fmt(metrics.leverage)}
          size="sm"
          valueColor={metrics.leverage > 3 ? 'negative' : 'default'}
        />
      </div>

      {/* DuPont Analysis */}
      <section>
        <DuPontWaterfall company={company} />
      </section>

      {/* ROIC & EVA */}
      <section>
        <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-3">
          Value Creation Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ROICCard metrics={metrics} currency={data.currency} />
          <EVACard metrics={metrics} currency={data.currency} />
        </div>
      </section>

      {/* Leverage Analysis */}
      <section>
        <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-3">
          Leverage Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LeverageCard type="operating" metrics={metrics} />
          <LeverageCard type="financial" metrics={metrics} />
        </div>

        {/* Combined DTL */}
        <div className="mt-4 p-4 bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-muted">
                Degree of Total Leverage (DOL × DFL)
              </span>
              <p className="text-xs text-muted/70 mt-1">
                Combined sensitivity of Net Income to Revenue changes
              </p>
            </div>
            <span className="font-mono text-2xl text-text">
              {metrics.dtl != null ? fmt(metrics.dtl) : '—'}
            </span>
          </div>
        </div>
      </section>

      {/* Additional Financial Details */}
      <section>
        <h3 className="text-sm font-medium text-muted uppercase tracking-wider mb-3">
          Financial Details
        </h3>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted mb-1">Sector</div>
              <div className="text-text">{data.sector}</div>
            </div>
            <div>
              <div className="text-muted mb-1">Total Assets</div>
              <div className="font-mono text-text">
                {fmtMillions(data.totalAssetsCurrent, data.currency === 'EUR' ? '€' : '$')}
              </div>
            </div>
            <div>
              <div className="text-muted mb-1">Total Debt</div>
              <div className="font-mono text-text">
                {fmtMillions(data.totalDebt, data.currency === 'EUR' ? '€' : '$')}
              </div>
            </div>
            <div>
              <div className="text-muted mb-1">Cash</div>
              <div className="font-mono text-text">
                {fmtMillions(data.cash, data.currency === 'EUR' ? '€' : '$')}
              </div>
            </div>
            <div>
              <div className="text-muted mb-1">Goodwill</div>
              <div className="font-mono text-text">
                {data.goodwill != null
                  ? fmtMillions(data.goodwill, data.currency === 'EUR' ? '€' : '$')
                  : '—'}
              </div>
            </div>
            <div>
              <div className="text-muted mb-1">Beta</div>
              <div className="font-mono text-text">
                {data.beta?.toFixed(2) ?? '—'}
              </div>
            </div>
            <div>
              <div className="text-muted mb-1">R&D Expense</div>
              <div className="font-mono text-text">
                {data.rdExpense != null
                  ? fmtMillions(data.rdExpense, data.currency === 'EUR' ? '€' : '$')
                  : '—'}
              </div>
            </div>
            <div>
              <div className="text-muted mb-1">Data Source</div>
              <div className="text-text text-xs">{data.dataNote}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
