# Profitability Intel

A financial intelligence dashboard for benchmarking companies using DuPont ROE decomposition analysis.

## Features

- **DuPont Analysis**: ROE = ROS x TATO x Leverage decomposition
- **Abnormal ROE**: ROE minus Cost of Equity (CAPM-based)
- **Multi-company comparison**: Table, radar chart, margin charts
- **Category filtering**: Competitors, Customers, Reference companies
- **Real-time data**: Yahoo Finance API integration
- **Adjustable assumptions**: Risk-free rate, equity risk premium, per-company COE overrides

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Zustand
- **Backend**: Vercel Serverless Functions
- **Data**: Yahoo Finance API (via yahoo-finance2)

## Local Development

```bash
# Install dependencies
npm install

# Start development server (frontend + backend)
npm run dev

# Type check
npm run type-check

# Build for production
npm run build
```

The app runs at `http://localhost:5173` with the API proxy at `http://localhost:3001`.

## Deployment

Deployed on Vercel. Push to `main` to auto-deploy.

```bash
# Deploy to Vercel
vercel --prod
```

## Project Structure

```
profitability-intel/
├── api/                    # Vercel serverless functions
├── lib/                    # Shared utilities for serverless
├── server/                 # Express backend (local development)
├── src/
│   ├── components/         # React components
│   ├── services/           # API hooks (React Query)
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript interfaces
│   └── utils/              # DuPont calculations, formatters
└── docs/                   # Methodology documentation
```

## License

Private - Personal use only.
