import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: undefined,
            },
            // Disable tree-shaking entirely
            treeshake: false,
        },
        // Use esbuild minifier instead of terser
        minify: 'esbuild',
    }
})
