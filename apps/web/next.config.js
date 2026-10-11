/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone output ONLY for Docker/VPS (STANDALONE=1). Vercel/Netlify use
  // their own Next.js runtimes and must NOT get standalone output.
  ...(process.env.STANDALONE ? { output: 'standalone' } : {}),
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },
};

module.exports = nextConfig;
