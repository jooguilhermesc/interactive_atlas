import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('d3') || id.includes('topojson')) return 'd3'
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
  },
})
