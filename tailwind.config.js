/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ui: {
          bg: '#141618',
          panel: '#1a1d20',
          accent: '#4cc9f0',
          accent2: '#00f5d4',
          warn: '#fca311',
        },
      },
      fontFamily: {
        display: ['ui-sans-serif', 'system-ui', 'Inter', 'Avenir', 'Helvetica', 'Arial'],
      },
    },
  },
  plugins: [],
};
module.exports = {
  theme: {
    extend: {
      animation: {
        fadeIn: 'fadeIn 0.5s ease forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
