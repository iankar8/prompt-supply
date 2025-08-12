/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'images.unsplash.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix for MCP SDK issues in browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        child_process: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
      }
    }
    
    return config
  },
  // Enable experimental features for better performance
  experimental: {
    serverComponentsExternalPackages: ['@modelcontextprotocol/sdk', 'crypto'],
  },
}

module.exports = nextConfig
