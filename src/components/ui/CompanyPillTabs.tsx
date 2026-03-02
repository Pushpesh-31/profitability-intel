import { useAppStore, useFilteredCompanies } from '../../store/useAppStore';
import { CATEGORY_COLORS } from '../../types';
import { cn } from '../../utils/cn';

export function CompanyPillTabs() {
  const selectedTicker = useAppStore((state) => state.selectedTicker);
  const selectCompany = useAppStore((state) => state.selectCompany);
  const removeCompany = useAppStore((state) => state.removeCompany);
  const filteredCompanies = useFilteredCompanies();

  if (filteredCompanies.length === 0) {
    return (
      <div className="py-4 text-muted text-sm">
        No companies in this category
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 py-3">
      {filteredCompanies.map((company) => {
        const isSelected = company.data.ticker === selectedTicker;
        const categoryColor = CATEGORY_COLORS[company.data.category];

        return (
          <div
            key={company.data.ticker}
            className={cn(
              'group flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer',
              'border transition-all',
              isSelected
                ? 'bg-accent/10 border-accent'
                : 'bg-card border-border hover:border-muted'
            )}
            onClick={() => selectCompany(company.data.ticker)}
          >
            {/* Color dot */}
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: company.color }}
            />

            {/* Ticker */}
            <span
              className={cn(
                'font-mono text-sm',
                isSelected ? 'text-accent' : 'text-text'
              )}
            >
              {company.data.ticker}
            </span>

            {/* Category dot */}
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: categoryColor }}
            />

            {/* Remove button (on hover) */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeCompany(company.data.ticker);
              }}
              className="hidden group-hover:block text-muted hover:text-competitor text-xs ml-1"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
