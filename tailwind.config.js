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
          50: '#F0F9FF',  // Lightest Sky Tint
          100: '#E0F2FE',
          200: '#BAE6FD', // Soft Sky Blue
          300: '#7DD3FC', // Bright Cyan Blue
          400: '#38BDF8', // Electric Sky Blue
          500: '#0EA5E9', // Vivid Royal Blue
          600: '#0284C7', // Deep Sky Blue
          700: '#0369A1', // Ocean Blue
          800: '#075985', // Dark Sky Blue Accent
          900: '#0C4A6E', // Night Sky Blue
        },
        dubai: {
          black: '#034E7B', // Bright Vibrant Sky Blue Background
          dark: '#0267A0',  // Rich Sky Blue Container
          card: '#0284C7',  // Vivid Electric Sky Blue Card
          sand: '#F0F9FF',
          cream: '#E0F2FE',
          emerald: '#0EA5E9',
          navy: '#38BDF8',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Prompt', 'serif'],
        sans: ['Prompt', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(56, 189, 248, 0.65)',
        'gold-strong': '0 0 45px rgba(14, 165, 233, 0.85)',
      }
    },
  },
  plugins: [],
}
