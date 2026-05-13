/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 20px 60px rgba(59, 130, 246, 0.18)',
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
      backgroundImage: {
        'dashboard-grid':
          'radial-gradient(circle at top left, rgba(56, 189, 248, 0.16), transparent 30%), radial-gradient(circle at top right, rgba(99, 102, 241, 0.16), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.8), rgba(248,250,252,0.95))',
        'dashboard-grid-dark':
          'radial-gradient(circle at top left, rgba(56, 189, 248, 0.15), transparent 28%), radial-gradient(circle at top right, rgba(168, 85, 247, 0.12), transparent 30%), linear-gradient(180deg, rgba(2,6,23,0.92), rgba(15,23,42,0.94))',
      },
      colors: {
        brand: {
          50: '#eff9ff',
          100: '#dff3ff',
          200: '#bee7ff',
          300: '#8ed7ff',
          400: '#56beff',
          500: '#2a9af0',
          600: '#1d7bd0',
          700: '#175ea8',
          800: '#174f88',
          900: '#184471',
        },
      },
    },
  },
  plugins: [],
};