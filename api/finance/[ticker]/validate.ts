/**
 * Finance API - Ticker Validation Endpoint
 * GET /api/finance/:ticker/validate
 *
 * Quick check if a ticker is valid.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import yahooFinance from '../../../lib/yahoo-finance';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      valid: false,
      error: 'Method not allowed',
    });
  }

  const { ticker } = req.query;

  if (!ticker || typeof ticker !== 'string') {
    return res.status(400).json({
      valid: false,
      error: 'Ticker is required',
    });
  }

  try {
    const result = await yahooFinance.quote(ticker.toUpperCase());
    return res.json({
      valid: true,
      name: result.longName || result.shortName || ticker,
      symbol: result.symbol,
    });
  } catch {
    return res.json({
      valid: false,
      error: 'Ticker not found',
    });
  }
}
