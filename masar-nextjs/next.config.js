/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  outputFileTracingIncludes: {
    "*": ["./node_modules/@swc/helpers/esm/**"],
  },
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg'],
  turbopack: {
    root: path.resolve(__dirname),
  },
}

module.exports = nextConfig
