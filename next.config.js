/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Remove appDir as it's no longer needed in Next.js 14
  },
  images: {
    domains: ['logos.stockanalysis.com', 'finance.yahoo.com'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    NEXT_PUBLIC_AUTH_REDIRECT: process.env.NEXT_PUBLIC_AUTH_REDIRECT || 'http://test.pearto.com',
  },
}

module.exports = nextConfig
