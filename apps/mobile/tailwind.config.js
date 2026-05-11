/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0B0B14',
        surface: '#16161E',
        accent: '#7C5CFF',
        bullish: '#22D39E',
        bearish: '#EF4444',
        sideways: '#9CA3AF',
        muted: '#8E8E96',
      },
    },
  },
  plugins: [],
};
