/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#0F172A',
          accent: '#0284C7',
          'accent-hover': '#0369A1',
          glow: 'rgba(2, 132, 199, 0.25)',
        },
        status: {
          ontime: '#10B981',
          'ontime-bg': '#ECFDF5',
          'ontime-border': '#A7F3D0',
          delayed: '#F59E0B',
          'delayed-bg': '#FFFBEB',
          'delayed-border': '#FDE68A',
          critical: '#EF4444',
          'critical-bg': '#FEF2F2',
          'critical-border': '#FECACA',
          neutral: '#64748B',
          'neutral-bg': '#F1F5F9',
          'neutral-border': '#CBD5E1',
        },
        map: {
          bg: '#0B0F19',
          completed: '#0284C7',
          remaining: '#334155',
          train: '#38BDF8',
          pulse: 'rgba(56, 189, 248, 0.4)',
          node: '#94A3B8',
          active: '#F8FAFC',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        floating: '0 10px 25px -3px rgba(15, 23, 42, 0.12), 0 4px 6px -4px rgba(15, 23, 42, 0.05)',
        'map-overlay': '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
      },
      animation: {
        'radar-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
};
