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
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          orange: '#FF8C00',
          dark: '#E67E00',
          saffron: '#E25822',
          saffronLight: '#FFF6F0',
          gold: '#D4AF37',
          goldDark: '#AA7C11',
          cream: '#FFFDF9',
          creamCard: '#FFFFFF',
          light: '#FFFDF9',
          darker: '#121212',
          card: '#1A1A1A',
          charcoal: '#1C1917',
          muted: '#78716C',
          border: '#E7E5E4',
        }
      },
      borderRadius: {
        card: '1rem',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(28, 25, 23, 0.06), 0 4px 16px rgba(28, 25, 23, 0.04)',
        'soft-hover': '0 4px 12px rgba(28, 25, 23, 0.08), 0 8px 24px rgba(226, 88, 34, 0.08)',
        bar: '0 -4px 20px rgba(28, 25, 23, 0.08)',
      }
    },
  },
  plugins: [],
}
