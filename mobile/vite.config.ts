import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command, mode }) => {
  const native = mode === 'native';
  const base = command === 'serve' ? '/' : native ? './' : '/app/';

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        disable: native,
        registerType: 'autoUpdate',
        includeAssets: ['icons/*.png', 'favicon.svg'],
        manifest: {
          name: 'Krokomierz — licznik kroków',
          short_name: 'Krokomierz',
          description: 'Nowoczesny licznik kroków, cele, statystyki i osiągnięcia.',
          lang: 'pl',
          theme_color: '#08090B',
          background_color: '#08090B',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/app/',
          scope: '/app/',
          categories: ['health', 'fitness', 'lifestyle'],
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
          navigateFallback: '/app/index.html',
          cleanupOutdatedCaches: true,
        },
      }),
    ],
    server: { host: true, port: 5173 },
    build: { target: 'es2020', chunkSizeWarningLimit: 1200 },
  };
});
