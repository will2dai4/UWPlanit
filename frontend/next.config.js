/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['cytoscape', 'cytoscape-dagre', 'cytoscape-cose-bilkent'],
  images: {
    domains: [],
  },
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api/v1',
    NEXT_PUBLIC_GRAPH_PAGE_SIZE: process.env.NEXT_PUBLIC_GRAPH_PAGE_SIZE || '200',
  },
}

module.exports = nextConfig

