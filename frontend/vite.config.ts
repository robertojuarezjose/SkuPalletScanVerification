import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/PalletScan/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5065',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
