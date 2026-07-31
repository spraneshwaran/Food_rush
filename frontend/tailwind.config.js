/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        dark: {
          900: '#0f0f0f',
          800: '#1a1a1a',
          700: '#242424',
          600: '#2e2e2e',
          500: '#3a3a3a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'slide-in':    'slideIn 0.3s ease-out',
        'fade-in':     'fadeIn 0.4s ease-out',
        'bounce-in':   'bounceIn 0.5s ease-out',
        'pulse-slow':  'pulse 3s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
      },
      keyframes: {
        slideIn:  { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        fadeIn:   { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        bounceIn: { '0%': { transform: 'scale(0.9)', opacity: 0 }, '70%': { transform: 'scale(1.05)' }, '100%': { transform: 'scale(1)', opacity: 1 } },
        shimmer:  { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
      boxShadow: {
        'brand': '0 4px 24px rgba(249,115,22,0.25)',
        'card':  '0 2px 16px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.14)',
      },
    },
  },
  plugins: [],
};
