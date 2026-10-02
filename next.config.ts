import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, // Disable Next.js image optimization
  },
};

export default nextConfig;
