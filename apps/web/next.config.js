/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: { document: '/~offline' },
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|webp|avif|svg|ico)$/i,
      handler: 'CacheFirst',
      options: { cacheName: 'images', expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 } },
    },
    {
      urlPattern: /^https:\/\/.*\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: { cacheName: 'next-static', expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 } },
    },
    {
      urlPattern: /^http.*\/api\/.*/i,
      handler: 'NetworkFirst',
      options: { cacheName: 'api', networkTimeoutSeconds: 8, expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 } },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
  // Standalone output ONLY for Docker/VPS (STANDALONE=1). Vercel/Netlify use
  // their own Next.js runtimes and must NOT get standalone output.
  ...(process.env.STANDALONE ? { output: 'standalone' } : {}),
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
};

module.exports = withPWA(nextConfig);
