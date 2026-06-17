/**
 * Configuração do Next.js — imagens remotas, Turbopack e estabilidade do dev server.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // --- Permite imagens do Unsplash nos componentes next/image ---
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
  // Cache webpack desativado apenas fora do Turbopack (npm run dev:webpack)
  ...(process.env.TURBOPACK
    ? {}
    : {
        webpack: (config, { dev }) => {
          if (dev) {
            config.cache = false;
          }
          return config;
        },
      }),
  turbopack: {},
};

export default nextConfig;
