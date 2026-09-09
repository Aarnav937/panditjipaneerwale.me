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
        sans: ['Plus Jakarta Sans', 'Outfit', 'Manrope', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        accent: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          orange: '#FF6600',
          orangeDark: '#E64D00',
          dark: '#E64D00',
          saffron: '#FF4D00',
          saffronLight: '#FFF4EB',
          gold: '#D4AF37',
          goldDark: '#B8860B',
          amber: '#F59E0B',
          amberLight: '#FEF3C7',
          cream: '#FFFBF2',
          creamCard: '#FFFFFF',
          light: '#FFFBF2',
          darker: '#090D14',
          card: '#121824',
          cardDark: '#111827',
          charcoal: '#111827',
          muted: '#6B7280',
          border: '#E5E7EB',
          forest: '#14342B',
          spice: '#D95D1E',
        }
      },
      borderRadius: {
        card: '1.25rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(17, 24, 39, 0.05), 0 8px 24px -4px rgba(17, 24, 39, 0.06)',
        'soft-hover': '0 12px 32px -4px rgba(255, 102, 0, 0.15), 0 4px 16px -2px rgba(0, 0, 0, 0.06)',
        'glow-saffron': '0 0 25px -4px rgba(255, 102, 0, 0.4)',
        'glow-gold': '0 0 25px -4px rgba(212, 175, 55, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.06)',
        'gold-glow': '0 4px 20px -2px rgba(212, 175, 55, 0.15)',
        'gold-glow-hover': '0 8px 30px -4px rgba(255, 102, 0, 0.25)',
        bar: '0 -8px 25px rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
