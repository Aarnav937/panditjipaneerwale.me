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
          light: '#FFF5E6', // Light Orange background
          dark: '#E67E00',
          darker: '#1a1a1a', // Dark mode background
          card: '#2d2d2d',   // Dark mode card
        }
      }
    },
  },
  plugins: [],
}
