import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false, // Uses public/manifest.webmanifest
      includeAssets: ['manifest.webmanifest', 'icons/*.png', 'icons/*.svg', 'audio/*.ogg', 'flow-loops/*.webm'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,twee,woff2}'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15MB ceiling for Flow loops
        runtimeCaching: [
          {
            // Offline Audio Stems (.ogg)
            urlPattern: /\/audio\/.*\.(?:ogg|mp3|wav)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'kalu-kumara-audio-v1',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Offline Google Flow Cinemagraph Loops (.webm) with HTTP 206 Range Support
            urlPattern: /\/flow-loops\/.*\.webm$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'kalu-kumara-flow-video-v1',
              rangeRequests: true,
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200, 206] },
            },
          },
          {
            // Offline Cormorant Garamond Typography
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'kalu-kumara-fonts-v1',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  assetsInclude: ['**/*.twee', '**/*.webm'],
  server: {
    port: 5173,
    fs: { allow: ['..'] },
  },
});
