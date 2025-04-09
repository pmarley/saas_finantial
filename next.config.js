/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  poweredByHeader: false,
  distDir: '.next',
  generateEtags: false,
  compress: true,
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