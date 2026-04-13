import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp"],
    remotePatterns: [
      { hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
