const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["localhost", "lh3.googleusercontent.com", "s.gravatar.com"],
  },
  experimental: {
    // serverActions are now enabled by default in Next.js 14+
  },
};

module.exports = withPWA(nextConfig);
