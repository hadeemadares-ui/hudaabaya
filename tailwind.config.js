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
          100: '#FFF8CC',
          200: '#FFE885',
          300: '#FFD700', // Pure 24K Bright Golden Yellow
          400: '#FFC800', // Ultra Vibrant Royal Dubai Gold
          500: '#FFB700', // Vibrant Deep Amber Gold
          600: '#E69A00', // Rich Golden Honey
          700: '#C77E00', // Warm Royal Amber
          800: '#995C00', // Deep Metallic Gold
          900: '#663C00', // Dark Gold Accent
        },
        dubai: {
          black: '#0D0D0D',
          dark: '#161616',
          card: '#1C1C1E',
          sand: '#FAF8F5',
          cream: '#F4EFEA',
          emerald: '#0B2B26',
          navy: '#0A192F',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Prompt', 'serif'],
        sans: ['Prompt', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(255, 215, 0, 0.45)',
        'gold-strong': '0 0 45px rgba(255, 200, 0, 0.65)',
      }
    },
  },
  plugins: [],
}
