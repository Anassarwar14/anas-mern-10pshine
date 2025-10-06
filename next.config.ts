import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Unsplash images are served from this domain
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;