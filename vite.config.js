import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/chat': {
        target: 'https://canteen-recommendation-system.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chat/, '/chat'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/api': {
        target: 'https://ajay-cafe-1.onrender.com',
        changeOrigin: true,
        secure: true,
        // Added simple logging so you can see it working
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Canteen API Request:', req.method, req.url);
          });
        }
      }
    },
  },
})
