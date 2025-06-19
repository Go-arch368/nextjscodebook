// next.config.ts
import type { NextConfig } from 'next';
import initializeBundleAnalyzer from '@next/bundle-analyzer';
import createNextIntlPlugin from 'next-intl/plugin';


const withBundleAnalyzer = initializeBundleAnalyzer({
  enabled: process.env.BUNDLE_ANALYZER_ENABLED === 'true',
});

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // output: 'standalone',
  outputFileTracingIncludes: {
    '/*': ['./registry/**/*'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' }, // Added for Cloudinary
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};



export default withBundleAnalyzer(withNextIntl(nextConfig));