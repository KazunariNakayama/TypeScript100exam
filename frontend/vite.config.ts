import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(() => {
  const target = process.env.VITE_BACKEND_URL || 'http://localhost:4000'

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 3000,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
          ws: true
        }
      }
    }
  }
})
