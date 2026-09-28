import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@maplibre/maplibre-gl-leaflet"],
  experimental: {
    optimizePackageImports: [
      "@heroui/react",
      "@heroui/system",
      "@heroui/theme",
      "@hugeicons/react",
      "@hugeicons/core-free-icons",
      "framer-motion",
      "gsap",
    ],
  },
  async redirects() {
    return [
      {
        source: "/perfil/ventas",
        destination: "/perfil",
        permanent: false,
      },
      {
        source: "/perfil/ventas/:path*",
        destination: "/perfil",
        permanent: false,
      },
      {
        source: "/comunidad",
        destination: "/conocenos",
        permanent: true,
      },
    ];
  },
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
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
