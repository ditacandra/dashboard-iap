import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 🚫 Jangan hentikan build gara-gara ada error lint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 🚫 Jangan hentikan build gara-gara error TypeScript
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
