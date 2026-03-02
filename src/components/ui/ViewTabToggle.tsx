import { useAppStore } from '../../store/useAppStore';
import type { ViewTab } from '../../types';
import { cn } from '../../utils/cn';

export function ViewTabToggle() {
  const activeViewTab = useAppStore((state) => state.activeViewTab);
  const setViewTab = useAppStore((state) => state.setViewTab);

  const tabs: { value: ViewTab; label: string }[] = [
    { value: 'deep-dive', label: 'Deep Dive' },
    { value: 'compare', label: 'Compare' },
  ];

  return (
    <div className="flex items-center gap-1 bg-card rounded-lg p-1 border border-border">
      {tabs.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setViewTab(value)}
          className={cn(
            'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
            activeViewTab === value
              ? 'bg-accent text-bg'
              : 'text-muted hover:text-text'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
