import type { CompanyCategory } from '../../types';
import { CATEGORY_COLORS } from '../../types';
import { cn } from '../../utils/cn';

interface CategoryBadgeProps {
  category: CompanyCategory;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  const color = CATEGORY_COLORS[category];
  const label = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
      style={{
        backgroundColor: `${color}15`,
        color: color,
        border: `1px solid ${color}30`,
      }}
    >
      {label}
    </span>
  );
}
