/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export', // Add static export for better Netlify compatibility
  images: {
    unoptimized: true, // Required for static export
  },
  // Ensure trailing slashes for consistent routing
  trailingSlash: true,
}

module.exports = nextConfig
