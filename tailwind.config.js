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
          50: '#FFFDF0',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
          800: '#854D0E',
          900: '#713F12',
          DEFAULT: '#D4AF37',
        },
        sky: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          950: '#082F49',
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
          black: '#FFFFFF',     // Clean White Container
          dark: '#FAF8F5',      // Soft Pearl White Section Background
          card: '#FFFFFF',      // Pure White Premium Card Container
          sky: '#0284C7',       // Sky Blue Accent
          gold: '#D4AF37',      // Regal Gold
          sand: '#FDFBF7',      // Warm Ivory White
          cream: '#F4EFE6',     // Premium Champagne Cream
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Prompt', 'serif'],
        sans: ['Prompt', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(212, 175, 55, 0.35)',
        'gold-strong': '0 0 45px rgba(234, 179, 8, 0.45)',
        'sky-glow': '0 0 25px rgba(2, 132, 199, 0.35)',
        'tritone-glow': '0 4px 20px rgba(212, 175, 55, 0.25)',
      }
    },
  },
  plugins: [],
}
