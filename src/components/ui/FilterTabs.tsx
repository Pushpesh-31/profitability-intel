import { useAppStore, useCategoryCounts } from '../../store/useAppStore';
import type { CompanyCategory } from '../../types';
import { cn } from '../../utils/cn';

type FilterOption = 'all' | CompanyCategory;

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'competitor', label: 'Competitors' },
  { value: 'customer', label: 'Customers' },
  { value: 'reference', label: 'Reference' },
];

export function FilterTabs() {
  const activeFilter = useAppStore((state) => state.activeFilter);
  const setFilter = useAppStore((state) => state.setFilter);
  const counts = useCategoryCounts();

  return (
    <div className="flex items-center gap-1 bg-card rounded-lg p-1 border border-border">
      {FILTER_OPTIONS.map(({ value, label }) => {
        const count = counts[value];
        const isActive = activeFilter === value;

        return (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-accent text-bg'
                : 'text-muted hover:text-text'
            )}
          >
            <span>{label}</span>
            <span
              className={cn(
                'px-1.5 py-0.5 rounded text-xs font-mono',
                isActive ? 'bg-bg/20 text-bg' : 'bg-border text-muted'
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
