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
    proxy: {
      '/trpc': {
        target: process.env.DOCKER ? 'http://backend:3001' : 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
