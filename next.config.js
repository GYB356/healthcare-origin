/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Disable SWC as replacement for Babel since you have a custom Babel config
  experimental: {
    forceSwcTransforms: false,
  },
  // Ensure conflicting page routes don't happen
  useFileSystemPublicRoutes: true,
  // Add any other configuration needed for your project
}

module.exports = nextConfig;