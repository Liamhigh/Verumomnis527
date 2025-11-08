import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: 'apps/web',
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'packages/core/src'),
    },
  },
  // Let Vite use default outDir under apps/web; simpler and safer
})
