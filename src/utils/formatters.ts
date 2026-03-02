/**
 * Number Formatting Utilities
 *
 * All financial numbers should use these formatters for consistency.
 * Use font-mono class in UI for proper display.
 */

/**
 * Format a number with suffix (e.g., "2.14x" for multiplier)
 */
export function fmt(value: number | null | undefined, decimals = 2): string {
  if (value == null || !isFinite(value)) return '—';
  return `${value.toFixed(decimals)}x`;
}

/**
 * Format a number as percentage (e.g., "15.2%")
 */
export function fmtPct(value: number | null | undefined, decimals = 1): string {
  if (value == null || !isFinite(value)) return '—';
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a number in millions/billions (e.g., "$38.2B" or "$412M")
 */
export function fmtMillions(value: number | null | undefined, currency = '$'): string {
  if (value == null || !isFinite(value)) return '—';

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1000) {
    return `${sign}${currency}${(absValue / 1000).toFixed(1)}B`;
  }
  if (absValue >= 1) {
    return `${sign}${currency}${absValue.toFixed(0)}M`;
  }
  return `${sign}${currency}${absValue.toFixed(1)}M`;
}

/**
 * Format a delta/change value with sign (e.g., "+5.4%" or "-1.3%")
 */
export function fmtDelta(value: number | null | undefined, decimals = 1): string {
  if (value == null || !isFinite(value)) return '—';

  const sign = value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a raw number with commas (e.g., "1,234,567")
 */
export function fmtNumber(value: number | null | undefined, decimals = 0): string {
  if (value == null || !isFinite(value)) return '—';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format currency value (e.g., "$1,234.56")
 */
export function fmtCurrency(
  value: number | null | undefined,
  currency = 'USD',
  decimals = 0
): string {
  if (value == null || !isFinite(value)) return '—';

  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CHF: 'CHF ',
  };

  const symbol = symbols[currency] ?? `${currency} `;
  return `${symbol}${fmtNumber(value, decimals)}`;
}
