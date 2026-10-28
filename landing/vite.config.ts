import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: { host: true, port: 5174 },
  build: {
    target: 'es2020',
    assetsDir: 'static',
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
        privacy: resolve(process.cwd(), 'privacy/index.html'),
        cookies: resolve(process.cwd(), 'cookies/index.html'),
      },
    },
  },
});
