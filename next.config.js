/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  poweredByHeader: false,
  distDir: '.next',
  generateEtags: false,
  compress: true,
  webpack: (config, { isServer }) => {
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://truemetrics-n8n-n8n.b5glig.easypanel.host/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 