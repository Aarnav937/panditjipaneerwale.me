/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          orange: '#FF8C00', // Dark Orange
          light: '#FFFDF9', // Warm Ivory background
          dark: '#E67E00',
          darker: '#121212', // Dark mode background
          card: '#1E1E1E',   // Dark mode card
          saffron: '#E25822',
          saffronLight: '#FFF6F0',
          gold: '#D4AF37',
          goldDark: '#AA7C11',
          cream: '#FFFDF9',
          creamCard: '#FFFDF0',
          charcoal: '#121212',
          charcoalCard: '#1E1E1E'
        }
      }
    },
  },
  plugins: [],
}
