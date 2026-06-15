import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // Transpile Auth.js so jose ESM imports bundle correctly on Vercel serverless.
  transpilePackages: ['next-auth', '@auth/core', 'jose'],
  outputFileTracingIncludes: {
    '/api/auth/**/*': ['./node_modules/jose/**/*'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'covers.openlibrary.org' },
      { protocol: 'https', hostname: 'books.google.com' },
      { protocol: 'https', hostname: 'assets.hardcover.app' },
      { protocol: 'https', hostname: '**.hardcover.app' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
};

export default nextConfig;
