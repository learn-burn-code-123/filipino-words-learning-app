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
  // Exclude API routes from static export to fix Netlify deployment
  distDir: process.env.BUILD_DIR || '.next',
  // Explicitly exclude API routes from static export
  exportPathMap: async function () {
    return {
      '/': { page: '/' },
    };
  },
}

module.exports = nextConfig
