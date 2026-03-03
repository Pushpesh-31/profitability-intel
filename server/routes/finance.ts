/**
 * Finance API Routes
 *
 * GET /api/finance/:ticker/full?category=competitor
 *   - Fetches financial data from Yahoo Finance
 *   - Uses fundamentalsTimeSeries for financial statements (post-Nov 2024 API)
 *   - Uses quoteSummary for basic info (name, sector, beta)
 *   - Transforms to FinancialData shape
 *   - Caches results for 1 hour
 */

import { Router } from 'express';
import YahooFinance from 'yahoo-finance2';
import NodeCache from 'node-cache';
import { transformFundamentalsData, validateFinancialData } from '../utils/transformer';
import { FinanceApiError, classifyYahooError, ERROR_CODES } from '../utils/errors';
import type { CompanyCategory } from '../../src/types';

const router = Router();

// Initialize Yahoo Finance client (required in v3.x)
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// Cache with 1 hour TTL
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

/**
 * GET /api/finance/:ticker/full
 *
 * Query params:
 *   - category: 'competitor' | 'customer' | 'reference' (required)
 */
router.get('/:ticker/full', async (req, res) => {
  const { ticker } = req.params;
  const category = req.query.category as CompanyCategory | undefined;

  if (!ticker) {
    return res.status(400).json({
      success: false,
      error: 'Ticker is required',
    });
  }

  if (!category || !['competitor', 'customer', 'reference'].includes(category)) {
    return res.status(400).json({
      success: false,
      error: 'Valid category is required (competitor, customer, or reference)',
    });
  }

  const normalizedTicker = ticker.toUpperCase();
  const cacheKey = `${normalizedTicker}:${category}`;

  // Check cache
  const cached = cache.get(cacheKey);
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
    cache.set(cacheKey, financialData);

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
      error instanceof Error ? error : new Error(String(error)),
      normalizedTicker
    );

    console.error(`[yahoo] ${classifiedError.code} for ${normalizedTicker}:`, error);

    return res.status(classifiedError.statusCode).json({
      success: false,
      error: classifiedError.message,
      code: classifiedError.code,
    });
  }
});

/**
 * GET /api/finance/:ticker/validate
 *
 * Quick check if a ticker is valid
 */
router.get('/:ticker/validate', async (req, res) => {
  const { ticker } = req.params;

  if (!ticker) {
    return res.status(400).json({ valid: false, error: 'Ticker is required' });
  }

  try {
    const result = await yahooFinance.quote(ticker.toUpperCase());
    return res.json({
      valid: true,
      name: result.longName || result.shortName || ticker,
      symbol: result.symbol,
    });
  } catch {
    return res.json({ valid: false, error: 'Ticker not found' });
  }
});

export { router as financeRouter };
