/**
 * Finance API - Full Financial Data Endpoint
 * GET /api/finance/:ticker/full?category=competitor
 *
 * Fetches financial data from Yahoo Finance and transforms it to FinancialData shape.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import yahooFinance from '../../../lib/yahoo-finance.js';
import { transformFundamentalsData, validateFinancialData } from '../../../lib/transformer.js';
import type { CompanyCategory } from '../../../lib/transformer.js';
import { FinanceApiError, classifyYahooError, ERROR_CODES, getErrorMessage } from '../../../lib/errors.js';
import { getCache, setCache } from '../../../lib/cache.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  const { ticker } = req.query;
  const category = req.query.category as CompanyCategory | undefined;

  // Validate ticker
  if (!ticker || typeof ticker !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Ticker is required',
    });
  }

  // Validate category
  if (!category || !['competitor', 'customer', 'reference'].includes(category)) {
    return res.status(400).json({
      success: false,
      error: 'Valid category is required (competitor, customer, or reference)',
    });
  }

  const normalizedTicker = ticker.toUpperCase();
  const cacheKey = `${normalizedTicker}:${category}`;

  // Check cache
  const cached = getCache(cacheKey);
  if (cached) {
    console.log(`[cache] Hit for ${cacheKey}`);
    return res.json({ success: true, data: cached, cached: true });
  }

  try {
    console.log(`[yahoo] Fetching data for ${normalizedTicker}...`);

    // Calculate date range for last 3 years (need current + prior year for averages)
    const now = new Date();
    const threeYearsAgo = new Date(now.getFullYear() - 3, 0, 1);

    // Fetch data in parallel
    const [financialsData, balanceSheetData, quoteSummaryData] = await Promise.all([
      // Income statement / financials
      yahooFinance.fundamentalsTimeSeries(normalizedTicker, {
        period1: threeYearsAgo.toISOString().split('T')[0],
        type: 'annual',
        module: 'financials',
      }),
      // Balance sheet
      yahooFinance.fundamentalsTimeSeries(normalizedTicker, {
        period1: threeYearsAgo.toISOString().split('T')[0],
        type: 'annual',
        module: 'balance-sheet',
      }),
      // Basic info (name, sector, beta)
      yahooFinance.quoteSummary(normalizedTicker, {
        modules: ['summaryProfile', 'defaultKeyStatistics', 'price'],
      }),
    ]);

    // Log what we received for debugging
    console.log(`[yahoo] Data received for ${normalizedTicker}:`, {
      financialsYears: financialsData?.length ?? 0,
      balanceSheetYears: balanceSheetData?.length ?? 0,
      hasProfile: !!quoteSummaryData?.summaryProfile,
      hasKeyStats: !!quoteSummaryData?.defaultKeyStatistics,
      hasPrice: !!quoteSummaryData?.price,
    });

    // Transform to our FinancialData shape
    const financialData = transformFundamentalsData(
      financialsData,
      balanceSheetData,
      quoteSummaryData,
      normalizedTicker,
      category
    );

    // Validate the transformed data has required fields
    const validation = validateFinancialData(financialData);

    if (!validation.valid) {
      console.error(`[yahoo] Validation failed for ${normalizedTicker}:`, validation.errors);
      throw new FinanceApiError(
        `Insufficient financial data for '${normalizedTicker}'`,
        ERROR_CODES.INSUFFICIENT_DATA,
        422,
        normalizedTicker,
        validation.errors
      );
    }

    if (validation.warnings.length > 0) {
      console.warn(`[yahoo] Warnings for ${normalizedTicker}:`, validation.warnings);
    }

    // Cache the result
    setCache(cacheKey, financialData);

    console.log(`[yahoo] Successfully fetched ${normalizedTicker}`);
    return res.json({
      success: true,
      data: financialData,
      cached: false,
      warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
    });
  } catch (error) {
    // If it's already our custom error, use it directly
    if (error instanceof FinanceApiError) {
      console.error(`[yahoo] ${error.code} for ${normalizedTicker}:`, error.message);
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
      });
    }

    // Classify the Yahoo Finance error
    const classifiedError = classifyYahooError(
      error instanceof Error ? error : new Error(getErrorMessage(error)),
      normalizedTicker
    );

    console.error(`[yahoo] ${classifiedError.code} for ${normalizedTicker}:`, error);

    return res.status(classifiedError.statusCode).json({
      success: false,
      error: classifiedError.message,
      code: classifiedError.code,
    });
  }
}
