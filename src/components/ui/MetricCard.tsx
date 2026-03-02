import { cn } from '../../utils/cn';

interface MetricCardProps {
  label: string;
  value: string;
  sublabel?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  valueColor?: 'default' | 'positive' | 'negative' | 'accent';
}

export function MetricCard({
  label,
  value,
  sublabel,
  color,
  size = 'md',
  valueColor = 'default',
}: MetricCardProps) {
  const valueColorClass = {
    default: 'text-text',
    positive: 'text-customer',
    negative: 'text-competitor',
    accent: 'text-accent',
  }[valueColor];

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg p-4',
        size === 'sm' && 'p-3',
        size === 'lg' && 'p-5'
      )}
      style={color ? { borderLeftColor: color, borderLeftWidth: '3px' } : undefined}
    >
      <div className="text-muted text-xs uppercase tracking-wider mb-1">
        {label}
      </div>
      <div
        className={cn(
          'font-mono font-medium',
          valueColorClass,
          size === 'sm' && 'text-lg',
          size === 'md' && 'text-2xl',
          size === 'lg' && 'text-3xl'
        )}
      >
        {value}
      </div>
      {sublabel && (
        <div className="text-muted text-xs mt-1">{sublabel}</div>
      )}
    </div>
  );
}
