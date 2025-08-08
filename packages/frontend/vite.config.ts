import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Bind to all interfaces for Docker
    port: 3000,
    watch: {
      usePolling: true, // Enable polling for Docker on Windows
      interval: 1000, // Poll every second
    },
    hmr: {
      port: 3000, // Use same port for HMR
    },
    proxy: {
      '/api/trpc': {
        target: process.env.DOCKER ? 'http://backend:3001' : 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
