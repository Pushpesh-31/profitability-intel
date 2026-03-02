import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0B0E14',
        card: '#12161F',
        border: '#1E2530',
        accent: '#C8F04A',
        text: '#E8EDF5',
        muted: '#5A6478',
        competitor: '#F04A8C',
        customer: '#4AF0C8',
        reference: '#F0C84A',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config
