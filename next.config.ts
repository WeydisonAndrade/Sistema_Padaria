import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Evita instabilidade do painel de devtools durante hot reload
  devIndicators: false,
  // Cache do webpack desativado apenas no modo webpack dev (npm run dev:webpack)
  webpack: (config, { dev }) => {
    if (dev && !process.env.TURBOPACK) {
      config.cache = false;
    }
    return config;
  },
  turbopack: {},
};

export default nextConfig;
