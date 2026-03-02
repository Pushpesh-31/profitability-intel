/**
 * Finance API Routes
 *
 * GET /api/finance/:ticker/full?category=competitor
 *   - Fetches financial data from Yahoo Finance
 *   - Transforms to FinancialData shape
 *   - Caches results for 1 hour
 */

import { Router } from 'express';
import yahooFinance from 'yahoo-finance2';
import NodeCache from 'node-cache';
import { transformYahooData } from '../utils/transformer';
import type { CompanyCategory } from '../../src/types';

const router = Router();

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

    // Fetch from Yahoo Finance
    const result = await yahooFinance.quoteSummary(normalizedTicker, {
      modules: [
        'incomeStatementHistory',
        'balanceSheetHistory',
        'defaultKeyStatistics',
        'summaryProfile',
        'financialData',
        'price',
      ],
    });

    // Transform to our FinancialData shape
    const financialData = transformYahooData(result, normalizedTicker, category);

    // Cache the result
    cache.set(cacheKey, financialData);

    console.log(`[yahoo] Successfully fetched ${normalizedTicker}`);
    return res.json({ success: true, data: financialData, cached: false });
  } catch (error) {
    console.error(`[yahoo] Error fetching ${normalizedTicker}:`, error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    // Check for common error types
    if (errorMessage.includes('Not Found') || errorMessage.includes('404')) {
      return res.status(404).json({
        success: false,
        error: `Ticker '${normalizedTicker}' not found`,
      });
    }

    return res.status(500).json({
      success: false,
      error: `Failed to fetch data for ${normalizedTicker}: ${errorMessage}`,
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
