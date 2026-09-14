import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@maplibre/maplibre-gl-leaflet'],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_IMAGE_DOMAIN || "localhost",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kadesh-saas.s3.us-east-2.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.us-east-2.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
