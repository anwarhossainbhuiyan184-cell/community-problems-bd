import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FFFCF5',
        'paper-soft': '#F7F0E1',
        cream: '#F1E6D0',
        ink: '#17231C',
        'ink-muted': '#5A685F',
        line: '#E4DAC7',
        brand: {
          red: '#D6283E',
          'red-dark': '#A81C2F',
          green: '#0F6B4F',
          'green-dark': '#0A4E39',
          yellow: '#F4B400',
          'yellow-soft': '#FFE8A3',
        },
      },
      fontFamily: {
        display: ['"Noto Serif Bengali"', '"Iowan Old Style"', 'Georgia', 'serif'],
        body: ['"Hind Siliguri"', '"Noto Sans Bengali"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 45px -30px rgba(23, 35, 28, 0.35)',
        lift: '0 26px 60px -32px rgba(23, 35, 28, 0.45)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
      },
      animation: {
        'fade-up': 'fade-up 700ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 500ms ease-out both',
        'soft-pulse': 'soft-pulse 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
