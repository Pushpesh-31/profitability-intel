/**
 * Yahoo Finance Client Singleton
 *
 * Provides a pre-configured yahoo-finance2 client for use in serverless functions.
 * The client survives warm invocations, reducing cold start overhead.
 */

import YahooFinance from 'yahoo-finance2';

// Initialize Yahoo Finance client with survey notice suppression
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export default yahooFinance;
