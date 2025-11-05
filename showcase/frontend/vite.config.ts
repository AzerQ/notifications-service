import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {

    allowedHosts: ['dev-front.azerqtech.pw'],
    host: true,   // 0.0.0.0
    port: 5094,
    // при необходимости HMR за HTTPS:
    // hmr: { host: 'dev-front.azerqtech.pw', protocol: 'wss', clientPort: 443 }

    proxy: {
      '/api': {
        target: 'http://localhost:5093',
        changeOrigin: true,
      },
      '/notificationHub': {
        target: 'http://localhost:5093',
        changeOrigin: true,
        ws: true
      }
    }
  }
})
