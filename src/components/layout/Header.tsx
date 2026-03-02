import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useAddCompany } from '../../services/financeApi';
import type { CompanyCategory } from '../../types';
import { cn } from '../../utils/cn';

export function Header() {
  const [ticker, setTicker] = useState('');
  const [category, setCategory] = useState<CompanyCategory>('competitor');
  const toggleAssumptionsPanel = useAppStore(
    (state) => state.toggleAssumptionsPanel
  );
  const assumptionsPanelOpen = useAppStore(
    (state) => state.assumptionsPanelOpen
  );

  const addCompanyMutation = useAddCompany();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    addCompanyMutation.mutate(
      { ticker: ticker.trim().toUpperCase(), category },
      {
        onSuccess: () => {
          setTicker('');
        },
      }
    );
  };

  return (
    <header className="mb-6">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Title */}
        <div>
          <h1 className="text-2xl font-semibold text-text">
            Profitability Intelligence
          </h1>
          <p className="text-muted text-sm mt-1">
            AspenTech / Emerson Competitive Intelligence
          </p>
        </div>

        {/* Right: Add Company Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          {/* Category Selector */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CompanyCategory)}
            className="bg-card border border-border rounded-md px-3 py-2 text-text text-sm
                       focus:border-accent focus:outline-none"
          >
            <option value="competitor">Competitor</option>
            <option value="customer">Customer</option>
            <option value="reference">Reference</option>
          </select>

          {/* Ticker Input */}
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Enter ticker..."
            className="bg-card border border-border rounded-md px-3 py-2 text-text font-mono
                       placeholder:text-muted text-sm w-32
                       focus:border-accent focus:outline-none"
          />

          {/* Add Button */}
          <button
            type="submit"
            disabled={addCompanyMutation.isPending || !ticker.trim()}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              'bg-accent text-bg hover:bg-accent/90',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {addCompanyMutation.isPending ? 'Adding...' : 'Add'}
          </button>

          {/* Assumptions Toggle */}
          <button
            type="button"
            onClick={toggleAssumptionsPanel}
            className={cn(
              'px-3 py-2 rounded-md text-sm font-medium transition-colors border',
              assumptionsPanelOpen
                ? 'bg-accent/10 border-accent text-accent'
                : 'bg-card border-border text-muted hover:text-text'
            )}
          >
            Assumptions
          </button>
        </form>
      </div>

      {/* Error Display */}
      {addCompanyMutation.isError && (
        <div className="mt-4 p-3 bg-competitor/10 border border-competitor/30 rounded-md text-competitor text-sm">
          {addCompanyMutation.error?.message || 'Failed to add company'}
        </div>
      )}
    </header>
  );
}
