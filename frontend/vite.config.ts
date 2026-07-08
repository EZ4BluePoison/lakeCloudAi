import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
    proxy: {
      '/knowledge-api': {
        target: 'http://192.168.200.61:9090',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/knowledge-api/, ''),
      },
      '/api/v1': {
        target: 'http://localhost:9090',
        changeOrigin: true,
      },
      '/api/auth': {
        target: 'http://localhost:9090',
        changeOrigin: true,
      },
      '/api/admin': {
        target: 'http://localhost:9090',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
