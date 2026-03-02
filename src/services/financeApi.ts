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
  const response = await axios.get<FinanceApiResponse>(
    `${API_BASE}/${ticker}/full`,
    { params: { category } }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to fetch financial data');
  }

  return response.data.data;
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
