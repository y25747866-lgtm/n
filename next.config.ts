
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Use the CJS build of fontkit to avoid SWC build errors
      fontkit: require.resolve('fontkit/dist/main.cjs'),
    };
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
  experimental: {
    // allowedDevOrigins should be a top level flag, not inside experimental
  },
  allowedDevOrigins: [
    "*.cluster-52r6vzs3ujeoctkkxpjif3x34a.cloudworkstations.dev"
  ]
};

export default nextConfig;
