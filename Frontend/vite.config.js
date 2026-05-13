import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
      '/customers': 'http://localhost:8000',
      '/reservations': 'http://localhost:8000',
      '/services': 'http://localhost:8000',
    },
  },
});