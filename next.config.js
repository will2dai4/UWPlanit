const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Allow production builds to complete even with ESLint warnings
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Don't fail production builds on type errors (optional, can be removed if you want strict checks)
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "s.gravatar.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
    ],
  },
  experimental: {
    // serverActions are now enabled by default in Next.js 14+
  },
};

module.exports = withPWA(nextConfig);
