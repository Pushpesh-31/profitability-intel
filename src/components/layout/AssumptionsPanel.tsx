import { useAppStore } from '../../store/useAppStore';
import { fmtPct } from '../../utils/formatters';
import { estimateCOE } from '../../utils/capm';
import { estimateCostOfDebt, computeCapitalWeights } from '../../utils/wacc';
import { CategoryBadge } from '../ui/CategoryBadge';

export function AssumptionsPanel() {
  const {
    assumptionsPanelOpen,
    assumptions,
    companies,
    updateAssumptions,
    setCoeOverride,
    setCostOfDebtOverride,
    setDebtWeightOverride,
  } = useAppStore();

  if (!assumptionsPanelOpen) return null;

  const handleRfrChange = (value: number) => {
    updateAssumptions({ riskFreeRate: value });
  };

  const handleErpChange = (value: number) => {
    updateAssumptions({ equityRiskPremium: value });
  };

  // Preview COE for beta = 1.0
  const previewCOE = estimateCOE(1.0, assumptions);

  return (
    <div className="mb-6 bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-text uppercase tracking-wider">
          CAPM Assumptions
        </h3>
      </div>

      <div className="p-4 space-y-6">
        {/* Global CAPM Inputs */}
        <div className="grid grid-cols-2 gap-6">
          {/* Risk-Free Rate */}
          <div>
            <label className="block text-sm text-muted mb-2">
              Risk-Free Rate
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="0.10"
                step="0.001"
                value={assumptions.riskFreeRate}
                onChange={(e) => handleRfrChange(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono text-text w-16 text-right">
                {fmtPct(assumptions.riskFreeRate)}
              </span>
            </div>
          </div>

          {/* Equity Risk Premium */}
          <div>
            <label className="block text-sm text-muted mb-2">
              Equity Risk Premium
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0.03"
                max="0.09"
                step="0.001"
                value={assumptions.equityRiskPremium}
                onChange={(e) => handleErpChange(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="font-mono text-text w-16 text-right">
                {fmtPct(assumptions.equityRiskPremium)}
              </span>
            </div>
          </div>
        </div>

        {/* Preview Line */}
        <div className="text-sm text-muted">
          At these settings, CAPM COE for β=1.0 ={' '}
          <span className="font-mono text-accent">{fmtPct(previewCOE)}</span>
        </div>

        {/* Per-Company Override Tables */}
        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium text-muted mb-3 uppercase tracking-wider">
            Cost of Equity Overrides
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted text-xs uppercase">
                  <th className="text-left py-2 pr-4">Ticker</th>
                  <th className="text-left py-2 pr-4">Category</th>
                  <th className="text-right py-2 pr-4">Beta</th>
                  <th className="text-right py-2 pr-4">CAPM COE</th>
                  <th className="text-right py-2 pr-4">Override</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => {
                  const capmCoe = company.data.beta
                    ? estimateCOE(company.data.beta, assumptions)
                    : company.data.coeEstimate;
                  const override = assumptions.coeOverrides[company.data.ticker];

                  return (
                    <tr key={company.data.ticker} className="border-t border-border">
                      <td className="py-3 pr-4 font-mono text-text">
                        {company.data.ticker}
                      </td>
                      <td className="py-3 pr-4">
                        <CategoryBadge category={company.data.category} size="sm" />
                      </td>
                      <td className="py-3 pr-4 text-right font-mono text-muted">
                        {company.data.beta?.toFixed(2) ?? '—'}
                      </td>
                      <td className="py-3 pr-4 text-right font-mono text-muted">
                        {capmCoe ? fmtPct(capmCoe) : '—'}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <input
                          type="number"
                          step="0.001"
                          placeholder={capmCoe ? fmtPct(capmCoe) : '—'}
                          value={override ?? ''}
                          onChange={(e) =>
                            setCoeOverride(
                              company.data.ticker,
                              e.target.value ? parseFloat(e.target.value) : null
                            )
                          }
                          className="w-20 bg-bg border border-border rounded px-2 py-1
                                     font-mono text-sm text-text text-right
                                     focus:border-accent focus:outline-none"
                        />
                      </td>
                      <td className="py-3">
                        {override != null && (
                          <button
                            onClick={() => setCoeOverride(company.data.ticker, null)}
                            className="text-muted hover:text-competitor text-xs"
                          >
                            Reset
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cost of Debt & Capital Structure */}
        <div className="border-t border-border pt-4">
          <h4 className="text-sm font-medium text-muted mb-3 uppercase tracking-wider">
            Cost of Debt & Capital Structure
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted text-xs uppercase">
                  <th className="text-left py-2 pr-4">Ticker</th>
                  <th className="text-right py-2 pr-4">Est. COD</th>
                  <th className="text-right py-2 pr-4">COD Override</th>
                  <th className="text-right py-2 pr-4">Debt Weight</th>
                  <th className="text-right py-2 pr-4">Weight Override</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => {
                  const estCod = estimateCostOfDebt(company.data);
                  const { debtWeight } = computeCapitalWeights(company.data);
                  const codOverride =
                    assumptions.costOfDebtOverrides[company.data.ticker];
                  const weightOverride =
                    assumptions.debtWeightOverrides[company.data.ticker];

                  return (
                    <tr key={company.data.ticker} className="border-t border-border">
                      <td className="py-3 pr-4 font-mono text-text">
                        {company.data.ticker}
                      </td>
                      <td className="py-3 pr-4 text-right font-mono text-muted">
                        {estCod ? fmtPct(estCod) : '—'}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <input
                          type="number"
                          step="0.001"
                          placeholder={estCod ? fmtPct(estCod) : '—'}
                          value={codOverride ?? ''}
                          onChange={(e) =>
                            setCostOfDebtOverride(
                              company.data.ticker,
                              e.target.value ? parseFloat(e.target.value) : null
                            )
                          }
                          className="w-20 bg-bg border border-border rounded px-2 py-1
                                     font-mono text-sm text-text text-right
                                     focus:border-accent focus:outline-none"
                        />
                      </td>
                      <td className="py-3 pr-4 text-right font-mono text-muted">
                        {fmtPct(debtWeight)}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          placeholder={fmtPct(debtWeight)}
                          value={weightOverride ?? ''}
                          onChange={(e) =>
                            setDebtWeightOverride(
                              company.data.ticker,
                              e.target.value ? parseFloat(e.target.value) : null
                            )
                          }
                          className="w-20 bg-bg border border-border rounded px-2 py-1
                                     font-mono text-sm text-text text-right
                                     focus:border-accent focus:outline-none"
                        />
                      </td>
                      <td className="py-3">
                        {(codOverride != null || weightOverride != null) && (
                          <button
                            onClick={() => {
                              setCostOfDebtOverride(company.data.ticker, null);
                              setDebtWeightOverride(company.data.ticker, null);
                            }}
                            className="text-muted hover:text-competitor text-xs"
                          >
                            Reset
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
