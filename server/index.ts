/**
 * Express Proxy Server for Yahoo Finance API
 *
 * Runs on port 3001. The Vite dev server proxies /api requests here.
 *
 * This proxy is necessary because:
 * 1. Yahoo Finance blocks direct browser requests (CORS)
 * 2. We can implement caching to reduce API calls
 * 3. We can transform the response to our FinancialData shape
 */

import express from 'express';
import cors from 'cors';
import { financeRouter } from './routes/finance';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/finance', financeRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Server error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'Internal server error',
    });
  }
);

app.listen(PORT, () => {
  console.log(`[server] Proxy server running on http://localhost:${PORT}`);
  console.log(`[server] Finance API: http://localhost:${PORT}/api/finance/:ticker/full`);
});
