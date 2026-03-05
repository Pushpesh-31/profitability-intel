/**
 * Custom Error Types for Finance API
 *
 * Provides structured error handling with specific error codes
 * for different failure scenarios when fetching financial data.
 */

export const ERROR_CODES = {
  TICKER_NOT_FOUND: 'TICKER_NOT_FOUND',
  INSUFFICIENT_DATA: 'INSUFFICIENT_DATA',
  RATE_LIMITED: 'RATE_LIMITED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  YAHOO_API_ERROR: 'YAHOO_API_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export class FinanceApiError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly statusCode: number,
    public readonly ticker: string,
    public readonly details?: string[]
  ) {
    super(message);
    this.name = 'FinanceApiError';
  }
}

/**
 * Extract a meaningful error message from any error type
 * Handles Error instances, strings, and plain objects with message/error properties
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') return error.message;
    if ('error' in error && typeof error.error === 'string') return error.error;
  }
  return 'Unknown error occurred';
}

/**
 * Classify a Yahoo Finance error into a structured FinanceApiError
 */
export function classifyYahooError(error: Error, ticker: string): FinanceApiError {
  const message = error.message.toLowerCase();

  if (
    message.includes('not found') ||
    message.includes('404') ||
    message.includes('no data') ||
    message.includes('no fundamentals')
  ) {
    return new FinanceApiError(
      `Ticker '${ticker}' not found or has no financial data available`,
      ERROR_CODES.TICKER_NOT_FOUND,
      404,
      ticker
    );
  }

  if (
    message.includes('rate limit') ||
    message.includes('429') ||
    message.includes('too many requests')
  ) {
    return new FinanceApiError(
      'Yahoo Finance rate limit exceeded. Please try again in a few minutes.',
      ERROR_CODES.RATE_LIMITED,
      429,
      ticker
    );
  }

  if (
    message.includes('network') ||
    message.includes('econnrefused') ||
    message.includes('timeout') ||
    message.includes('enotfound')
  ) {
    return new FinanceApiError(
      'Network error connecting to Yahoo Finance. Please check your connection.',
      ERROR_CODES.NETWORK_ERROR,
      503,
      ticker
    );
  }

  // Default unknown error
  return new FinanceApiError(
    `Failed to fetch data for '${ticker}': ${error.message}`,
    ERROR_CODES.YAHOO_API_ERROR,
    500,
    ticker
  );
}
