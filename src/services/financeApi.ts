/**
 * Finance API Service
 *
 * React Query hooks for fetching financial data from the backend proxy.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { FinancialData, CompanyCategory, FinanceApiResponse } from '../types';
import { useAppStore } from '../store/useAppStore';

const API_BASE = '/api/finance';

/**
 * Fetch full financial data for a ticker
 */
async function fetchFinancialData(
  ticker: string,
  category: CompanyCategory
): Promise<FinancialData> {
  try {
    const response = await axios.get<FinanceApiResponse>(
      `${API_BASE}/${ticker}/full`,
      { params: { category } }
    );

    if (!response.data.success || !response.data.data) {
      // Build detailed error message
      const errorParts = [response.data.error || 'Failed to fetch financial data'];
      if (response.data.details?.length) {
        errorParts.push(`Missing: ${response.data.details.join(', ')}`);
      }
      throw new Error(errorParts.join('. '));
    }

    // Log warnings if present (non-critical issues)
    if (response.data.warnings?.length) {
      console.warn(`[finance] Warnings for ${ticker}:`, response.data.warnings);
    }

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;

      // Handle structured error response
      if (responseData && typeof responseData === 'object' && 'error' in responseData) {
        const apiError = responseData as FinanceApiResponse;
        const errorParts = [apiError.error];
        if (apiError.details?.length) {
          errorParts.push(`Missing: ${apiError.details.join(', ')}`);
        }
        throw new Error(errorParts.join('. '));
      }

      // Handle string error response
      if (typeof responseData === 'string' && responseData.length > 0) {
        throw new Error(responseData);
      }

      // Handle connection errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to server. Is the backend running?');
      }

      // Use axios error message as fallback
      throw new Error(error.message || `Request failed with status ${error.response?.status}`);
    }

    // Handle non-axios errors
    if (error instanceof Error) {
      throw error;
    }

    // Handle unknown error types
    throw new Error(typeof error === 'string' ? error : 'An unexpected error occurred');
  }
}

/**
 * Validate a ticker symbol
 */
async function validateTicker(
  ticker: string
): Promise<{ valid: boolean; name?: string; error?: string }> {
  const response = await axios.get(`${API_BASE}/${ticker}/validate`);
  return response.data;
}

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to fetch and add a company
 */
export function useAddCompany() {
  const queryClient = useQueryClient();
  const addCompany = useAppStore((state) => state.addCompany);

  return useMutation({
    mutationFn: async ({
      ticker,
      category,
    }: {
      ticker: string;
      category: CompanyCategory;
    }) => {
      const data = await fetchFinancialData(ticker, category);
      return data;
    },
    onSuccess: (data) => {
      addCompany(data);
      // Invalidate any cached queries for this ticker
      queryClient.invalidateQueries({ queryKey: ['finance', data.ticker] });
    },
  });
}

/**
 * Hook to validate a ticker
 */
export function useValidateTicker(ticker: string, enabled = false) {
  return useQuery({
    queryKey: ['validate', ticker],
    queryFn: () => validateTicker(ticker),
    enabled: enabled && ticker.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to prefetch financial data (for hover/preview)
 */
export function usePrefetchCompany() {
  const queryClient = useQueryClient();

  return (ticker: string, category: CompanyCategory) => {
    queryClient.prefetchQuery({
      queryKey: ['finance', ticker, category],
      queryFn: () => fetchFinancialData(ticker, category),
      staleTime: 60 * 60 * 1000, // 1 hour
    });
  };
}
