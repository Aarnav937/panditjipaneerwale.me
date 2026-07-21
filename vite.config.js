import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true
  },
  build: {
    rollupOptions: {
      output: {
        // Keep large libs in separate cacheable chunks
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('/react/')) return 'react-vendor'
            if (id.includes('framer-motion')) return 'motion'
            if (id.includes('@supabase')) return 'supabase'
            if (id.includes('lucide-react')) return 'icons'
            if (id.includes('canvas-confetti')) return 'confetti'
          }
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
