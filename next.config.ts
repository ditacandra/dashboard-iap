import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 🚫 Abaikan error ESLint saat build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 🚫 Abaikan error TypeScript saat build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
