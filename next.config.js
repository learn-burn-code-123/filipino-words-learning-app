/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  // Ensure trailing slashes for consistent routing
  trailingSlash: true,
  distDir: process.env.BUILD_DIR || '.next'
}

module.exports = nextConfig
