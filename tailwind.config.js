/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FAF6EF',
          100: '#F5EDDF',
          200: '#E9DABF',
          300: '#DCC59F',
          400: '#CFA76F',
          500: '#B89352', // Bespoke Antique Gold
          600: '#9B783E',
          700: '#7E5F2E',
          800: '#614820',
          900: '#463214',
          DEFAULT: '#B89352',
        },
        luxury: {
          bg: '#FAF9F6',      // Fine Warm Alabaster / Pearl White
          card: '#FFFFFF',    // Crisp Pure White Card
          dark: '#0A0A0A',    // Deep Rich Black Text
          gold: '#997330',    // Rich Dark Antique Gold
          'gold-light': '#F4ECE1', // Soft Champagne Tint
          border: '#DCD6CD',  // High-contrast Warm Border
          subtext: '#262626', // Deep Charcoal Body Text (Very Dark)
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        dubai: {
          black: '#0D0D0D',
          dark: '#141414',
          card: '#1C1917',
          sky: '#B89352',
          gold: '#B89352',
          sand: '#FDFBF7',
          cream: '#F4ECE1',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Prompt', 'serif'],
        sans: ['Prompt', 'sans-serif'],
      },
      boxShadow: {
        'lux-soft': '0 4px 20px -2px rgba(28, 25, 23, 0.05)',
        'lux-card': '0 10px 30px -5px rgba(184, 147, 82, 0.08)',
        'lux-glow': '0 0 25px rgba(184, 147, 82, 0.2)',
      }
    },
  },
  plugins: [],
}
