/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    console.log('Rewrites called. BACKEND_URL:', process.env.BACKEND_URL)
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:8080'}/api/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
